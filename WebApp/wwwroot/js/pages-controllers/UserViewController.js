
function UserViewController() {

    this.ViewName = "Users";

    this.API_ControllerName = "Users";

    this.InitView = function () {
        if ($('#tblUsers').length > 0) {
            this.LoadTable();
        }

        $('#btnCreate').click(function (e) {
        e.preventDefault();
        console.log("btnCreate fue clickeado");
        var vc = new UserViewController();
        vc.Create();
        })

        $('#btnUpdate').click(function () {
            var vc = new UserViewController();
            vc.Update();
        })

        $('#btnDelete').click(function () {
            var vc = new UserViewController();
            vc.Delete();
        })
    }

    this.LoadTable = function () {
        var ca = new ControlActions();

        //https://localhost:7190/api/Users/RetrieveAll

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
        columns[8] = { 'data': 'created', title: 'Registro' }

        $("#tblUsers").dataTable({
            "ajax": {
                url: urlService,
                "dataSrc": ""
            },
            "columns": columns
        });

        $('#tblUsers tbody').on('click', 'tr', function () {
            var row = $(this).closest('tr');

            var userDTO = $('#tblUsers').DataTable().row(row).data();

            $('#txtId').val(userDTO.id);
            $('#txtIdentificacion').val(userDTO.identificacion);
            $('#txtNombre').val(userDTO.nombre);
            $('#txtApellido1').val(userDTO.apellido1);
            $('#txtApellido2').val(userDTO.apellido2);
            $('#txtCorreo').val(userDTO.correo);
            $('#txtTelefono').val(userDTO.telefono);
            $('#txtFotoPerfil').val(userDTO.fotoPerfil);

            $('#txtContrasena').val("");

            var onlyDate = userDTO.fechaNacimiento.split("T");
            $('#txtFechaNacimiento').val(onlyDate[0]);

        })

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

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Create";

        ca.PostToAPI(urlEndPoint, userDTO, function () {
            window.location.href = "/Login";
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

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Update";

        ca.PutToAPI(urlEndPoint, userDTO, function () {
            $('#tblUsers').DataTable().ajax.reload();
        })
    }

    this.Delete = function () {
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

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Delete";

        ca.DeleteToAPI(urlEndPoint, userDTO, function () {
            $('#tblUsers').DataTable().ajax.reload();
        })
    }
}

$(document).ready(function () {

    var vc = new UserViewController();
    vc.InitView();

})