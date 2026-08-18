function PerfilViewController() {

    this.API_ControllerName = "Users";

    this.InitView = function () {
        var self = this;
        var usuario = self.ObtenerUsuarioActual();

        //Gate de la página: cualquier usuario logueado puede ver su propio perfil
        if (!usuario) {
            window.location.href = "/Login";
            return;
        }

        self.usuario = usuario;

        self.RenderPerfilLateral(usuario);
        self.CargarPerfil(usuario.id);

        $('#formPerfil').submit(function (e) {
            e.preventDefault();
            self.GuardarCambios();
        });

        $('#btnCambiarContrasena').click(function () {
            self.AbrirModalContrasena();
        });

        $('#btnCerrarModalContrasena').click(function () {
            self.CerrarModalContrasena();
        });

        $('#btnCancelarContrasena').click(function () {
            self.CerrarModalContrasena();
        });

        $('#btnEnviarCodigoOtp').click(function () {
            self.EnviarCodigoOtp();
        });

        $('#btnReenviarCodigoPerfil').click(function (e) {
            e.preventDefault();
            self.EnviarCodigoOtp(true);
        });

        $('#btnConfirmarCambioContrasena').click(function () {
            self.ConfirmarCambioContrasena();
        });
    };

    this.ObtenerUsuarioActual = function () {
        var data = sessionStorage.getItem('usuarioActual');
        return data ? JSON.parse(data) : null;
    };

    //Llena solo la tarjeta lateral (avatar grande, nombre, badge de rol) - el header de arriba ya lo llena ca.RellenarHeaderUsuario()
    this.RenderPerfilLateral = function (usuario) {
        var nombreCompleto = ((usuario.nombre || '') + ' ' + (usuario.apellido1 || '')).trim();
        var iniciales = ((usuario.nombre ? usuario.nombre[0] : '') + (usuario.apellido1 ? usuario.apellido1[0] : '')).toUpperCase();
        var rolNombre = (usuario.rol && usuario.rol.nombreRol) || '';

        $('#perfilAvatar').text(iniciales || '--');
        $('#perfilNombreCompleto').text(nombreCompleto || '-');
        $('#perfilRolBadge').text(rolNombre);
    };

    this.CargarPerfil = function (usuarioId) {
        var self = this;
        var ca = new ControlActions();

        ca.GetToApi(self.API_ControllerName + "/RetrieveById/" + usuarioId, function (response) {
            self.CargarFormulario(response);
        });
    };

    this.CargarFormulario = function (userDTO) {
        $('#txtIdentificacion').val(userDTO.identificacion);
        $('#txtNombre').val(userDTO.nombre);
        $('#txtApellido1').val(userDTO.apellido1);
        $('#txtApellido2').val(userDTO.apellido2);
        $('#txtCorreo').val(userDTO.correo);
        $('#txtTelefono').val(userDTO.telefono);
        $('#txtFotoPerfil').val(userDTO.fotoPerfil);

        if (userDTO.fechaNacimiento) {
            $('#txtFechaNacimiento').val(userDTO.fechaNacimiento.split('T')[0]);
        }

        if (userDTO.created) {
            var fecha = new Date(userDTO.created);
            $('#perfilMiembroDesde').text('Miembro desde ' + fecha.toLocaleDateString());
        }
    };

    this.GuardarCambios = function () {
        var self = this;
        var ca = new ControlActions();

        var userDTO = {};
        userDTO.id = self.usuario.id;
        userDTO.identificacion = $('#txtIdentificacion').val();
        userDTO.nombre = $('#txtNombre').val();
        userDTO.apellido1 = $('#txtApellido1').val();
        userDTO.apellido2 = $('#txtApellido2').val();
        userDTO.correo = $('#txtCorreo').val();
        userDTO.telefono = $('#txtTelefono').val();
        userDTO.fechaNacimiento = $('#txtFechaNacimiento').val();
        userDTO.fotoPerfil = $('#txtFotoPerfil').val();
        userDTO.contrasena = '';

        var urlEndPoint = self.API_ControllerName + "/Update?usuarioAccionId=" + self.usuario.id;

        ca.PutToAPI(urlEndPoint, userDTO, function () {
            //Actualiza la sesión ligera para que el resto de la app refleje los datos nuevos
            self.usuario.nombre = userDTO.nombre;
            self.usuario.apellido1 = userDTO.apellido1;
            self.usuario.apellido2 = userDTO.apellido2;
            self.usuario.correo = userDTO.correo;

            sessionStorage.setItem('usuarioActual', JSON.stringify(self.usuario));

            var ca2 = new ControlActions();
            ca2.RellenarHeaderUsuario();
        });
    };

    //===== Cambiar contraseña con OTP (modal) =====

    this.AbrirModalContrasena = function () {
        var self = this;

        $('#correoDestinoOtp').text(self.usuario.correo);
        $('#pasoSolicitarOtp').show();
        $('#pasoConfirmarOtp').hide();
        $('#txtOtpPerfil').val('');
        $('#txtNuevaContrasenaPerfil').val('');
        $('#txtConfirmarContrasenaPerfil').val('');

        $('#modalCambiarContrasena').css('display', 'flex');
    };

    this.CerrarModalContrasena = function () {
        $('#modalCambiarContrasena').css('display', 'none');
    };

    this.EnviarCodigoOtp = function (esReenvio) {
        var self = this;
        var ca = new ControlActions();
        var urlEndPoint = self.API_ControllerName + "/SolicitarCambioContrasena/" + encodeURIComponent(self.usuario.correo);

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Código enviado',
                    text: 'Revisa tu correo electrónico.'
                });

                if (!esReenvio) {
                    $('#pasoSolicitarOtp').hide();
                    $('#pasoConfirmarOtp').show();
                }
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo enviar el código.";
                Swal.fire({ icon: 'error', title: 'Oops...', text: message });
            }
        });
    };

    this.ConfirmarCambioContrasena = function () {
        var self = this;

        var otp = $('#txtOtpPerfil').val();
        var nuevaContrasena = $('#txtNuevaContrasenaPerfil').val();
        var confirmarContrasena = $('#txtConfirmarContrasenaPerfil').val();

        if (!otp || !nuevaContrasena || !confirmarContrasena) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa el código y la nueva contraseña.' });
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            Swal.fire({ icon: 'warning', title: 'Las contraseñas no coinciden', text: 'Verifica que ambas contraseñas sean iguales.' });
            return;
        }

        var ca = new ControlActions();
        var urlEndPoint = self.API_ControllerName + "/ConfirmarCambioContrasena/"
            + encodeURIComponent(self.usuario.correo) + "/" + otp + "/" + encodeURIComponent(nuevaContrasena);

        $.ajax({
            type: "POST",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: '¡Listo!',
                    text: 'Tu contraseña fue actualizada correctamente.'
                });

                self.CerrarModalContrasena();
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo cambiar la contraseña.";
                Swal.fire({ icon: 'error', title: 'Error', text: message });
            }
        });
    };
}

$(document).ready(function () {
    var vc = new PerfilViewController();
    vc.InitView();
});