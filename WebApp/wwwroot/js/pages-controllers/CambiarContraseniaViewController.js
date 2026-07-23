function CambiarContraseniaViewController() {

    this.API_ControllerName = "Users";
    this.correoActual = null;

    this.InitView = function () {
        var self = this;

        //Conecta los botones del HTML con las funciones del controlador
        $('#formSolicitar').submit(function (e) {
            e.preventDefault();
            self.SolicitarCodigo();
        });

        $('#formCambiar').submit(function (e) {
            e.preventDefault();
            self.CambiarContrasena();
        });

        $('#btnReenviarCodigo').click(function (e) {
            e.preventDefault();
            self.SolicitarCodigo(true);
        });
    }

    this.SolicitarCodigo = function (esReenvio) {
        var self = this;
        var correo = $('#txtCorreo').val();

        // Validación correo faltante
        if (!correo) {
            Swal.fire({ icon: 'warning', title: 'Falta el correo', text: 'Ingresa tu correo electrónico.' });
            return;
        }

        self.correoActual = correo;

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/SolicitarCambioContrasena/" + encodeURIComponent(correo);

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Código enviado',
                    text: 'Revisa tu correo electrónico.'
                });

                if (!esReenvio) {
                    $('#formSolicitar').hide();
                    $('#formCambiar').show();
                    $('#descPaso').text('Ingresa el código recibido y tu nueva contraseña');
                }
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo enviar el código.";
                Swal.fire({ icon: 'error', title: 'Oops...', text: message });
            }
        });
    }

    this.CambiarContrasena = function () {
        var self = this;

        var otp = $('#txtOtp').val();
        var nuevaContrasena = $('#txtNuevaContrasena').val();
        var confirmarContrasena = $('#txtConfirmarContrasena').val();

        if (nuevaContrasena !== confirmarContrasena) {
            Swal.fire({ icon: 'warning', title: 'Las contraseñas no coinciden', text: 'Verifica que ambas contraseñas sean iguales.' });
            return;
        }

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/ConfirmarCambioContrasena/"
            + encodeURIComponent(self.correoActual) + "/" + otp + "/" + encodeURIComponent(nuevaContrasena);

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Listo!',
                    text: 'Tu contraseña fue actualizada correctamente.'
                }).then(function () {
                    window.location.href = "/Login";
                });
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo cambiar la contraseña.";
                Swal.fire({ icon: 'error', title: 'Oops...', text: message });
            }
        });
    }
}

$(document).ready(function () {
    var vc = new CambiarContraseniaViewController();
    vc.InitView();
});