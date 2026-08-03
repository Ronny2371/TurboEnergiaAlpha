function RegistroViewController() {

    this.API_ControllerName = "Users";

    this.InitView = function () {
        var self = this;

        $('#formRegistro').submit(function (e) {
            e.preventDefault();
            self.Registrar();
        });

        $('#txtContrasena').on('input', function () {
            self.ActualizarRequisitos($(this).val());
        });
    }

    // ===== CHECKLIST DE REQUISITOS EN TIEMPO REAL =====
    this.ActualizarRequisitos = function (pass) {
        this.MarcarRequisito('req-longitud', pass.length >= 8, 'Al menos 8 caracteres');
        this.MarcarRequisito('req-mayuscula', /[A-Z]/.test(pass), 'Al menos una mayúscula');
        this.MarcarRequisito('req-minuscula', /[a-z]/.test(pass), 'Al menos una minúscula');
        this.MarcarRequisito('req-numero', /[0-9]/.test(pass), 'Al menos un número');
    }

    this.MarcarRequisito = function (id, cumple, texto) {
        var el = $('#' + id);
        el.text((cumple ? '✅ ' : '❌ ') + texto);
        el.css('color', cumple ? '#10b981' : '#ef4444');
    }

    this.CumpleRequisitos = function (pass) {
        return pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);
    }

    this.Registrar = function () {
        var self = this;

        var contrasena = $('#txtContrasena').val();
        var confirmarContrasena = $('#txtConfirmarContrasena').val();

        if (!self.CumpleRequisitos(contrasena)) {
            Swal.fire({ icon: 'warning', title: 'Contraseña insegura', text: 'La contraseña no cumple con todos los requisitos indicados.' });
            return;
        }

        if (contrasena !== confirmarContrasena) {
            Swal.fire({ icon: 'warning', title: 'Las contraseñas no coinciden', text: 'Verifica que ambas contraseñas sean iguales.' });
            return;
        }

        var userDTO = {};
        userDTO.identificacion = $('#txtIdentificacion').val();
        userDTO.nombre = $('#txtNombre').val();
        userDTO.apellido1 = $('#txtApellido1').val();
        userDTO.apellido2 = $('#txtApellido2').val();
        userDTO.telefono = $('#txtTelefono').val();
        userDTO.correo = $('#txtCorreo').val();
        userDTO.fechaNacimiento = $('#txtFechaNacimiento').val();
        userDTO.fotoPerfil = $('#txtFotoPerfil').val();
        userDTO.contrasena = contrasena;

        var ca = new ControlActions();
        var urlEndPoint = self.API_ControllerName + "/Create";

        ca.PostToAPI(urlEndPoint, userDTO, function () {
            window.location.href = "/Login";
        });
    }
}

$(document).ready(function () {
    var vc = new RegistroViewController();
    vc.InitView();
});
