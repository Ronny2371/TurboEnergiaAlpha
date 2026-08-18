function AuditoriaViewController() {

    this.API_ControllerName = "Auditoria";

    this.InitView = function () {
        var self = this;
        var ca = new ControlActions();
        var usuario = self.ObtenerUsuarioActual();

        //Gate de la página: solo un usuario logueado con Rol Administrador (Id 1) puede ver la auditoría
        if (!usuario || !usuario.rol || usuario.rol.id !== 1) {
            window.location.href = "/Login";
            return;
        }

        if ($('#tblAuditoria').length > 0) {
            this.LoadTable();
        }

        $('#btnAplicarFiltros').click(function (e) {
            e.preventDefault();
            $('#tblAuditoria').DataTable().ajax.reload();
        });

        $('#btnLimpiarFiltros').click(function (e) {
            e.preventDefault();
            $('#selFiltroEntidad').val('');
            $('#txtFechaInicio').val('');
            $('#txtFechaFin').val('');
            $('#tblAuditoria').DataTable().ajax.reload();
        });
    }

    this.ObtenerUsuarioActual = function () {
        var data = sessionStorage.getItem('usuarioActual');
        return data ? JSON.parse(data) : null;
    }

    this.LoadTable = function () {
        var ca = new ControlActions();
        var endPoint = this.API_ControllerName + "/RetrieveAll";

        var columns = [];
        columns[0] = { data: 'id', title: 'Id' };
        columns[1] = {
            data: 'usuario', title: 'Usuario',
            render: function (usuario) {
                if (!usuario) return 'N/D';
                return usuario.nombre + ' ' + usuario.apellido1;
            }
        };
        columns[2] = { data: 'entidadModificada', title: 'Entidad' };
        columns[3] = { data: 'campoModificado', title: 'Campo' };
        columns[4] = { data: 'valorAnterior', title: 'Valor Anterior' };
        columns[5] = { data: 'valorNuevo', title: 'Valor Nuevo' };
        columns[6] = { data: 'fechaEvento', title: 'Fecha' };
        columns[7] = {
            data: 'horaEvento', title: 'Hora',
            render: function (horaEvento) {
                if (!horaEvento) return '';
                return horaEvento.substring(0, 5);
            }
        };

        $("#tblAuditoria").dataTable({
            "ajax": {
                url: ca.GetUrlApiService(endPoint),
                "dataSrc": "",
                "data": function (d) {
                    d.entidad = $('#selFiltroEntidad').val();
                    d.fechaInicio = $('#txtFechaInicio').val();
                    d.fechaFin = $('#txtFechaFin').val();
                }
            },
            "columns": columns,
            "order": [[6, 'desc'], [7, 'desc']]
        });
    }
}

$(document).ready(function () {
    var vc = new AuditoriaViewController();
    vc.InitView();
})