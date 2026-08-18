var PRECIO_POR_MWH = 145.50;
var PORCENTAJE_IMPUESTO = 13;

function SolicitudCompraViewController() {

    this.API_ControllerName = "SolicitudCompra";
    this.InitView = function () {
        this.LoadTable();

        $('#tbodySolicitudes').on('click', '.action-btn.factura', function () {
            var id = $(this).data('id');
            VerDesgloseCobro(id);
        });

        $('#tbodySolicitudes').on('click', '.action-btn.edit', function () {
            var id = $(this).data('id');
            var solicitud = window.solicitudesList.find(function (s) { return s.id === id; });
            if (!solicitud) return;

            $('#selMesSolicitado').val(solicitud.mesSolicitado);
            $('#txtAnioSolicitado').val(solicitud.anioSolicitado);
            $('#txtCantidadMWh').val(solicitud.cantidadMWh);
            $('#selEstadoSolicitud').val(solicitud.estado);

            $('#modalTitleSolicitud').text('Editar Solicitud');
            $('#btnCrearSolicitud').text('Actualizar');
            $('#btnCrearSolicitud').data('solicitud-id', id);

            $('#modalOverlaySolicitud').css('display', 'flex');
        });

        $('#tbodySolicitudes').on('click', '.action-btn.delete', function () {
            var id = $(this).data('id');

            Swal.fire({
                icon: 'warning',
                title: '¿Seguro que desea anular esta solicitud?',
                showCancelButton: true,
                confirmButtonText: 'Si',
                cancelButtonText: 'No'
            }).then(function (result) {
                if (result.isConfirmed) {
                    AnularSolicitud(id);
                }
            });
        });

        $('#btnNuevaSolicitud').click(function () {
            CerrarModalSolicitud();
            $('#modalOverlaySolicitud').css('display', 'flex');
        });

        $('#btnCerrarModalSolicitud').click(function () {
            CerrarModalSolicitud();
        });

        $('#btnCrearSolicitud').click(function () {
            GuardarSolicitud();
        });

        var self = this;

        $('#btnAplicarRecorte').click(function () {
            AplicarRecorte(self);
        });

        $('#btnRevertirRecorte').click(function () {
            RevertirRecorte(self);
        });
    }

    this.LoadTable = function () {
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/RetrieveAll";

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (lstSolicitudes) {
                CargarUsuarios(function () {
                    CargarReportes(function () {
                        CargarAlmacen(function () {
                            RenderTabla(lstSolicitudes);
                            RenderStats(lstSolicitudes);
                            RenderRecorte(lstSolicitudes);
                        });
                    });
                });
            },
            error: function (jqHRX) {
                var message = jqHRX.responseJSON ? jqHRX.responseJSON.mensaje : "No se pudieron cargar las solicitudes.";
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: message
                });
            }
        })
    }
}

function CargarUsuarios(callback) {
    var ca = new ControlActions();

    $.ajax({
        type: "GET",
        url: ca.GetUrlApiService("Users/RetrieveAll"),
        success: function (lstUsuarios) {
            window.usuariosList = lstUsuarios;
            callback();
        },
        error: function () {
            window.usuariosList = [];
            callback();
        }
    });
}

function CargarReportes(callback) {
    var ca = new ControlActions();

    $.ajax({
        type: "GET",
        url: ca.GetUrlApiService("ReporteFacturacion/RetrieveAll"),
        success: function (lstReportes) {
            window.reportesList = lstReportes;
            callback();
        },
        error: function () {
            window.reportesList = [];
            callback();
        }
    });
}

function CargarAlmacen(callback) {
    var ca = new ControlActions();

    $.ajax({
        type: "GET",
        url: ca.GetUrlApiService("Almacen/RetrieveAll"),
        success: function (almacen) {
            window.almacenActual = almacen;
            callback();
        },
        error: function () {
            window.almacenActual = null;
            callback();
        }
    });
}

