var charts = {};

function PanelAdministradorViewController() {

    this.InitView = function () {
        this.LoadData();
    };

    this.LoadData = function () {
        var ca = new ControlActions();
        var self = this;

        //Hacer los AJAX seguidos
        var ajaxTurbinas = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Turbina/RetrieveAll")
        });

        var ajaxMantenimientos = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Mantenimiento/RetrieveAll")
        });

        var ajaxCortes = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("CorteEnergia/RetrieveAll")
        });

        var ajaxSolicitudes = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("SolicitudCompra/RetrieveAll")
        });

        var ajaxAlmacen = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Almacen/RetrieveAll")
        });

        var ajaxUsuarios = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Users/RetrieveAll")
        });

        var ajaxReportes = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("ReporteFacturacion/RetrieveAll")
        });

        //Esperar a que terminen TODOS
        $.when(ajaxTurbinas, ajaxMantenimientos, ajaxCortes, ajaxSolicitudes, ajaxAlmacen, ajaxUsuarios, ajaxReportes)
            .done(function (turbinasData, mantenimientosData, cortesData, solicitudesData, almacenData, usuariosData, reportesData) {

            var lstTurbinas = turbinasData[0];
            var lstMantenimientos = mantenimientosData[0];
            var lstCortes = cortesData[0];
            var lstSolicitudes = solicitudesData[0];
            var almacen = almacenData[0];
            var lstUsuarios = usuariosData[0];
            var lstReportes = reportesData[0];

            console.log('Todos los AJAX del Dashboard terminaron');
            console.log('Turbinas:', lstTurbinas.length);
            console.log('Mantenimientos:', lstMantenimientos.length);
            console.log('Cortes:', lstCortes.length);
            console.log('Solicitudes:', lstSolicitudes.length);
            console.log('Almacén:', almacen);
            console.log('Usuarios:', lstUsuarios.length);
            console.log('Reportes:', lstReportes.length);

            //Procesar datos AQUÍ (una sola vez)
            var hoy = new Date();
            var mesActual = hoy.getMonth();
            var anioActual = hoy.getFullYear();
            var nombresMesesLargo = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            //==================== Turbinas ====================
            var turbinasActivas = lstTurbinas.filter(function (t) {
                return t.estado === "Activa";
            }).length;

            var turbinasFueraServicio = lstTurbinas.filter(function (t) {
                return t.estado === "Fuera de Servicio";
            }).length;

            var totalTurbinas = lstTurbinas.length;
            var turbinasMantenimiento = totalTurbinas - turbinasActivas - turbinasFueraServicio;

            //==================== Producción Hoy ====================
            var porcentajeDisponibilidadDefault = 0.9;
            var capacidadActivaKwh = 0;

            lstTurbinas.forEach(function (turbina) {
                if (turbina.estado === "Activa") {
                    capacidadActivaKwh += turbina.capacidadKwh;
                }
            });

            var produccionHoyMWh = Math.round((capacidadActivaKwh * 10 * porcentajeDisponibilidadDefault) / 1000);

            //==================== Mantenimientos en proceso ====================
            var mantenimientosEnProceso = lstMantenimientos.filter(function (m) {
                return m.estadoMantenimiento === "En Proceso";
            }).length;

            //==================== Solicitudes pendientes ====================
            var solicitudesPendientes = lstSolicitudes.filter(function (s) {
                return s.estado === "PENDIENTE";
            }).length;

            //==================== Ventas del mes ====================
            var reportesDelMes = lstReportes.filter(function (r) {
                var fecha = new Date(r.periodo);
                return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
            });

            var ventasDelMes = 0;
            reportesDelMes.forEach(function (r) {
                ventasDelMes += r.total;
            });

            //==================== Distribuidores activos ====================
            var distribuidoresActivos = lstUsuarios.filter(function (u) {
                return u.rol && u.rol.id === 2;
            }).length;

            //==================== Ocupación del almacén ====================
            var porcentajeOcupacion = almacen.capacidadMaxima > 0 ? Math.round((almacen.almacenado / almacen.capacidadMaxima) * 100) : 0;

            //Actualizar UI
            $('#periodoActual').text(nombresMesesLargo[mesActual] + ' ' + anioActual);

            $('#kpiProduccionHoy').html(produccionHoyMWh.toLocaleString() + ' <span>MWh</span>');
            $('#kpiProduccionDelta').text(turbinasActivas + ' de ' + totalTurbinas + ' turbinas activas');

            $('#kpiAlmacen').html(almacen.almacenado.toLocaleString() + ' <span>MWh</span>');
            $('#kpiAlmacenDelta').text(porcentajeOcupacion + '% de ' + almacen.capacidadMaxima.toLocaleString() + ' MWh de capacidad');

            $('#kpiTurbinasOperativas').html(turbinasActivas + ' <span style="font-size:11px;color:#9ca3af;">/ ' + totalTurbinas + '</span>');
            $('#kpiTurbinasDelta').text(mantenimientosEnProceso + ' en mantenimiento');

            $('#kpiVentasMes').html('$' + Math.round(ventasDelMes).toLocaleString());
            $('#kpiVentasDelta').text(reportesDelMes.length + ' facturas · ' + solicitudesPendientes + ' solicitudes pendientes');

            $('#kpiDistribuidoresActivos').text(distribuidoresActivos);

            self.InitChart({
                turbinasActivas: turbinasActivas,
                turbinasMantenimiento: turbinasMantenimiento,
                turbinasFueraServicio: turbinasFueraServicio,
                lstReportes: lstReportes,
                lstCortes: lstCortes
            });

        }).fail(function () {
            console.error('Error en uno de los AJAX del Dashboard');
        });
    };

    this.InitChart = function (datos) {
        if (charts.turbinasEstado) charts.turbinasEstado.destroy();
        if (charts.ventasMensuales) charts.ventasMensuales.destroy();
        if (charts.cortesEnergia) charts.cortesEnergia.destroy();

        //==================== Dona: Estado de Turbinas ====================
        var ctxTurbinas = document.getElementById('turbinasEstadoChart');
        if (ctxTurbinas) {
            charts.turbinasEstado = new Chart(ctxTurbinas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Activas', 'Mantenimiento', 'Fuera de Servicio'],
                    datasets: [{
                        data: [datos.turbinasActivas, datos.turbinasMantenimiento, datos.turbinasFueraServicio],
                        backgroundColor: ['#2563eb', '#f59e0b', '#ef4444'],
                        borderColor: ['#2563eb', '#f59e0b', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { font: { size: 10 }, color: '#6b7280', padding: 12 }
                        }
                    }
                }
            });
        }

        //==================== Barras: Ventas por Mes ====================
        var nombresMesesCorto = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        var ventasPorMes = {};

        datos.lstReportes.forEach(function (r) {
            var fecha = new Date(r.periodo);
            var clave = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
            if (!ventasPorMes[clave]) ventasPorMes[clave] = 0;
            ventasPorMes[clave] += r.total;
        });

        var clavesOrdenadas = Object.keys(ventasPorMes).sort().slice(-6);
        var labelsVentas = clavesOrdenadas.map(function (clave) {
            var partes = clave.split('-');
            return nombresMesesCorto[parseInt(partes[1]) - 1] + ' ' + partes[0].slice(2);
        });
        var dataVentas = clavesOrdenadas.map(function (clave) {
            return Math.round(ventasPorMes[clave]);
        });

        var ctxVentas = document.getElementById('ventasMensualesChart');
        if (ctxVentas) {
            charts.ventasMensuales = new Chart(ctxVentas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labelsVentas,
                    datasets: [{
                        label: 'Ventas ($)',
                        data: dataVentas,
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
        }

        //==================== Línea: Generación vs. Solicitado ====================
        var ultimosCortes = datos.lstCortes.slice(-8);
        var labelsCortes = ultimosCortes.map(function (c, i) {
            return 'Corte ' + (i + 1);
        });
        var generadaCortes = ultimosCortes.map(function (c) {
            return c.energiaGenerada;
        });
        var solicitadaCortes = ultimosCortes.map(function (c) {
            return c.energiaSolicitada;
        });

        var ctxCortes = document.getElementById('cortesEnergiaChart');
        if (ctxCortes) {
            charts.cortesEnergia = new Chart(ctxCortes.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labelsCortes,
                    datasets: [
                        {
                            label: 'Generada',
                            data: generadaCortes,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointBackgroundColor: '#2563eb',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'Solicitada',
                            data: solicitadaCortes,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.08)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointBackgroundColor: '#f59e0b',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { font: { size: 10 }, color: '#6b7280', padding: 12 }
                        }
                    },
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
        }
    };
}

$(document).ready(function () {
    var vc = new PanelAdministradorViewController();
    vc.InitView();
});
