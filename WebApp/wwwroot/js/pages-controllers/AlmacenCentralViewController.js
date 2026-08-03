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

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Turbina/RetrieveAll"),
            success: function (lstTurbinas) {
                var turbinasActivas = lstTurbinas.filter(function (t) {
                    return t.estado === "Activa";
                }).length;

                $.ajax({
                    type: "GET",
                    url: ca.GetUrlApiService("Mantenimiento/RetrieveAll"),
                    success: function (lstMantenimientos) {
                        var hoy = new Date();
                        var mesActual = hoy.getMonth();
                        var anioActual = hoy.getFullYear();

                        var diasDelMes = new Date(anioActual, mesActual + 1, 0).getDate();
                        var primerDiaDelMes = new Date(anioActual, mesActual, 1);
                        var ultimoDiaDelMes = new Date(anioActual, mesActual + 1, 0);

                        var produccionTotal = 0;

                        lstTurbinas.forEach(function (turbina) {
                            var diasMantenimiento = 0;

                            // Contar días de mantenimiento de esta turbina EN este mes
                            lstMantenimientos.forEach(function (m) {
                                if (m.turbinaId === turbina.id) {
                                    var fechaInicio = new Date(m.fechaInicio);
                                    var fechaFin = m.fechaFin ? new Date(m.fechaFin) : hoy;

                                    // Si el mantenimiento afecta este mes
                                    if (fechaInicio <= ultimoDiaDelMes && fechaFin >= primerDiaDelMes) {
                                        var diaInicio = fechaInicio < primerDiaDelMes ? 1 : fechaInicio.getDate();
                                        var diaFin = fechaFin > ultimoDiaDelMes ? ultimoDiaDelMes.getDate() : fechaFin.getDate();
                                        diasMantenimiento += diaFin - diaInicio + 1;
                                    }
                                }
                            });

                            var diasOperacion = Math.max(0, diasDelMes - diasMantenimiento);
                            produccionTotal += turbina.capacidadKwh * diasOperacion;
                        });

                     
                        // Contar mantenimientos que afecten este mes (sin importar estado)
                        var mantenimientosEnProgreso = lstMantenimientos.filter(function (m) {
                            var fechaInicio = new Date(m.fechaInicio);
                            var fechaFin = m.fechaFin ? new Date(m.fechaFin) : hoy;

                            // Si el mantenimiento está EN este mes
                            return (fechaInicio <= ultimoDiaDelMes && fechaFin >= primerDiaDelMes);
                        }).length;

                        var produccionEstimada = Math.round((produccionTotal / 1000) * 0.9);

                        $('#turbinasActivas').text(turbinasActivas);
                        $('#mantenimientosAgendados').text(mantenimientosEnProgreso);
                        $('#produccionEstimada').html(produccionEstimada.toLocaleString() + ' <span>MW</span>');
                    }
                });
            }
        });
    };


    this.InitChart = function () {
        // Destruir gráficos anteriores si existen
        if (charts.occupancy) charts.occupancy.destroy();
        if (charts.storage) charts.storage.destroy();

        var ctxOccupancy = document.getElementById('occupancyChart');
        if (ctxOccupancy) {
            charts.occupancy = new Chart(ctxOccupancy.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Usado', 'Disponible'],
                    datasets: [{
                        data: [71.7, 28.3],
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
                        data: [1800, 2000, 2100, 2150],
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
                            max: 3000,
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
    };
}

$(document).ready(function () {
    var vc = new AlmacenCentralViewController();
    vc.InitView();
});