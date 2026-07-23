function LoginViewController() {

    this.API_ControllerName = "Users";
    this.currentUserId = null;

    //Se enlaza las funciones a los botones del HTML
    this.InitView = function () {
        var self = this;

        $('#btnIngresar').click(function (e) {
            e.preventDefault();
            self.ValidarCredenciales();
        });

        $('#btnVerificarOtp').click(function (e) {
            e.preventDefault();
            self.ValidarOtp();
        });

        $('#btnReenviarOtp').click(function (e) {
            e.preventDefault();
            self.ReenviarOtp();
        });
    }

    this.ValidarCredenciales = function () {
        // se guarda una referencia a la instancia actual del controlador
        var self = this;

        var correo = $('#txtCorreo').val();
        var contrasena = $('#txtContrasena').val();

        var ca = new ControlActions();
        //Codifica el correo y contrasena para ser mas seguro
        var urlEndPoint = this.API_ControllerName + "/Login/" + encodeURIComponent(correo) + "/" + encodeURIComponent(contrasena);

        //Usamos GetToApi ya que es una consulta, no una creación/modificación
        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (response) {
                //Guarda ID del usuario actual para usarlo en la validación del OTP
                self.currentUserId = response.id;

                //Mostramos el panel de OTP y ocultamos el de login
                $('#panelLogin').hide();
                $('#panelOtp').show();
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "Correo o contraseña incorrectos.";
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: message
                });
            }
        });
    }

    this.ValidarOtp = function () {
        var self = this;

        //Concatenar los 6 dígitos ingresados
        var otp = "";
        $('.otp-box input').each(function () {
            otp += $(this).val();
        });

        var ca = new ControlActions();
        //Concatena los datos para ser validado en el Backend
        var urlEndPoint = this.API_ControllerName + "/ValidarOtp/" + self.currentUserId + "/" + otp;

        //Mensajes de Error y exito usando SweetAlert2
        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: 'Inicio de sesión exitoso.'
                }).then(function () {
                    window.location.href = "/PanelAdministrador";
                });
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "Código OTP incorrecto o expirado.";
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: message
                });
            }
        });
    }

    //Reenvia el código OTP al correo del usuario en caso de que no lo haya recibido o haya expirado
    this.ReenviarOtp = function () {
        var self = this;

        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/GenerarOtp/" + self.currentUserId;

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Código reenviado',
                    text: 'Revisa tu correo nuevamente.'
                });
            },
            error: function (jqXHR) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'No se pudo reenviar el código.'
                });
            }
        });
    }
}

$(document).ready(function () {
    var vc = new LoginViewController();
    vc.InitView();
});