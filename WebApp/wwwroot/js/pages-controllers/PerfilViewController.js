function PerfilViewController() {

    this.API_ControllerName = "Users";
    this.ROL_ADMIN = 1;
    this.ROL_DISTRIBUIDOR = 2;
    this.nombresRol = { 1: 'Administrador', 2: 'Distribuidor' };

    this.menuAdmin = [
        { texto: 'Dashboard', pagina: '/PanelAdministrador' },
        { texto: 'Usuarios', pagina: '/GestionDeUsuarios' },
        { texto: 'Turbinas', pagina: '/GestionDeTurbinas' },
        { texto: 'Mantenimiento', pagina: '/RegistroDeMantenimiento' },
        { texto: 'Distribución', pagina: '/PortalDistribuidor' },
        { texto: 'Almacén Central', pagina: '/AlmacenCentral' },
        { texto: 'Reportes', pagina: '/ReporteDeFacturacion' },
        { texto: 'Auditoría', pagina: '/Auditoria' }
    ];

    this.menuDistribuidor = [
        { texto: 'Dashboard', pagina: '/DashboardDistribuidor' },
        { texto: 'Mis Solicitudes', pagina: '/PortalDistribuidor' },
        { texto: 'Reportes', pagina: '/ReporteDeFacturacion' }
    ];

    this.InitView = function () {
        var self = this;
        var usuario = self.ObtenerUsuarioActual();

        //Gate de la página: cualquier usuario logueado puede ver su propio perfil
        if (!usuario) {
            window.location.href = "/Login";
            return;
        }

        self.usuario = usuario;

        self.RenderSidebar(usuario);
        self.RenderHeader(usuario);
        self.CargarPerfil(usuario.id);

        $('#formPerfil').submit(function (e) {
            e.preventDefault();
            self.GuardarCambios();
        });
    };

    this.ObtenerUsuarioActual = function () {
        var data = sessionStorage.getItem('usuarioActual');
        return data ? JSON.parse(data) : null;
    };

    this.RenderSidebar = function (usuario) {
        var self = this;
        var rolId = usuario.rol ? usuario.rol.id : null;
        var menu = rolId === self.ROL_DISTRIBUIDOR ? self.menuDistribuidor : self.menuAdmin;

        var $sidebar = $('#sidebarMenu');

        menu.forEach(function (item) {
            $sidebar.append('<a class="s-item" href="' + item.pagina + '">' + item.texto + '</a>');
        });

        $sidebar.append('<a class="s-item active" href="/Perfil">Mi Perfil</a>');
        $sidebar.append('<a class="s-item logout" href="/Login">Cerrar sesión</a>');
    };

    this.RenderHeader = function (usuario) {
        var self = this;
        var nombreCompleto = ((usuario.nombre || '') + ' ' + (usuario.apellido1 || '')).trim();
        var iniciales = ((usuario.nombre ? usuario.nombre[0] : '') + (usuario.apellido1 ? usuario.apellido1[0] : '')).toUpperCase();
        var rolNombre = (usuario.rol && self.nombresRol[usuario.rol.id]) || '';

        $('#headerAvatar').text(iniciales || '--');
        $('#headerNombre').text(nombreCompleto || '-');
        $('#headerRol').text(rolNombre);

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

        var urlEndPoint = self.API_ControllerName + "/Update?usuarioAccionId=" + self.usuario.id;

        ca.PutToAPI(urlEndPoint, userDTO, function () {
            //Actualiza la sesión ligera para que el resto de la app refleje los datos nuevos
            self.usuario.nombre = userDTO.nombre;
            self.usuario.apellido1 = userDTO.apellido1;
            self.usuario.apellido2 = userDTO.apellido2;
            self.usuario.correo = userDTO.correo;

            sessionStorage.setItem('usuarioActual', JSON.stringify(self.usuario));
            self.RenderHeader(self.usuario);
        });
    };
}

$(document).ready(function () {
    var vc = new PerfilViewController();
    vc.InitView();
});
