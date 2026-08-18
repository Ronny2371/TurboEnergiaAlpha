function HistorialCortesViewController() {

    this.API_ControllerName = "CorteEnergia";
    this.cortes = [];
    this.filteredCortes = [];

    this.InitView = function () {
        var self = this;

        // Cargar datos al iniciar
        this.LoadData();

        // Enlazar eventos a botones
        $('#btnGenerarCorte').click(function (e) {
            e.preventDefault();
            self.GenerarCorte();
        });

        $('#porcentajeCapacidad').on('change input', function () {
            self.ValidarPorcentaje($(this));
        });

        $('#searchInput').on('input', function () {
            self.FilterByDate($(this).val());
        });

        // Filtro por mes
        $('#filterMes').on('change', function () {
            self.FilterByMonth($(this).val());
        });
    };

    this.LoadData = function () {
        var self = this;
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/RetrieveAll";

        $.ajax({
            type: 'GET',
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (data) {
                self.cortes = data;
                self.filteredCortes = data;
                self.RenderTable();
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.error : "Error al cargar los cortes";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
            }
        });
    };

    this.RenderTable = function () {
        var tbody = $('#tbodyCortes');
        tbody.empty();

        var cortesConSaldo = [];
        var cortesOrdenados = this.filteredCortes.slice().reverse();
        var saldoActual = 0;

        // CALCULAR SALDOS
        $.each(cortesOrdenados, function (index, corte) {
            saldoActual += corte.balance;
            if (saldoActual < 0) saldoActual = 0;

            // 
            var corteConSaldo = {
                id: corte.id,
                created: corte.created,
                energiaGenerada: corte.energiaGenerada,
                energiaSolicitada: corte.energiaSolicitada,
                balance: corte.balance,
                porcentaje: corte.porcentaje,
                saldoCalculado: saldoActual
            };
            cortesConSaldo.push(corteConSaldo);
        });

        // INVERTIR PARA MOSTRAR
        cortesConSaldo.reverse();

        $.each(cortesConSaldo, function (index, corte) {
            var balanceClass = corte.balance >= 0 ? 'value-positive' : 'value-negative';
            var balanceText = corte.balance >= 0 ? '+' + corte.balance : corte.balance;
            var fecha = new Date(corte.created);
            var dia = ('0' + fecha.getDate()).slice(-2);
            var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
            var anio = fecha.getFullYear();
            var fechaFormato = dia + ' / ' + mes + ' / ' + anio;

            saldoActual += corte.balance;
            if (saldoActual < 0) {
                saldoActual = 0;
            }

            var saldoText = corte.saldoCalculado;

            var row = $('<tr>');
            row.append('<td>' + corte.id + '</td>');
            row.append('<td>' + fechaFormato + '</td>');
            row.append('<td class="value-positive">' + corte.energiaGenerada + ' MWh</td>');
            row.append('<td>' + corte.porcentaje + '%</td>');
            row.append('<td>' + corte.energiaSolicitada + ' MWh</td>');
            row.append('<td class="' + balanceClass + '">' + balanceText + ' MWh</td>');
            row.append('<td>' + saldoText + ' MWh</td>'); 
            
      

            tbody.append(row);
        });

        $('#paginationInfo').text('Mostrando ' + this.filteredCortes.length + ' de ' + this.cortes.length + ' cortes');
    };









    ////=================================GENERAR CORTE ==============================
    this.GenerarCorte = function () {
        var self = this;
        var ca = new ControlActions();
        var porcentaje = parseInt($('#porcentajeCapacidad').val() || 90);
        var hoy = new Date().toISOString().split('T')[0];

        //Hacer ambos AJAX en PARALELO

        var ajaxAlmacen = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Almacen/RetrieveAll")
        });
        var ajaxTurbinas = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("Turbina/RetrieveAll")
        });

        var ajaxCortes = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("CorteEnergia/RetrieveAll")
        });

        var ajaxSolicitud = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService("SolicitudCompra/RetrieveAll")
        });

        //Esperar a que terminen AMBOS
        $.when(ajaxTurbinas, ajaxCortes, ajaxAlmacen, ajaxSolicitud).done(function (turbinasData, cortesData, almacenData, solicitudData) {
            var lstTurbinas = turbinasData[0];
            var lstCortes = cortesData[0];
            var almacen = almacenData[0];
            var lstSolicitudes = solicitudData[0];

            console.log('✓ AJAX terminados - Turbinas:', lstTurbinas.length, 'Cortes:', lstCortes.length, 'Almacen: ', almacen.almacenado);

            // Validar que no exista corte para hoy
            var corteHoy = $.grep(lstCortes, function (c) {
                return c.created.split('T')[0] === hoy;
            });

            if (corteHoy.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Corte ya existe',
                    text: 'Ya existe un corte generado para hoy. Solo se permite uno por día.'
                });
                return;
            }

            //Calcular Total Solicitado
            var CantidadMwSolicitudes = 0;
            lstSolicitudes.forEach(function (s) {
                if (s.estado === "PROCESADA") {
                    CantidadMwSolicitudes += s.cantidadMWh;
                }
            });

            //Calcular producción diaria
            var produccionDiaria = 0;
            lstTurbinas.forEach(function (turbina) {
                if (turbina.estado === "Activa") {
                    produccionDiaria += turbina.capacidadKwh;
                }
            });

            var porcentajeCapacidad = porcentaje / 100;
            var energiaGenerada = (produccionDiaria * 10 * porcentajeCapacidad) / 1000;
            var energiaSolicitada = CantidadMwSolicitudes;
            var balance = energiaGenerada - energiaSolicitada;

            var nuevoAlmacenado = almacen.almacenado + balance; 

            console.log('Nuevo almacenado:', nuevoAlmacenado);

            //Validar que no exceda límites
            if (nuevoAlmacenado > 40000) {
                Swal.fire({
                    icon: 'error',
                    title: 'Capacidad excedida',
                    text: 'El almacén no puede exceder 40,000 MWh'
                });
                return;
            }

            if (nuevoAlmacenado < 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Almacén insuficiente',
                    text: 'El almacén no puede ser negativo'
                });
                return;
            }


            var request = {
                energiaGenerada: Math.round(energiaGenerada * 100) / 100,
                energiaSolicitada: Math.round(energiaSolicitada * 100) / 100,
                balance: Math.round(balance * 100) / 100,
                porcentaje: porcentaje,
                cantidadHoras: 10
            };

            console.log('→ Enviando corte:', request);

        
            self.CrearCorteEnAPI(request, nuevoAlmacenado);

        }).fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos necesarios'
            });
        });
    };

    this.CrearCorteEnAPI = function (request, nuevoAlmacenado) {
        var self = this;
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/Create";

        $.ajax({
            type: 'POST',
            url: ca.GetUrlApiService(urlEndPoint),
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function (response) {
                console.log('✓ Corte creado:', response);

                //ACTUALIZAR ALMACÉN en paralelo
                self.ActualizarAlmacen(nuevoAlmacenado);
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.error : "Error al crear el corte";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
            }
        });
    };




    this.ActualizarAlmacen = function (nuevoAlmacenado) {
        var self = this;
        var ca = new ControlActions();

        $.ajax({
            type: 'PUT',
            url: ca.GetUrlApiService("Almacen/Update"),
            contentType: 'application/json',
            data: JSON.stringify({ almacenado: nuevoAlmacenado }),
            success: function (response) {
                console.log('✓ Almacén actualizado a:', nuevoAlmacenado, 'MWh');

                Swal.fire({
                    icon: 'success',
                    title: 'Corte generado',
                    text: 'Nuevo almacenado: ' + nuevoAlmacenado + ' MWh',
                    timer: 2000
                }).then(function () {
                    self.LoadData();
                });
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.error : "Error al actualizar almacén";
                Swal.fire({
                    icon: 'warning',
                    title: 'Corte creado pero error en almacén',
                    text: message
                }).then(function () {
                    self.LoadData();
                });
            }
        });
    };




    this.ValidarPorcentaje = function (input) {
        var valor = parseInt(input.val());

        if (isNaN(valor)) valor = 90;
        if (valor < 1) valor = 1;
        if (valor > 100) valor = 100;

        input.val(valor);
    };

    this.FilterByDate = function (searchTerm) {
        if (!searchTerm) {
            this.filteredCortes = this.cortes;
        } else {
            this.filteredCortes = $.grep(this.cortes, function (c) {
                return c.created.includes(searchTerm);
            });
        }
        this.RenderTable();
    };

    //Filtrar por mes
    this.FilterByMonth = function (mes) {
        if (!mes) {
            this.filteredCortes = this.cortes;
        } else {
            this.filteredCortes = $.grep(this.cortes, function (c) {
                var fecha = new Date(c.created);
                var mesCorte = ('0' + (fecha.getMonth() + 1)).slice(-2);
                return mesCorte === mes;
            });
        }
        this.RenderTable();
    };

    this.VerDetalle = function (id) {
        var corte = $.grep(this.cortes, function (c) {
            return c.id === id;
        })[0];

        if (!corte) return;

        var balanceEmoji = corte.balance >= 0 ? '📈' : '📉';
        var balanceColor = corte.balance >= 0 ? '#10b981' : '#ef4444';

        //Formato de fecha consistente
        var fecha = new Date(corte.created);
        var dia = ('0' + fecha.getDate()).slice(-2);
        var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
        var anio = fecha.getFullYear();
        var fechaFormato = dia + ' / ' + mes + ' / ' + anio;

        Swal.fire({
            title: 'Detalle del Corte',
            html: '<div style="text-align: left; font-size: 14px;">' +
                '<p><strong>ID:</strong> ' + corte.id + '</p>' +
                '<p><strong>Fecha:</strong> ' + fechaFormato + '</p>' +
                '<p><strong>Energía Generada:</strong> ' + corte.energiaGenerada + ' MWh</p>' +
                '<p><strong>Energía Solicitada:</strong> ' + corte.energiaSolicitada + ' MWh</p>' +
                '<p><strong>Balance:</strong> <span style="color: ' + balanceColor + ';">' +
                balanceEmoji + ' ' + (corte.balance >= 0 ? '+' : '') + corte.balance + ' MWh</span></p>' +
                '<p><strong>% Disponibilidad:</strong> ' + corte.porcentaje + '%</p>' +
                '</div>',
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    };
}

$(document).ready(function () {
    var cortesVC = new HistorialCortesViewController();
    cortesVC.InitView();
});