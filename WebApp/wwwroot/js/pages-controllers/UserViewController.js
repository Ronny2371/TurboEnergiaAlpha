function UserViewController() {

    this.ViewName = "Users";

    this.API_ControllerName = "Users";

    this.InitView = function () {
        var self = this;

        if ($('#tblUsers').length > 0) {
            this.LoadTable();
        }

        $('#btnCreate').click(function (e) {
            e.preventDefault();
            self.LimpiarFormulario();
            $('#modalTitle').text('Agregar Usuario');
            $('#txtContrasena').attr('placeholder', 'Ingrese una contraseña');
            $('#modalOverlay').show();
        });

        $('#btnGuardarModal').click(function (e) {
            e.preventDefault();
            var vc = new UserViewController();
            if ($('#txtId').val()) {
                vc.Update();
            } else {
                vc.Create();
            }
        });

        $('#btnCancelarModal, #btnCerrarModal').click(function (e) {
            e.preventDefault();
            $('#modalOverlay').hide();
        });
    }

    this.LimpiarFormulario = function () {
        $('#txtId').val('');
        $('#txtIdentificacion').val('');
        $('#txtNombre').val('');
        $('#txtApellido1').val('');
        $('#txtApellido2').val('');
        $('#txtCorreo').val('');
        $('#txtTelefono').val('');
        $('#txtFechaNacimiento').val('');
        $('#txtFotoPerfil').val('');
        $('#txtContrasena').val('');
        $('#selRolModal').val('2');
    }

    this.LoadTable = function () {
        var self = this;
        var ca = new ControlActions();

        var endPoint = this.API_ControllerName + "/RetrieveAll";
        var urlService = ca.GetUrlApiService(endPoint)

        var columns = [];
        columns[0] = { 'data': 'id', title: 'Id' }
        columns[1] = { 'data': 'identificacion', title: 'Identificacion' }
        columns[2] = { 'data': 'nombre', title: 'Nombre' }
        columns[3] = { 'data': 'apellido1', title: 'Apellido 1' }
        columns[4] = { 'data': 'apellido2', title: 'Apellido 2' }
        columns[5] = { 'data': 'correo', title: 'Correo' }
        columns[6] = { 'data': 'telefono', title: 'Telefono' }
        columns[7] = { 'data': 'fechaNacimiento', title: 'Fec Nacimiento' }
        columns[8] = {
            'data': 'created',
            title: 'Registro',
            render: function (data) {
                return data ? data.split('T')[0] : '';
            }
        }
        columns[9] = {
            'data': null,
            title: 'Acciones',
            orderable: false,
            render: function (data, type, row) {
                return `
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${row.id}" title="Editar">✎</button>
                        <button class="action-btn delete" data-id="${row.id}" title="Eliminar">🗑</button>
                    </div>
                `;
            }
        }

        var table = $("#tblUsers").dataTable({
            "ajax": {
                url: urlService,
                "dataSrc": function (json) {
                    self.ActualizarEstadisticas(json);
                    return json;
                }
            },
            "columns": columns
        });

        //Botón editar de cada fila
        $('#tblUsers tbody').on('click', '.action-btn.edit', function (e) {
            e.stopPropagation();
            var rowData = table.DataTable().row($(this).closest('tr')).data();
            self.CargarFormulario(rowData);
            $('#modalTitle').text('Editar Usuario');
            $('#txtContrasena').attr('placeholder', 'Dejar en blanco para no cambiar');
            $('#modalOverlay').show();
        });

        //Botón eliminar de cada fila
        $('#tblUsers tbody').on('click', '.action-btn.delete', function (e) {
            e.stopPropagation();
            var rowData = table.DataTable().row($(this).closest('tr')).data();

            Swal.fire({
                icon: 'warning',
                title: '¿Seguro que desea eliminar este usuario?',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            }).then(function (result) {
                if (result.isConfirmed) {
                    var vc = new UserViewController();
                    vc.Delete(rowData);
                }
            });
        });

        //Buscador grande de arriba
        $('#txtBuscarUsuario').on('keyup', function () {
            table.DataTable().search($(this).val()).draw();
        });

        //Filtro por Rol
        $('#selFiltroRol').on('change', function () {
            var rolId = $(this).val();

            if (rolId === "") {
                table.DataTable().search("").columns(1).search("").draw();
                //Quita cualquier filtro custom
                $.fn.dataTable.ext.search.pop();
                table.DataTable().draw();
            } else {
                $.fn.dataTable.ext.search = [];
                $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
                    var usuario = table.DataTable().row(dataIndex).data();
                    return usuario.rol && usuario.rol.id == rolId;
                });
                table.DataTable().draw();
            }
        });

        //Ordenar por fecha de registro (columna 8 = "created")
        var ordenFechaAsc = true;
        $('#btnFiltroFecha').on('click', function () {
            ordenFechaAsc = !ordenFechaAsc;
            table.DataTable().order([8, ordenFechaAsc ? 'asc' : 'desc']).draw();
            $(this).text('Fecha de Registro ' + (ordenFechaAsc ? '▲' : '▼'));
        });
    }

    this.ActualizarEstadisticas = function (usuarios) {
        $('#statTotal').text(usuarios.length);
        $('#statAdmins').text(usuarios.filter(function (u) { return u.rol && u.rol.id === 1; }).length);
        $('#statDistribuidores').text(usuarios.filter(function (u) { return u.rol && u.rol.id === 2; }).length);

        var inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        var nuevos = usuarios.filter(function (u) {
            return new Date(u.created) >= inicioMes;
        }).length;

        $('#statNuevos').text(nuevos);
    }

    this.CargarFormulario = function (userDTO) {
        $('#txtId').val(userDTO.id);
        $('#txtIdentificacion').val(userDTO.identificacion);
        $('#txtNombre').val(userDTO.nombre);
        $('#txtApellido1').val(userDTO.apellido1);
        $('#txtApellido2').val(userDTO.apellido2);
        $('#txtCorreo').val(userDTO.correo);
        $('#txtTelefono').val(userDTO.telefono);
        $('#txtFotoPerfil').val(userDTO.fotoPerfil);
        $('#txtContrasena').val("");
        $('#selRolModal').val(userDTO.rol ? userDTO.rol.id : '2');

        var onlyDate = userDTO.fechaNacimiento.split("T");
        $('#txtFechaNacimiento').val(onlyDate[0]);
    }

    this.Create = function () {
        var userDTO = {}

        userDTO.identificacion = $('#txtIdentificacion').val();
        userDTO.nombre = $('#txtNombre').val();
        userDTO.apellido1 = $('#txtApellido1').val();
        userDTO.apellido2 = $('#txtApellido2').val();
        userDTO.correo = $('#txtCorreo').val();
        userDTO.telefono = $('#txtTelefono').val();
        userDTO.fechaNacimiento = $('#txtFechaNacimiento').val();
        userDTO.fotoPerfil = $('#txtFotoPerfil').val();
        userDTO.contrasena = $('#txtContrasena').val();
        userDTO.rol = { id: parseInt($('#selRolModal').val()) };

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Create?usuarioAccionId=" + ca.GetUsuarioActualId();

        ca.PostToAPI(urlEndPoint, userDTO, function () {
            if ($('#tblUsers').length > 0) {
                $('#modalOverlay').hide();
                $('#tblUsers').DataTable().ajax.reload();
            } else {
                window.location.href = "/Login";
            }
        })
    }

    this.Update = function () {
        var userDTO = {}

        userDTO.id = $('#txtId').val();
        userDTO.identificacion = $('#txtIdentificacion').val();
        userDTO.nombre = $('#txtNombre').val();
        userDTO.apellido1 = $('#txtApellido1').val();
        userDTO.apellido2 = $('#txtApellido2').val();
        userDTO.correo = $('#txtCorreo').val();
        userDTO.telefono = $('#txtTelefono').val();
        userDTO.fechaNacimiento = $('#txtFechaNacimiento').val();
        userDTO.fotoPerfil = $('#txtFotoPerfil').val();
        userDTO.contrasena = $('#txtContrasena').val();
        userDTO.rol = { id: parseInt($('#selRolModal').val()) };

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Update?usuarioAccionId=" + ca.GetUsuarioActualId();

        ca.PutToAPI(urlEndPoint, userDTO, function () {
            $('#modalOverlay').hide();
            $('#tblUsers').DataTable().ajax.reload();
        })
    }

    this.Delete = function (userDTO) {
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Delete?usuarioAccionId=" + ca.GetUsuarioActualId();

        ca.DeleteToAPI(urlEndPoint, userDTO, function () {
            $('#tblUsers').DataTable().ajax.reload();
        })
    }
}

$(document).ready(function () {
    var vc = new UserViewController();
    vc.InitView();
})