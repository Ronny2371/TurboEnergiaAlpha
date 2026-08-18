var currentView = 'dia';
var charts = {};

function AlmacenCentralViewController() {

    this.InitView = function () {
        this.LoadData();
        this.InitChart();
        this.InitToggle();
    };

    this.LoadData = function () {
        var ca = new ControlActions();
        var self = this;

        //Hacer los AJAX seguidos
        var ajaxAlmacen = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Almacen/RetrieveAll")
        });

        var ajaxSolicitud = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("SolicitudCompra/RetrieveAll")
        });

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
        })

        //Esperar a que terminen TODOS
        $.when(ajaxAlmacen, ajaxTurbinas, ajaxMantenimientos,ajaxCortes,ajaxSolicitud).done(function (almacenData, turbinasData, mantenimientosData,cortesData, solicitudData) {

            var almacen = almacenData[0];
            var lstTurbinas = turbinasData[0];
            var lstMantenimientos = mantenimientosData[0];
            var lstCortes = cortesData[0];
            var lstSolicitudes = solicitudData[0];

            console.log('Todos los AJAX terminaron');
            console.log('Almacén:', almacen);
            console.log('Turbinas:', lstTurbinas.length);
            console.log('Mantenimientos:', lstMantenimientos.length);
            console.log('Cortes:', lstCortes.length);
            console.log('SOLICITUDES COMPLETAS:', lstSolicitudes);

            //Procesar datos AQUÍ (una sola vez)
            var turbinasActivas = lstTurbinas.filter(function (t) {
                return t.estado === "Activa";
            }).length;

            var hoy = new Date();
            var mesActual = hoy.getMonth();
            var anioActual = hoy.getFullYear();

            var diasDelMes = new Date(anioActual, mesActual + 1, 0).getDate();
            var primerDiaDelMes = new Date(anioActual, mesActual, 1);
            var ultimoDiaDelMes = new Date(anioActual, mesActual + 1, 0);

            var produccionTotal = 0;
            var produccionDiaria = 0;

            lstTurbinas.forEach(function (turbina) {
                if (turbina.estado === "Fuera de Servicio") {
                    return;
                }

                var diasMantenimiento = 0;

                lstMantenimientos.forEach(function (m) {
                    if (m.turbinaId === turbina.id) {
                        var fechaInicio = new Date(m.fechaInicio);
                        var fechaFin = m.fechaFin ? new Date(m.fechaFin) : hoy;

                        if (fechaInicio <= hoy && fechaFin >= hoy) {
                            diasMantenimiento = 1;
                        }
                    }
                });

                if (diasMantenimiento === 0 && turbina.estado != "Fuera de Servicio") {
                    produccionDiaria += turbina.capacidadKwh;
                }

                var diasOperacion = Math.max(0, diasDelMes - diasMantenimiento);
                produccionTotal += (turbina.capacidadKwh * 10) * diasOperacion;
            });

            var mantenimientosEnProgreso = lstMantenimientos.filter(function (m) {
                var fechaInicio = new Date(m.fechaInicio);
                var fechaFin = m.fechaFin ? new Date(m.fechaFin) : hoy;

                return (fechaInicio <= ultimoDiaDelMes && fechaFin >= primerDiaDelMes);
            }).length;
            //=============   Solicittudes ====================

            var CantidadMwSolicitudes = 0;
            lstSolicitudes.forEach(function (s) {
                if (s.estado === "PROCESADA") {
                    CantidadMwSolicitudes += s.cantidadMWh;
                }
            });

            //console.log("Cantidad Solicitudes: ", CantidadMwSolicitudes);

            //=============logica del Promedio ====================
            var promedio = 0;

            lstCortes.forEach(function (corte) {
                promedio += corte.energiaGenerada;
            });

            var promedioFinal = (promedio / lstCortes.length).toFixed(2);
            $('#PromedioNum').html(promedioFinal.toLocaleString()+ ' <span>MWh</span>');

            //==========================================================



            var porcentajeDisponibilidad = parseInt($('#porcentajeCapacidad').val() || 90) / 100;

            var produccionEstimada = Number(((produccionTotal / 1000000) * porcentajeDisponibilidad).toFixed(2));
            produccionDiaria = (produccionDiaria * 10 * porcentajeDisponibilidad) / 1000;

            // Actualizar UI
            $('#storageValue').html(almacen.almacenado + ' <span>MWh</span>');
            $('#occupancyPercent').text(Math.round((almacen.almacenado / 40000) * 100) + '%');
            $('#pDiaria').html(produccionDiaria.toLocaleString() + ' <span>MWh</span>');
            $('#solicitudesMW').html(CantidadMwSolicitudes.toLocaleString() + ' <span>MWh</span>');
            $('#turbinasActivas').text(turbinasActivas);
            $('#mantenimientosAgendados').text(mantenimientosEnProgreso);
            $('#produccionEstimada').html(produccionEstimada.toLocaleString() + ' <span>GWh</span>');

            ////==================== html y calculo de balance ===============================
            var balance = produccionDiaria - CantidadMwSolicitudes;
            var porcentajeBalance;
            if (balance >= 0) {
                porcentajeBalance = Math.round((balance / produccionDiaria) * 100);
            } else {
                porcentajeBalance = -1*(100 - (Math.round((produccionDiaria / CantidadMwSolicitudes) * 100)));
            }
            
            var balanceClass = balance >= 0 ? 'green' : 'red';
            var balanceEmoji = balance >= 0 ? '✓' : '⚠';
            var balanceSign = balance >= 0 ? '+' : '';
            var balanceText = balance >= 0 ? 'Disponible' : 'Déficit';

            //ACTUALIZAR TARJETA DE BALANCE
            $('#balanceValue').html(
                balanceSign + balance.toLocaleString() + ' <span>MW</span>' +
                ' <span style="font-size: 12px; margin-left: 6px; font-weight: normal;">' +
                porcentajeBalance + '%</span>'
            );
            $('#balanceDelta').html(' ' + balanceText + ' para almacenar');
            $('#balanceDelta').attr('class', 'card-delta ' + balanceClass);

            //================================================================================

            self.InitChart(almacen);
            self.InitToggle();

        }).fail(function () {
            console.error('Error en uno de los AJAX');
        });
    };

    this.InitChart = function (almacen) {
        if (charts.occupancy) charts.occupancy.destroy();
        if (charts.storage) charts.storage.destroy();

        var almacenado = almacen ? almacen.almacenado : 435;
        var capacidadMax = almacen ? almacen.capacidadMaxima : 40000;
        var porcentajeUsado = (almacenado / capacidadMax) * 100;
        var porcentajeDisponible = 100 - porcentajeUsado;

        var ctxOccupancy = document.getElementById('occupancyChart');
        if (ctxOccupancy) {
            charts.occupancy = new Chart(ctxOccupancy.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Usado', 'Disponible'],
                    datasets: [{
                        data: [Math.round(porcentajeUsado * 10) / 10, Math.round(porcentajeDisponible * 10) / 10],
                        backgroundColor: ['#2563eb', '#e5e7eb'],
                        borderColor: ['#2563eb', '#e5e7eb'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { size: 10 },
                                color: '#6b7280',
                                padding: 12
                            }
                        }
                    }
                }
            });
        }

        var ctxStorage = document.getElementById('storageChart');
        if (ctxStorage) {
            charts.storage = new Chart(ctxStorage.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Hace 3 meses', 'Hace 2 meses', 'Hace 1 mes', 'Hoy'],
                    datasets: [{
                        label: 'MWh Almacenado',
                        data: [almacenado - 300, almacenado - 200, almacenado - 100, almacenado],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 40000,
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

    this.InitToggle = function () {
        var self = this;
        $('.toggle-btn').click(function () {
            $('.toggle-btn').removeClass('active');
            $(this).addClass('active');
            currentView = $(this).data('view');
        });

        $('#porcentajeCapacidad').on('change', function () {
            var valor = parseInt($(this).val());
            if (valor < 1) valor = 1;
            if (valor > 100) valor = 100;
            $(this).val(valor);
            $('#lblPorcentaje').text(valor + '%');

            self.LoadData();
        });

        $('#btnHistorialCortes').click(function () {
            window.location.href = '/HistorialCortes';
        });
    };
}

$(document).ready(function () {
    var vc = new AlmacenCentralViewController();
    vc.InitView();
});