function RenderRecorte(lstSolicitudes) {
    var pendientes = lstSolicitudes.filter(function (s) { return s.estado === "PENDIENTE"; });

    var demandaTotal = 0;
    pendientes.forEach(function (s) {
        demandaTotal += s.cantidadMWhOriginal;
    });

    var almacenado = window.almacenActual ? window.almacenActual.almacenado : 0;

    $('#demandaTotalPendiente').text(demandaTotal.toLocaleString() + ' MWh');
    $('#energiaDisponibleRecorte').text(almacenado.toLocaleString() + ' MWh');

    if (demandaTotal > 0 && almacenado < demandaTotal) {
        var sugerido = Math.floor((almacenado / demandaTotal) * 100);
        $('#porcentajeSugerido').text(sugerido + '%');
        $('#recorteSugeridoWrapper').show();
        $('#recorteMensaje').text('La energía disponible no alcanza para cubrir toda la demanda pendiente. Se sugiere aplicar ' + sugerido + '%.');
        $('#porcentajeCapacidad').val(sugerido);
    } else {
        $('#recorteSugeridoWrapper').hide();
        $('#recorteMensaje').text('La energía disponible alcanza para cubrir el 100% de la demanda pendiente.');
        $('#porcentajeCapacidad').val(100);
    }
}

function AplicarRecorte(vc) {
    var porcentaje = parseInt($('#porcentajeCapacidad').val());

    if (!porcentaje || porcentaje < 1 || porcentaje > 100) {
        Swal.fire({
            icon: 'warning',
            title: 'Porcentaje inválido',
            text: 'Ingresa un porcentaje entre 1 y 100.'
        });
        return;
    }

    Swal.fire({
        icon: 'warning',
        title: '¿Aplicar recorte del ' + porcentaje + '%?',
        text: 'Esto va a reducir la cantidad de energía de todas las solicitudes pendientes y actualizar sus facturas.',
        showCancelButton: true,
        confirmButtonText: 'Si, aplicar',
        cancelButtonText: 'Cancelar'
    }).then(function (result) {
        if (!result.isConfirmed) return;

        var ca = new ControlActions();

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService("Almacen/AplicarRecorte?porcentaje=" + porcentaje),
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Recorte aplicado',
                    text: 'Las solicitudes pendientes fueron actualizadas.'
                });

                vc.LoadTable();
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo aplicar el recorte.";
                Swal.fire({ icon: 'error', title: 'Error', text: message });
            }
        });
    });
}

function RevertirRecorte(vc) {
    Swal.fire({
        icon: 'question',
        title: '¿Volver a los valores originales?',
        text: 'Esto va a restaurar la cantidad pedida originalmente en cada solicitud pendiente recortada.',
        showCancelButton: true,
        confirmButtonText: 'Si, revertir',
        cancelButtonText: 'Cancelar'
    }).then(function (result) {
        if (!result.isConfirmed) return;

        var ca = new ControlActions();

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService("Almacen/RevertirRecorte"),
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Valores restaurados',
                    text: 'Las solicitudes pendientes volvieron a su cantidad original.'
                });

                vc.LoadTable();
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo revertir el recorte.";
                Swal.fire({ icon: 'error', title: 'Error', text: message });
            }
        });
    });
}

function GetNombreSolicitante(solicitud) {
    var usuarioId = solicitud.usuario ? solicitud.usuario.id : null;
    if (!usuarioId) return 'Usuario desconocido';

    var usuario = (window.usuariosList || []).find(function (u) { return u.id === usuarioId; });

    if (usuario) {
        return usuario.nombre + ' ' + usuario.apellido1 + ' (#' + usuario.id + ')';
    }

    return 'Usuario #' + usuarioId;
}

function GetReporteParaSolicitud(solicitud) {
    var usuarioId = solicitud.usuario ? solicitud.usuario.id : null;
    if (!usuarioId) return null;

    return (window.reportesList || []).find(function (r) {
        var periodo = new Date(r.periodo);
        return r.usuarioId === usuarioId &&
            (periodo.getMonth() + 1) === solicitud.mesSolicitado &&
            periodo.getFullYear() === solicitud.anioSolicitado;
    }) || null;
}

function GetDesgloseCobro(solicitud) {
    var reporte = GetReporteParaSolicitud(solicitud);

    if (reporte) {
        var porcentaje = reporte.subtotal > 0 ? Math.round((reporte.impuesto / reporte.subtotal) * 100) : PORCENTAJE_IMPUESTO;
        return {
            precioMWh: reporte.precioMWh,
            subtotal: reporte.subtotal,
            impuesto: reporte.impuesto,
            total: reporte.total,
            porcentajeImpuesto: porcentaje,
            esReal: true
        };
    }

    var subtotal = solicitud.cantidadMWh * PRECIO_POR_MWH;
    var impuesto = subtotal * (PORCENTAJE_IMPUESTO / 100);

    return {
        precioMWh: PRECIO_POR_MWH,
        subtotal: subtotal,
        impuesto: impuesto,
        total: subtotal + impuesto,
        porcentajeImpuesto: PORCENTAJE_IMPUESTO,
        esReal: false
    };
}

