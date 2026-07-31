    var filtroEstadoActual = "Todos";

    // reemplazar por el Id del usuario autenticado real cuando se implemente
    // el manejo de sesión de momento igual que el resto de
    // las páginas del sistema que muestran "Ing. Operaciones" fijo en el header,
    // se usa un Id fijo de referencia.
    var USUARIO_ACTUAL_ID = 1;

    function MantenimientoViewController() {
        this.API_ControllerName = "Mantenimiento";

        this.InitView = function () {
            this.LoadTable();

            // Filtros por estado
            $('.filter-btn[data-filtro]').click(function () {
                $('.filter-btn[data-filtro]').removeClass('active');
                $(this).addClass('active');
                filtroEstadoActual = $(this).data('filtro');
                ApplyFiltersMant();
            });

            // Barra de búsqueda
            $('#searchInputMant').on('keyup', function () {
                ApplyFiltersMant();
            });

            // Abrir modal para registrar
            $('#btnRegistrarMantenimiento').click(function () {
                PoblarSelectTurbinas();
                $('#modalOverlayMant').css('display', 'flex');
            });

            // Cerrar modal
            $('#btnCerrarModalMant').click(function () {
                CerrarModalMantenimiento();
            });
            $('#btnCancelarMant').click(function () {
                CerrarModalMantenimiento();
            });

            // Guardar
            $('#btnGuardarMantenimiento').click(function () {
                GuardarMantenimiento();
            });

            // Editar
            $('#tbodyMantenimientos').on('click', '.action-btn.edit', function () {
                var id = $(this).data('id');
                var m = window.mantenimientosList.find(function (x) { return x.id === id; });
                if (!m) return;

                PoblarSelectTurbinas();
                $('#selTurbinaMantenimiento').val(m.turbinaId);
                $('input[name="tipoMantenimiento"][value="' + m.tipoMantenimiento + '"]').prop('checked', true);
                $('#txtFechaInicioMant').val(m.fechaInicio);
                $('#txtHoraInicioMant').val(m.horaInicio.substring(0, 5));
                if (m.fechaFin) {
                    $('#txtFechaFinMant').val(m.fechaFin);
                    $('#txtHoraFinMant').val(m.horaFin ? m.horaFin.substring(0, 5) : '');
                }
                $('#modalTitleMant').text('Editar Mantenimiento');
                $('#btnGuardarMantenimiento').text('Actualizar');
                $('#btnGuardarMantenimiento').data('mantenimiento-id', id);
                $('#modalOverlayMant').css('display', 'flex');
            });

            // Eliminar
            $('#tbodyMantenimientos').on('click', '.action-btn.delete', function () {
                var id = $(this).data('id');
                Swal.fire({
                    icon: 'warning',
                    title: '¿Seguro que desea eliminar este mantenimiento?',
                    showCancelButton: true,
                    confirmButtonText: 'Si',
                    cancelButtonText: 'No'
                }).then(function (result) {
                    if (result.isConfirmed) {
                        EliminarMantenimiento(id);
                    }
                });
            });
        }

        // Carga todo en paralelo y sincroniza estados
        // y luego dibuja la tabla y las estadísticas.
        this.LoadTable = function () {
            var ca = new ControlActions();

            $.when(
                $.get(ca.GetUrlApiService("Mantenimiento/RetrieveAll")),
                $.get(ca.GetUrlApiService("Turbina/RetrieveAll")),
                $.get(ca.GetUrlApiService("Users/RetrieveAll"))
            ).done(function (mantResp, turbResp, userResp) {
                window.mantenimientosList = mantResp[0] || [];
                window.turbinasList = turbResp[0] || [];
                window.usuariosList = userResp[0] || [];

                SincronizarEstados(function () {
                    ApplyFiltersMant();
                });
            }).fail(function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'No se pudieron cargar los datos de mantenimiento.'
                });
            });
        }
    }
    // Estados estan automaticos
    // Y los calcula en tiempo real basado en fecha y hora
    // entonces actualiza tanto en mantenimiento como en tuirbina
    function SincronizarEstados(callback) {
        var ca = new ControlActions();
        var pendientes = [];

        $.each(window.mantenimientosList, function (i, m) {
            var estadoCalculado = CalcularEstadoPorFecha(m);

            if (estadoCalculado !== m.estadoMantenimiento) {
                var estadoAnterior = m.estadoMantenimiento;
                m.estadoMantenimiento = estadoCalculado;

                var mantenimientoDTO = {
                    id: m.id,
                    turbinaId: m.turbinaId,
                    usuarioId: m.usuarioId,
                    fechaInicio: m.fechaInicio,
                    horaInicio: m.horaInicio,
                    fechaFin: m.fechaFin,
                    horaFin: m.horaFin,
                    tipoMantenimiento: m.tipoMantenimiento,
                    estadoMantenimiento: estadoCalculado
                };

                pendientes.push($.ajax({
                    type: "PUT",
                    url: ca.GetUrlApiService("Mantenimiento/Update"),
                    data: JSON.stringify(mantenimientoDTO),
                    contentType: "application/json; charset=utf-8"
                }));

                // Sincronizar la turbina asociada
                var turbina = window.turbinasList.find(function (t) { return t.id === m.turbinaId; });
                if (turbina) {
                    if (estadoCalculado === "En Proceso" && turbina.estado !== "Mantenimiento") {
                        turbina.estado = "Mantenimiento";
                        pendientes.push(ActualizarEstadoTurbina(turbina));
                    } else if (estadoCalculado === "Finalizado" && turbina.estado === "Mantenimiento") {
                        // Solo se reactiva si el estado actual es "Mantenimiento" (derivado).
                        // Si alguien la puso "Fuera de Servicio" manualmente, no se toca.
                        turbina.estado = "Activa";
                        pendientes.push(ActualizarEstadoTurbina(turbina));
                    }
                }
            }
        });

        if (pendientes.length > 0) {
            $.when.apply($, pendientes).always(function () {
                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }
    }

    function ActualizarEstadoTurbina(turbina) {
        var ca = new ControlActions();
        var turbinaDTO = {
            id: turbina.id,
            nombre: turbina.nombre,
            modelo: turbina.modelo,
            marca: turbina.marca,
            anioFabricacion: turbina.anioFabricacion,
            capacidadKwh: turbina.capacidadKwh,
            estado: turbina.estado
        };
        return $.ajax({
            type: "PUT",
            url: ca.GetUrlApiService("Turbina/Update"),
            data: JSON.stringify(turbinaDTO),
            contentType: "application/json; charset=utf-8"
        });
    }

    // Calcula que estado debe tener un mantenimiento en este momento,
    // comparando la fecha/hora actual contra su ventana de inicio/fin.
    function CalcularEstadoPorFecha(m) {
        var ahora = new Date();
        var inicio = CombinarFechaHora(m.fechaInicio, m.horaInicio);

        if (ahora < inicio) {
            return "Programado";
        }
        if (m.fechaFin && m.horaFin) {
            var fin = CombinarFechaHora(m.fechaFin, m.horaFin);
            if (ahora > fin) {
                return "Finalizado";
            }
        }
        return "En Proceso";
    }

    function CombinarFechaHora(fechaStr, horaStr) {
        var partesFecha = fechaStr.split('-');
        var partesHora = horaStr.split(':');
        return new Date(
            parseInt(partesFecha[0]),
            parseInt(partesFecha[1]) - 1,
            parseInt(partesFecha[2]),
            parseInt(partesHora[0]),
            parseInt(partesHora[1]),
            partesHora[2] ? parseInt(partesHora[2]) : 0
        );
}

    // Filtros y busqueda
    function ApplyFiltersMant() {
        var lista = window.mantenimientosList.slice();

        if (filtroEstadoActual !== "Todos") {
            lista = lista.filter(function (m) { return m.estadoMantenimiento === filtroEstadoActual; });
        }

        var searchTerm = $('#searchInputMant').val() ? $('#searchInputMant').val().toLowerCase() : '';
        if (searchTerm) {
            lista = lista.filter(function (m) {
                var turbina = window.turbinasList.find(function (t) { return t.id === m.turbinaId; });
                var nombreTurbina = turbina ? turbina.nombre.toLowerCase() : '';
                var tipo = m.tipoMantenimiento.toLowerCase();
                return nombreTurbina.includes(searchTerm) || tipo.includes(searchTerm);
            });
        }

        RenderTablaMant(lista);
        RenderStatsMant(window.mantenimientosList);
    }

    // Tabla y estadisticas
    function RenderTablaMant(lstMantenimientos) {
        var $tbody = $('#tbodyMantenimientos');
        $tbody.empty();

        $.each(lstMantenimientos, function (i, m) {
            var turbina = window.turbinasList.find(function (t) { return t.id === m.turbinaId; });
            var usuario = window.usuariosList.find(function (u) { return u.id === m.usuarioId; });

            var nombreTurbina = turbina ? turbina.nombre : ('Turbina #' + m.turbinaId);
            var nombreUsuario = usuario ? (usuario.nombre + ' ' + usuario.apellido1) : ('Usuario #' + m.usuarioId);

            var badgeClass = "badge-yellow";
            if (m.estadoMantenimiento === "En Proceso") badgeClass = "badge-blue";
            if (m.estadoMantenimiento === "Finalizado") badgeClass = "badge-green";

            var inicioTexto = FormatFechaHora(m.fechaInicio, m.horaInicio);
            var finTexto = (m.fechaFin && m.horaFin) ? FormatFechaHora(m.fechaFin, m.horaFin) : '—';

            var accionesHtml = '<div class="action-buttons">' +
                '<button class="action-btn edit" data-id="' + m.id + '">✎</button>' +
                '<button class="action-btn delete" data-id="' + m.id + '">🗑</button>' +
                '</div>';

            var fila =
                '<tr>' +
                '<td>' + nombreTurbina + '</td>' +
                '<td>' + m.tipoMantenimiento + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + m.estadoMantenimiento + '</span></td>' +
                '<td>' + inicioTexto + '</td>' +
                '<td>' + finTexto + '</td>' +
                '<td>' + nombreUsuario + '</td>' +
                '<td>' + accionesHtml + '</td>' +
                '</tr>';
            $tbody.append(fila);
        });

        $('#paginationInfoMant').text('Mostrando ' + lstMantenimientos.length + ' de ' + window.mantenimientosList.length + ' mantenimientos');
    }

    function RenderStatsMant(lstMantenimientos) {
        var total = lstMantenimientos.length;
        var enProceso = 0, programados = 0, finalizados = 0;

        $.each(lstMantenimientos, function (i, m) {
            if (m.estadoMantenimiento === "En Proceso") enProceso++;
            if (m.estadoMantenimiento === "Programado") programados++;
            if (m.estadoMantenimiento === "Finalizado") finalizados++;
        });

        $('#statTotalMant').text(total);
        $('#statEnProceso').text(enProceso);
        $('#statProgramados').text(programados);
        $('#statFinalizados').text(finalizados);

        if (total > 0) {
            $('#statEnProcesoDelta').text(Math.round((enProceso / total) * 100) + '% del total');
            $('#statProgramadosDelta').text(Math.round((programados / total) * 100) + '% del total');
            $('#statFinalizadosDelta').text(Math.round((finalizados / total) * 100) + '% del total');
        }
    }

    function FormatFechaHora(fechaStr, horaStr) {
        var partes = fechaStr.split('-');
        var fechaFormateada = partes[2] + '/' + partes[1] + '/' + partes[0];
        var horaFormateada = horaStr ? horaStr.substring(0, 5) : '';
        return fechaFormateada + ' ' + horaFormateada;
    }

    // Agrega a selct de turbinas en modal de mantenimiento
    function PoblarSelectTurbinas() {
        var $select = $('#selTurbinaMantenimiento');
        $select.empty();
        $select.append('<option value="">Seleccionar turbina...</option>');
        $.each(window.turbinasList, function (i, t) {
            $select.append('<option value="' + t.id + '">' + t.nombre + '</option>');
        });
    }

    // Guarda mantenimiento nuevo o el que se edito
    function GuardarMantenimiento() {
        var turbinaId = $('#selTurbinaMantenimiento').val();
        var tipo = $('input[name="tipoMantenimiento"]:checked').val();
        var fechaInicio = $('#txtFechaInicioMant').val();
        var horaInicio = $('#txtHoraInicioMant').val();
        var fechaFin = $('#txtFechaFinMant').val();
        var horaFin = $('#txtHoraFinMant').val();

        if (!turbinaId || !fechaInicio || !horaInicio) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos Incompletos',
                text: 'Selecciona la turbina y la fecha/hora de inicio antes de guardar.'
            });
            return;
        }

        if (fechaFin && fechaInicio > fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas incoherentes',
                text: 'La fecha de fin no puede ser anterior a la fecha de inicio.'
            });
            return;
        }

        var mantenimientoDTO = {
            turbinaId: parseInt(turbinaId),
            usuarioId: USUARIO_ACTUAL_ID,
            fechaInicio: fechaInicio,
            horaInicio: horaInicio.length === 5 ? horaInicio + ':00' : horaInicio,
            fechaFin: fechaFin ? fechaFin : null,
            horaFin: (fechaFin && horaFin) ? (horaFin.length === 5 ? horaFin + ':00' : horaFin) : null,
            tipoMantenimiento: tipo
        };

        // El estado se calcula automáticamente según las fechas ingresadas
        mantenimientoDTO.estadoMantenimiento = CalcularEstadoPorFecha(mantenimientoDTO);

        var isEditing = $('#btnGuardarMantenimiento').data('mantenimiento-id');
        var ca = new ControlActions();

        if (isEditing) {
            mantenimientoDTO.id = isEditing;
            ca.PutToAPI("Mantenimiento/Update", mantenimientoDTO, function () {
                CerrarModalMantenimiento();
                var vc = new MantenimientoViewController();
                vc.LoadTable();
            });
        } else {
            ca.PostToAPI("Mantenimiento/Create", mantenimientoDTO, function () {
                CerrarModalMantenimiento();
                var vc = new MantenimientoViewController();
                vc.LoadTable();
            });
        }
    }

    function EliminarMantenimiento(id) {
        var m = window.mantenimientosList.find(function (x) { return x.id === id; });
        if (!m) return;

        $.ajax({
            type: "DELETE",
            url: new ControlActions().GetUrlApiService("Mantenimiento/Delete"),
            data: JSON.stringify(m),
            contentType: "application/json; charset=utf-8",
            success: function () {
                var vc = new MantenimientoViewController();
                vc.LoadTable();
                Swal.fire({
                    icon: 'success',
                    title: 'Mantenimiento Eliminado',
                    text: 'El registro ha sido eliminado correctamente.'
                });
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo eliminar el mantenimiento.";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
            }
        });
    }

    function CerrarModalMantenimiento() {
        $('#modalOverlayMant').css('display', 'none');
        $('#selTurbinaMantenimiento').val('');
        $('input[name="tipoMantenimiento"][value="Planificado"]').prop('checked', true);
        $('#txtFechaInicioMant').val('');
        $('#txtHoraInicioMant').val('');
        $('#txtFechaFinMant').val('');
        $('#txtHoraFinMant').val('');
        $('#txtDescripcionMant').val('');
        $('#modalTitleMant').text('Registrar Mantenimiento');
        $('#btnGuardarMantenimiento').text('Guardar');
        $('#btnGuardarMantenimiento').data('mantenimiento-id', '');
}

    $(document).ready(function () {
        var vc = new MantenimientoViewController();
        vc.InitView();
    });
