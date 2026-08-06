function SolicitudCompraViewController() {

    this.API_ControllerName = "SolicitudCompra";
    this.InitView = function () {
        this.LoadTable();

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
    }

    this.LoadTable = function () {
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/RetrieveAll";

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (lstSolicitudes) {
                CargarUsuarios(function () {
                    RenderTabla(lstSolicitudes);
                    RenderStats(lstSolicitudes);
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

function GetNombreSolicitante(solicitud) {
    var usuarioId = solicitud.usuario ? solicitud.usuario.id : null;
    if (!usuarioId) return 'Usuario desconocido';

    var usuario = (window.usuariosList || []).find(function (u) { return u.id === usuarioId; });

    if (usuario) {
        return usuario.nombre + ' ' + usuario.apellido1 + ' (#' + usuario.id + ')';
    }

    return 'Usuario #' + usuarioId;
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