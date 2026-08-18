var charts = {};

function DashboardDistribuidorViewController() {

    this.API_ControllerName = "SolicitudCompra";
    this.ROL_DISTRIBUIDOR = 2;
    this.LIMITE_SOLICITUDES_ANIO = 6;

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

    this.InitView = function () {
        var self = this;
        var usuario = self.ObtenerUsuarioActual();

        //Gate de la página: solo un usuario logueado con Rol Distribuidor (Id 2) puede ver este dashboard
        if (!usuario || !usuario.rol || usuario.rol.id !== self.ROL_DISTRIBUIDOR) {
            window.location.href = "/Login";
            return;
        }

        self.RenderUsuario(usuario);
        self.LoadData(usuario);
    };

    this.ObtenerUsuarioActual = function () {
        var data = sessionStorage.getItem('usuarioActual');
        return data ? JSON.parse(data) : null;
    };

    this.RenderUsuario = function (usuario) {
        var nombreCompleto = ((usuario.nombre || '') + ' ' + (usuario.apellido1 || '')).trim();
        var iniciales = ((usuario.nombre ? usuario.nombre[0] : '') + (usuario.apellido1 ? usuario.apellido1[0] : '')).toUpperCase();

        $('.avatar-circle').text(iniciales || 'DI');
        $('.user-name').text(nombreCompleto || 'Distribuidor');
        $('.user-role').text((usuario.rol && usuario.rol.nombreRol) || 'Distribuidor');

        var hoy = new Date();
        $('#periodoActual').text(this.nombresMesesLargo[hoy.getMonth()] + ' ' + hoy.getFullYear());
    };

    this.LoadData = function (usuario) {
        var self = this;
        var ca = new ControlActions();

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(self.API_ControllerName + "/RetrieveAll")
        }).done(function (lstSolicitudes) {
            var propias = (lstSolicitudes || []).filter(function (s) {
                return s.usuario && s.usuario.id === usuario.id;
            });
            self.ProcesarDatos(propias);
        }).fail(function () {
            console.error('Error al cargar las solicitudes del distribuidor');
        });
    };

    this.ProcesarDatos = function (solicitudes) {
        var self = this;
        var anioActual = new Date().getFullYear();

        var solicitudesDelAnio = solicitudes.filter(function (s) {
            return s.anioSolicitado === anioActual;
        });

        var solicitudesActivas = solicitudesDelAnio.filter(function (s) {
            return s.estado !== 'CANCELADA';
        }).length;

        var cupoDisponible = Math.max(self.LIMITE_SOLICITUDES_ANIO - solicitudesActivas, 0);

        var energiaCompradaAnio = 0;
        solicitudesDelAnio.forEach(function (s) {
            if (s.estado === 'PROCESADA') energiaCompradaAnio += Number(s.cantidadMWh);
        });

        var ultima = self.ObtenerUltimaSolicitud(solicitudes);

        // KPIs
        $('#kpiSolicitudesActivas').html(solicitudesActivas + ' <span style="font-size:11px;color:#9ca3af;">/ ' + self.LIMITE_SOLICITUDES_ANIO + '</span>');
        $('#kpiSolicitudesActivasDelta').text(solicitudesDelAnio.length + ' solicitudes registradas en ' + anioActual);

        $('#kpiCupoDisponible').html(cupoDisponible + ' <span>solicitudes</span>');
        $('#kpiCupoDisponibleDelta').text('de ' + self.LIMITE_SOLICITUDES_ANIO + ' solicitudes anuales');
        $('#kpiCupoDisponibleDelta').attr('class', 'kpi-delta ' + (cupoDisponible === 0 ? 'gray' : ''));

        $('#kpiEnergiaComprada').html(Math.round(energiaCompradaAnio).toLocaleString() + ' <span>MWh</span>');
        $('#kpiEnergiaCompradaDelta').text('Aprobada en ' + anioActual);

        if (ultima) {
            $('#kpiUltimaSolicitud').text(self.nombresMesesCorto[ultima.mesSolicitado - 1] + ' ' + ultima.anioSolicitado);
            $('#kpiUltimaSolicitudDelta').text(self.nombresEstado[ultima.estado] || ultima.estado);
        } else {
            $('#kpiUltimaSolicitud').text('N/D');
            $('#kpiUltimaSolicitudDelta').text('Sin solicitudes registradas');
        }

        self.InitChart(solicitudesDelAnio, anioActual);
        self.RenderTabla(solicitudes);
    };

    this.ObtenerUltimaSolicitud = function (solicitudes) {
        if (!solicitudes.length) return null;

        var ordenadas = solicitudes.slice().sort(function (a, b) {
            if (a.anioSolicitado !== b.anioSolicitado) return b.anioSolicitado - a.anioSolicitado;
            return b.mesSolicitado - a.mesSolicitado;
        });

        return ordenadas[0];
    };

    this.InitChart = function (solicitudesDelAnio, anioActual) {
        var self = this;

        if (charts.mwhSolicitados) charts.mwhSolicitados.destroy();

        var totalesPorMes = new Array(12).fill(0);
        solicitudesDelAnio.forEach(function (s) {
            totalesPorMes[s.mesSolicitado - 1] += Number(s.cantidadMWh);
        });

        var ctx = document.getElementById('mwhSolicitadosChart');
        if (!ctx) return;

        charts.mwhSolicitados = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: self.nombresMesesCorto,
                datasets: [{
                    label: 'MWh Solicitados (' + anioActual + ')',
                    data: totalesPorMes,
                    backgroundColor: '#2563eb',
                    borderRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0', drawBorder: false },
                        ticks: { font: { size: 9 }, color: '#9ca3af' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9 }, color: '#9ca3af' }
                    }
                }
            }
        });
    };

    this.RenderTabla = function (solicitudes) {
        var self = this;

        var ultimas5 = solicitudes.slice().sort(function (a, b) {
            if (a.anioSolicitado !== b.anioSolicitado) return b.anioSolicitado - a.anioSolicitado;
            return b.mesSolicitado - a.mesSolicitado;
        }).slice(0, 5);

        var $tbody = $('#tbodyUltimasSolicitudes');
        $tbody.empty();

        if (!ultimas5.length) {
            $tbody.append('<tr><td colspan="3" style="text-align:center;color:#9ca3af;">Sin solicitudes registradas</td></tr>');
            return;
        }

        ultimas5.forEach(function (s) {
            var claseTag = self.claseEstado[s.estado] || 'estado-cancelada';
            var textoEstado = self.nombresEstado[s.estado] || s.estado;

            $tbody.append(
                '<tr>' +
                '<td>' + self.nombresMesesCorto[s.mesSolicitado - 1] + ' ' + s.anioSolicitado + '</td>' +
                '<td>' + Number(s.cantidadMWh).toLocaleString() + ' MWh</td>' +
                '<td><span class="estado-tag ' + claseTag + '">' + textoEstado + '</span></td>' +
                '</tr>'
            );
        });
    };
}

$(document).ready(function () {
    var vc = new DashboardDistribuidorViewController();
    vc.InitView();
});