function GetEstadoBadge(estado) {
    switch (estado) {
        case "PENDIENTE":
            return { badgeClass: "badge-yellow", dotClass: "badge-dot-yellow", label: "Pendiente" };
        case "PROCESADA":
            return { badgeClass: "badge-green", dotClass: "badge-dot-green", label: "Aprobada" };
        case "BLOQUEADA":
            return { badgeClass: "badge-red", dotClass: "badge-dot-red", label: "Bloqueada" };
        case "CANCELADA":
            return { badgeClass: "badge-red", dotClass: "badge-dot-red", label: "Cancelada" };
        default:
            return { badgeClass: "badge-yellow", dotClass: "badge-dot-yellow", label: estado };
    }
}

function FormatMoney(valor) {
    return '$' + valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function VerDesgloseCobro(id) {
    var solicitud = window.solicitudesList.find(function (s) { return s.id === id; });
    if (!solicitud) return;

    var d = GetDesgloseCobro(solicitud);

    var notaEstimado = d.esReal ? '' :
        '<div style="font-size:11px;color:#9ca3af;font-style:italic;margin-bottom:10px;">Estimado — todavía no hay factura generada para esta solicitud.</div>';

    var html =
        '<div style="text-align:left;">' +
        '<div style="font-weight:700;font-size:15px;margin-bottom:6px;">Desglose de Cobros</div>' +
        notaEstimado +
        '<hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 4px;">' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;color:#6b7280;font-size:13px;">' +
        '<span>Energía Asignada</span><strong style="color:#111;">' + solicitud.cantidadMWh + ' MWh</strong>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #f0f0f0;">' +
        '<span>Precio por MWh</span><strong style="color:#111;">' + FormatMoney(d.precioMWh) + '</strong>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #f0f0f0;">' +
        '<span>Subtotal</span><strong style="color:#111;">' + FormatMoney(d.subtotal) + '</strong>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #f0f0f0;">' +
        '<span>Impuesto (' + d.porcentajeImpuesto + '%)</span><strong style="color:#dc2626;">' + FormatMoney(d.impuesto) + '</strong>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;background:#111;color:#fff;padding:14px 16px;border-radius:8px;margin-top:12px;">' +
        '<span style="font-weight:600;">Total a Pagar</span><strong style="font-size:16px;">' + FormatMoney(d.total) + '</strong>' +
        '</div>' +
        '</div>';

    Swal.fire({
        html: html,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        width: 420
    });
}

function RenderTabla(lstSolicitudes) {
    window.solicitudesList = lstSolicitudes;
    var $tbody = $('#tbodySolicitudes');
    $tbody.empty();

    $.each(lstSolicitudes, function (i, solicitud) {
        var badge = GetEstadoBadge(solicitud.estado);
        var numero = String(i + 1).padStart(3, '0');
        var mesAnio = String(solicitud.mesSolicitado).padStart(2, '0') + ' / ' + solicitud.anioSolicitado;
        var cantidad = solicitud.cantidadMWh + ' MWh';
        var fecha = FormatDate(solicitud.created);

        var d = GetDesgloseCobro(solicitud);
        var precioFinal =
            '<strong>' + FormatMoney(d.total) + '</strong> ' +
            '<button class="action-btn factura" data-id="' + solicitud.id + '" title="Ver desglose de cobro">🧾</button>';

        var acciones = '<button class="action-btn edit" data-id="' + solicitud.id + '" title="Editar">✎</button>';

        if (solicitud.estado === "PENDIENTE") {
            acciones += '<button class="action-btn delete" data-id="' + solicitud.id + '" title="Anular">🗑</button>';
        } else {
            acciones += '<span class="action-disabled">---</span>';
        }

        var fila =
            '<tr>' +
            '<td style="color:#9ca3af;font-size:12px;">' + numero + '</td>' +
            '<td><strong>' + mesAnio + '</strong></td>' +
            '<td>' + cantidad + '</td>' +
            '<td>' + precioFinal + '</td>' +
            '<td><span class="badge ' + badge.badgeClass + '"><span class="badge-dot ' + badge.dotClass + '"></span>' + badge.label + '</span></td>' +
            '<td style="font-size:12px;color:#374151;">' + GetNombreSolicitante(solicitud) + '</td>' +
            '<td style="font-size:12px;color:#6b7280;">' + fecha + '</td>' +
            '<td><div class="action-buttons">' + acciones + '</div></td>' +
            '</tr>';

        $tbody.append(fila);
    });

    $('#paginationInfo').text('Mostrando ' + lstSolicitudes.length + ' de ' + lstSolicitudes.length + ' solicitudes');
}

function RenderStats(lstSolicitudes) {
    var total = lstSolicitudes.length;
    var pendientes = lstSolicitudes.filter(function (s) { return s.estado === "PENDIENTE"; }).length;
    var aprobadas = lstSolicitudes.filter(function (s) { return s.estado === "PROCESADA"; }).length;

    $('#statTotalSolicitudes').text(total);
    $('#statPendientes').text(pendientes);
    $('#statAprobadas').text(aprobadas);

    if (total > 0) {
        $('#statPendientesDelta').text(Math.round((pendientes / total) * 100) + '% del total');
        $('#statAprobadasDelta').text(Math.round((aprobadas / total) * 100) + '% del total');
    } else {
        $('#statPendientesDelta').text('');
        $('#statAprobadasDelta').text('');
    }
}

function AnularSolicitud(id) {
    var solicitud = window.solicitudesList.find(function (s) { return s.id === id; });
    if (!solicitud) return;

    var ca = new ControlActions();

    $.ajax({
        type: "DELETE",
        url: ca.GetUrlApiService("SolicitudCompra/Delete?usuarioAccionId=" + ca.GetUsuarioActualId()),
        data: JSON.stringify(solicitud),
        contentType: "application/json; charset=utf-8",
        success: function () {
            var vc = new SolicitudCompraViewController();
            vc.LoadTable();

            Swal.fire({
                icon: 'success',
                title: 'Solicitud Anulada',
                text: 'La solicitud ha sido anulada correctamente.'
            });
        },
        error: function (jqXHR) {
            var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo anular la solicitud.";
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        }
    });
}

function CerrarModalSolicitud() {
    $('#modalOverlaySolicitud').css('display', 'none');
    $('#selMesSolicitado').val('');
    $('#txtAnioSolicitado').val('');
    $('#txtCantidadMWh').val('');
    $('#selEstadoSolicitud').val('PENDIENTE');

    $('#modalTitleSolicitud').text('Nueva Solicitud');
    $('#btnCrearSolicitud').text('Crear');
    $('#btnCrearSolicitud').data('solicitud-id', '');
}

function GuardarSolicitud() {
    var mes = $('#selMesSolicitado').val();
    var anio = $('#txtAnioSolicitado').val().trim();
    var cantidad = $('#txtCantidadMWh').val().trim();
    var estado = $('#selEstadoSolicitud').val();

    if (!mes || !anio || !cantidad || !estado) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Completa todos los campos antes de guardar la solicitud.'
        });
        return;
    }

    var ca = new ControlActions();
    var isEditing = $('#btnCrearSolicitud').data('solicitud-id');

    var solicitudDTO = {
        usuario: { id: ca.GetUsuarioActualId() },
        mesSolicitado: parseInt(mes),
        anioSolicitado: parseInt(anio),
        cantidadMWh: parseFloat(cantidad),
        estado: estado
    };

    if (isEditing) {
        solicitudDTO.id = parseInt(isEditing);

        var urlEndPoint = "SolicitudCompra/Update?usuarioAccionId=" + ca.GetUsuarioActualId();
        ca.PutToAPI(urlEndPoint, solicitudDTO, function () {
            CerrarModalSolicitud();

            var vc = new SolicitudCompraViewController();
            vc.LoadTable();
        });
    } else {
        ca.PostToAPI("SolicitudCompra/Create?usuarioAccionId=" + ca.GetUsuarioActualId(), solicitudDTO, function () {
            CerrarModalSolicitud();

            var vc = new SolicitudCompraViewController();
            vc.LoadTable();
        });
    }
}

function FormatDate(fechaIso) {
    var d = new Date(fechaIso);
    var dia = String(d.getDate()).padStart(2, '0');
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var anio = d.getFullYear();
    return dia + '/' + mes + '/' + anio;
}

$(document).ready(function () {
    var vc = new SolicitudCompraViewController();
    vc.InitView();
})