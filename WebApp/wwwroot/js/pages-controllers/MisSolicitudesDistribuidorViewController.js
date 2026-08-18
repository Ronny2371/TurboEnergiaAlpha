function MisSolicitudesDistribuidorViewController() {

    this.API_ControllerName = "SolicitudCompra";
    this.ROL_DISTRIBUIDOR = 2;

    //EstadoSolicitud se serializa como texto (JsonStringEnumConverter); se traduce a etiquetas legibles
    this.nombresEstado = {
        PENDIENTE: 'Pendiente',
        PROCESADA: 'Aprobada',
        BLOQUEADA: 'Bloqueada',
        CANCELADA: 'Cancelada'
    };

    this.claseEstado = {
        PENDIENTE: 'estado-pendiente',
        PROCESADA: 'estado-procesada',
        BLOQUEADA: 'estado-bloqueada',
        CANCELADA: 'estado-cancelada'
    };

    this.nombresMesesCorto = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.nombresMesesLargo = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Copia local de las solicitudes ya filtradas por usuario; toda edición se resuelve contra esta copia,
    // nunca contra datos que puedan haber sido manipulados en el DOM.
    this.solicitudes = [];
    this.usuarioActual = null;
    this.solicitudEnEdicion = null;

    this.InitView = function () {
        var self = this;
        var usuario = self.ObtenerUsuarioActual();

        //Gate de la página: solo un usuario logueado con Rol Distribuidor (Id 2) puede ver esta vista
        if (!usuario || !usuario.rol || usuario.rol.id !== self.ROL_DISTRIBUIDOR) {
            window.location.href = "/Login";
            return;
        }

        self.usuarioActual = usuario;
        self.BindEvents();
        self.LoadData(usuario);
    };

    this.ObtenerUsuarioActual = function () {
        var data = sessionStorage.getItem('usuarioActual');
        return data ? JSON.parse(data) : null;
    };

    this.LoadData = function (usuario) {
        var self = this;
        var ca = new ControlActions();

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(self.API_ControllerName + "/RetrieveAll")
        }).done(function (lstSolicitudes) {
            // Solo se muestran/editan las solicitudes creadas por el usuario logueado
            self.solicitudes = (lstSolicitudes || []).filter(function (s) {
                return s.usuario && s.usuario.id === usuario.id;
            });
            self.RenderStats(self.solicitudes);
            self.RenderTabla(self.solicitudes);
        }).fail(function () {
            console.error('Error al cargar las solicitudes del distribuidor');
        });
    };

    this.RenderStats = function (solicitudes) {
        var pendientes = solicitudes.filter(function (s) { return s.estado === 'PENDIENTE'; }).length;
        var aprobadas = solicitudes.filter(function (s) { return s.estado === 'PROCESADA'; }).length;

        $('#statTotalSolicitudes').text(solicitudes.length);
        $('#statPendientes').text(pendientes);
        $('#statAprobadas').text(aprobadas);
    };

    this.RenderTabla = function (solicitudes) {
        var self = this;
        var $tbody = $('#tbodyMisSolicitudes');
        $tbody.empty();

        if (!solicitudes.length) {
            $tbody.append('<tr><td colspan="6" style="text-align:center;color:#9ca3af;">No ha creado solicitudes todavía</td></tr>');
            $('#paginationInfo').text('Mostrando 0 de 0 solicitudes');
            return;
        }

        var ordenadas = solicitudes.slice().sort(function (a, b) {
            if (a.anioSolicitado !== b.anioSolicitado) return b.anioSolicitado - a.anioSolicitado;
            return b.mesSolicitado - a.mesSolicitado;
        });

        ordenadas.forEach(function (s, idx) {
            var claseTag = self.claseEstado[s.estado] || 'estado-cancelada';
            var textoEstado = self.nombresEstado[s.estado] || s.estado;
            var fecha = s.created ? self.FormatearFecha(s.created) : 'N/D';

            // Una solicitud ya Cancelada no tiene sentido volver a "eliminarla"
            var btnEliminar = s.estado === 'CANCELADA'
                ? ''
                : '<button type="button" class="btn-outline-small btn-eliminar-solicitud" data-id="' + s.id + '">Eliminar</button>';

            $tbody.append(
                '<tr>' +
                '<td>' + (idx + 1) + '</td>' +
                '<td>' + self.nombresMesesCorto[s.mesSolicitado - 1] + ' ' + s.anioSolicitado + '</td>' +
                '<td>' + Number(s.cantidadMWh).toLocaleString() + ' MWh</td>' +
                '<td><span class="estado-tag ' + claseTag + '">' + textoEstado + '</span></td>' +
                '<td>' + fecha + '</td>' +
                '<td>' +
                '<button type="button" class="btn-outline-small btn-editar-cantidad" data-id="' + s.id + '">Editar</button> ' +
                btnEliminar +
                '</td>' +
                '</tr>'
            );
        });

        $('#paginationInfo').text('Mostrando ' + ordenadas.length + ' de ' + ordenadas.length + ' solicitudes');
    };

    // Formatea siempre como DD/MM/AAAA, sin depender del locale del navegador
    this.FormatearFecha = function (fecha) {
        var d = new Date(fecha);
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        return dd + '/' + mm + '/' + d.getFullYear();
    };

    // yyyy-MM-dd de hoy en hora local, para no correrse de día al convertir a UTC
    this.ObtenerFechaHoy = function () {
        var hoy = new Date();
        var mm = String(hoy.getMonth() + 1).padStart(2, '0');
        var dd = String(hoy.getDate()).padStart(2, '0');
        return hoy.getFullYear() + '-' + mm + '-' + dd;
    };

    this.BindEvents = function () {
        var self = this;

        $(document).on('click', '.btn-editar-cantidad', function () {
            var id = $(this).data('id');
            self.AbrirModalEditar(id);
        });

        $('#btnCerrarModalEditar').on('click', function () {
            self.CerrarModalEditar();
        });

        $('#btnGuardarCantidad').on('click', function () {
            self.GuardarCantidad();
        });

        $('#btnNuevaSolicitud').on('click', function () {
            self.AbrirModalNueva();
        });

        $('#btnCerrarModalNueva').on('click', function () {
            self.CerrarModalNueva();
        });

        $('#btnCrearSolicitud').on('click', function () {
            self.CrearSolicitud();
        });

        $(document).on('click', '.btn-eliminar-solicitud', function () {
            var id = $(this).data('id');
            self.EliminarSolicitud(id);
        });
    };

    this.AbrirModalNueva = function () {
        $('#selMesSolicitado').val('');
        $('#txtAnioSolicitado').val('');
        $('#txtCantidadMWhNueva').val('');
        $('#modalOverlayNuevaSolicitud').css('display', 'flex');
    };

    this.CerrarModalNueva = function () {
        $('#modalOverlayNuevaSolicitud').css('display', 'none');
    };

    this.CrearSolicitud = function () {
        var self = this;

        var mes = Number($('#selMesSolicitado').val());
        var anio = Number($('#txtAnioSolicitado').val());
        var cantidad = Number($('#txtCantidadMWhNueva').val());

        if (!mes) {
            self.Notificar('Datos incompletos', 'Seleccione el mes de la solicitud.', 'warning');
            return;
        }
        if (!anio) {
            self.Notificar('Datos incompletos', 'Ingrese el año de la solicitud.', 'warning');
            return;
        }
        if (!cantidad || cantidad <= 0) {
            self.Notificar('Cantidad inválida', 'Ingrese una cantidad de energía mayor a 0.', 'warning');
            return;
        }

        // El propietario, el estado inicial y la fecha de solicitud no salen del formulario: el dueño siempre
        // es el usuario logueado, toda solicitud nueva nace en PENDIENTE y la fecha es la del día de creación.
        var payload = {
            usuario: { id: self.usuarioActual.id },
            mesSolicitado: mes,
            anioSolicitado: anio,
            cantidadMWh: cantidad,
            estado: 'PENDIENTE',
            fechaSolicitud: self.ObtenerFechaHoy()
        };

        var ca = new ControlActions();
        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(self.API_ControllerName + "/Create"),
            contentType: "application/json",
            data: JSON.stringify(payload)
        }).done(function () {
            self.CerrarModalNueva();
            self.LoadData(self.usuarioActual);
            self.Notificar('Solicitud creada', 'Su solicitud fue registrada como Pendiente.', 'success');
        }).fail(function () {
            self.Notificar('Error', 'No se pudo crear la solicitud.', 'error');
        });
    };

    this.AbrirModalEditar = function (id) {
        var self = this;

        // La solicitud a editar sale de la copia ya filtrada por usuario; si el id no está ahí, no se abre el modal
        var solicitud = self.solicitudes.find(function (s) { return s.id === id; });
        if (!solicitud) return;

        self.solicitudEnEdicion = solicitud;

        $('#txtMesAnioReadonly').val(self.nombresMesesLargo[solicitud.mesSolicitado - 1] + ' ' + solicitud.anioSolicitado);
        $('#txtEstadoReadonly').val(self.nombresEstado[solicitud.estado] || solicitud.estado);
        $('#txtCantidadMWhEditar').val(solicitud.cantidadMWh);

        $('#modalOverlayEditarCantidad').css('display', 'flex');
    };

    this.CerrarModalEditar = function () {
        $('#modalOverlayEditarCantidad').css('display', 'none');
        this.solicitudEnEdicion = null;
    };

    this.GuardarCantidad = function () {
        var self = this;
        var solicitud = self.solicitudEnEdicion;
        if (!solicitud) return;

        var nuevaCantidad = Number($('#txtCantidadMWhEditar').val());
        if (!nuevaCantidad || nuevaCantidad <= 0) {
            self.Notificar('Cantidad inválida', 'Ingrese una cantidad de energía mayor a 0.', 'warning');
            return;
        }

        // Se reenvía la solicitud tal como llegó del servidor y solo se sobreescribe cantidadMWh;
        // así mes, año, estado y el propietario de la solicitud quedan fuera del alcance de esta edición.
        var payload = Object.assign({}, solicitud, { cantidadMWh: nuevaCantidad });

        var ca = new ControlActions();
        $.ajax({
            type: "PUT",
            url: ca.GetUrlApiService(self.API_ControllerName + "/Update"),
            contentType: "application/json",
            data: JSON.stringify(payload)
        }).done(function () {
            self.CerrarModalEditar();
            self.LoadData(self.usuarioActual);
            self.Notificar('Actualizado', 'La cantidad de energía fue actualizada.', 'success');
        }).fail(function () {
            self.Notificar('Error', 'No se pudo actualizar la solicitud.', 'error');
        });
    };

    this.EliminarSolicitud = function (id) {
        var self = this;

        // No existe un estado "Finalizado" en el enum del sistema (PENDIENTE / PROCESADA / BLOQUEADA / CANCELADA);
        // "eliminar" aquí se traduce a marcar la solicitud como CANCELADA, sin borrarla de la base de datos.
        var solicitud = self.solicitudes.find(function (s) { return s.id === id; });
        if (!solicitud) return;

        var ejecutarCancelacion = function () {
            var payload = Object.assign({}, solicitud, { estado: 'CANCELADA' });
            var ca = new ControlActions();

            $.ajax({
                type: "PUT",
                url: ca.GetUrlApiService(self.API_ControllerName + "/Update"),
                contentType: "application/json",
                data: JSON.stringify(payload)
            }).done(function () {
                self.LoadData(self.usuarioActual);
                self.Notificar('Solicitud cancelada', 'La solicitud fue marcada como Cancelada.', 'success');
            }).fail(function () {
                self.Notificar('Error', 'No se pudo cancelar la solicitud.', 'error');
            });
        };

        if (window.Swal) {
            Swal.fire({
                title: '¿Eliminar esta solicitud?',
                text: 'Quedará marcada como Cancelada y no podrá revertirse desde esta vista.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(function (resultado) {
                if (resultado.isConfirmed) ejecutarCancelacion();
            });
        } else if (confirm('¿Eliminar esta solicitud? Quedará marcada como Cancelada.')) {
            ejecutarCancelacion();
        }
    };

    this.Notificar = function (titulo, texto, icono) {
        if (window.Swal) {
            Swal.fire(titulo, texto, icono);
        } else {
            alert(titulo + ': ' + texto);
        }
    };
}

$(document).ready(function () {
    var vc = new MisSolicitudesDistribuidorViewController();
    vc.InitView();
});
