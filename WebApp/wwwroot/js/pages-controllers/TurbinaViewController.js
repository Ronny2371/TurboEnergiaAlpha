
var estadoMode = 0;
var potenciaMode = 0;
function TurbinaViewController() {

    this.API_ControllerName = "Turbina";
    this.InitView = function () {
        this.LoadTable();
        //==============================Botones con Filtros=================

        $('#btnFilterEstado').click(function () {
            estadoMode = (estadoMode + 1) % 2;
            ApplyFilters()
        });
        $('#btnFilterPotencia').click(function () {
            potenciaMode = (potenciaMode + 1) % 3;
            ApplyFilters();
        });

        //==============================Barra de Busqueda=================
        $('#searchInput').on('keyup', function () {
            var searchTerm = $(this).val().toLowerCase();

            $('#tbodyTurbinas tr').each(function (index) {
                var turbina = window.turbinasList[index];

                if (!turbina) return;

                var row = $(this);
                var modelo = turbina.modelo.toLowerCase();
                var codigo = "T-" + turbina.modelo.charAt(0).toUpperCase() + turbina.marca.charAt(0).toUpperCase() + turbina.id;
                codigo = codigo.toLowerCase();

                if (modelo.includes(searchTerm) || codigo.includes(searchTerm)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        })
        //=================================================================

        $('#tbodyTurbinas').on('click', '.action-btn.delete', function () {
            var id = $(this).data('id');

            Swal.fire({
                icon: 'warning',
                title: '¿Seguro que desea eliminar esta turbina?',
                showCancelButton: true,
                confirmButtonText: 'Si',
                cancelButtonText: 'No'
            }).then(function (result) {
                if (result.isConfirmed) {
                    EliminarTurbina(id);
                }
            });
        });

        //=================================Boton de editar===================

        $('#tbodyTurbinas').on('click', '.action-btn.edit', function () {
            var id = $(this).data('id');
            var turbina = window.turbinasList.find(function (t) { return t.id === id; });

            if (!turbina) return;

            $('#txtNombre').val(turbina.nombre);
            $('#txtModelo').val(turbina.modelo);
            $('#txtMarca').val(turbina.marca);
            $('#txtAnio').val(turbina.anioFabricacion);
            $('#txtCapacidad').val(turbina.capacidadKwh);
            $('#selEstado').val(turbina.estado);

            $('#modalTitle').text('Editar Turbina');
            $('#btnCrearTurbina').text('Actualizar');
            $('#btnCrearTurbina').data('turbina-id', id);

            $('#modalOverlay').css('display', 'flex');

        });

        //===================================================================

        $('#btnAgregarTurbina').click(function () {
            $('#modalOverlay').css('display', 'flex');
        });
        $('#btnCerrarModal').click(function () {
            CerrarModalTurbina();
        });

        $('#btnCrearTurbina').click(function () {
            CrearTurbina();
        });


    }

    this.LoadTable = function () {
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/RetrieveAll";

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (lstTurbinas) {
                RenderTabla(lstTurbinas);
                RenderStats(lstTurbinas);
            },
            error: function (jqHRX) {
                var message = jqHRX.responseJSON ? jqHRX.responseJSON.mensaje : "No se pudieron cargar las turbinas.";
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: message
                });
            }
        })
    }
}

function ApplyFilters() {
    var sorted = window.turbinasList.slice();
    if (potenciaMode === 1) {
        sorted.sort(function (a, b) { return b.capacidadKwh - a.capacidadKwh; });
    } else if (potenciaMode === 2) {
        sorted.sort(function (a, b) { return a.capacidadKwh - b.capacidadKwh; });
    } else {
		sorted.sort(function (a, b) { return a.id - b.id; });
    }

    if (estadoMode === 1) {
        sorted.sort(function (a, b) {
            var order = { "Activa": 1, "Mantenimiento": 2, "Fuera de Servicio": 3 };
            return (order[a.estado] || 999) - (order[b.estado] || 999);
        });
    }

    var simbolo = '▽';  
    if (potenciaMode === 1) simbolo = '▼';  
    if (potenciaMode === 2) simbolo = '▲'; 

    $('#btnFilterPotencia').text('Potencia ' + simbolo);

    if (estadoMode === 1) {
        $('#btnFilterEstado').addClass('active');
    } else {
        $('#btnFilterEstado').removeClass('active');
    }

	RenderTabla(sorted);
}

function RenderTabla(lstTurbinas) {
    window.turbinasList = lstTurbinas;
    var $tbody = $('#tbodyTurbinas');
    $tbody.empty();

    $.each(lstTurbinas, function (i, turbina) {
        var badgeClass = "badge-green";
        if (turbina.estado === "Mantenimiento") badgeClass = "badge-yellow";
        if (turbina.estado === "Fuera de Servicio") badgeClass = "badge-red";

        //================Construccion del Codigo de la Turbina ====================
        var codigo = "T-" + turbina.modelo.charAt(0).toUpperCase() + turbina.marca.charAt(0).toUpperCase()+ turbina.id;
        //==========================================================
        var potencia = turbina.capacidadKwh + " kW";
        var instalacion = FormatDate(turbina.created);

        var fila =
            '<tr>' +
            '<td><strong>' + codigo + '</strong></td>' +
            '<td>' + turbina.modelo + '</td>' +
            '<td>' + turbina.marca + '</td>' +
            '<td>' + potencia + '</td>' +
            '<td><span class="badge ' + badgeClass + '">● ' + turbina.estado + '</span></td>' +
            '<td>' + instalacion + '</td>' +
            '<td>' +
            '<div class="action-buttons">' +
            '<button class="action-btn edit" data-id="' + turbina.id + '">✎</button>' +
            '<button class="action-btn delete" data-id="' + turbina.id + '">🗑</button>' +
            '</div>' +
            '</td>' +
            '</tr>';
        $tbody.append(fila);
    });

    $('#paginationInfo').text('Mostrando ' + lstTurbinas.length + ' de ' + lstTurbinas.length + ' turbinas');
}

function EliminarTurbina(id) {

    var turbina = window.turbinasList.find(function (t) {return t.id === id });

    $.ajax({
        type: "DELETE",
        url: new ControlActions().GetUrlApiService("Turbina/Delete"),
        data: JSON.stringify(turbina),
        contentType: "application/json; charset=utf-8",
        success: function () {
            //================= Esto es para que se elimine una turbina, se vuelva a recargar la tabla actualizada =====
            var vc = new TurbinaViewController();
            vc.LoadTable();
            //====================
            Swal.fire({
                icon: 'success',
                title: 'Turbina Eliminada',
                text: 'La turbina ha sido eliminada correctamente.'
            });

        },
        error: function (jqXHR) {
            var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo eliminar la turbina.";
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        }
    });
}

function CerrarModalTurbina() {
    $('#modalOverlay').css('display', 'none');
    $('#txtNombre').val('');
    $('#txtModelo').val('');
    $('#txtMarca').val('');
    $('#txtAnio').val('');
    $('#txtCapacidad').val('');
    $('#selEstado').val('');

    $('#modalTitle').text('Agregar Turbina');
    $('#btnCrearTurbina').text('Crear');
    $('#btnCrearTurbina').data('turbina-id', '');

}

function CrearTurbina() {
    var nombre = $('#txtNombre').val().trim();
    var modelo = $('#txtModelo').val().trim();
    var marca = $('#txtMarca').val().trim();
    var anio = $('#txtAnio').val().trim();
    var capacidad = $('#txtCapacidad').val().trim();
    var estado = $('#selEstado').val();

    if (!nombre || !modelo || !marca || !anio || !capacidad || !estado) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Completa todos los campos antes de crear la turbina.'
        });
        return;
    }

    var turbinaDTO = {
        nombre: nombre,
        modelo: modelo,
        marca: marca,
        anioFabricacion: parseInt(anio),
        capacidadKwH: parseFloat(capacidad),
        estado: estado
    };

    var isEditing = $('#btnCrearTurbina').data('turbina-id');

    if (isEditing) {
        turbinaDTO.id = isEditing;
        ActualizarTurbina(turbinaDTO);
    } else {
        var ca = new ControlActions();
        ca.PostToAPI("Turbina/Create", turbinaDTO, function () {

            CerrarModalTurbina();

            var vc = new TurbinaViewController();
            vc.LoadTable();
            ApplyFilters();
        });
    }




}


function ActualizarTurbina(turbinaDTO) {
    turbinaDTO.id = parseInt(turbinaDTO.id);

    var ca = new ControlActions();
    var urlEndPoint = "Turbina/Update";

    ca.PutToAPI(urlEndPoint, turbinaDTO, function () {
        CerrarModalTurbina();
        var vc = new TurbinaViewController();
        vc.LoadTable();
        ApplyFilters();
    });
}

function RenderStats(lstTurbinas) {
    var total = lstTurbinas.length;
    var enOperacion = 0;
    var enMantenimiento = 0;
    var capacidadTotalKwh = 0;
    var capacidadActivasKwh = 0;

    $.each(lstTurbinas, function (i, turbina) {
        if (turbina.estado === "Activa") {
            enOperacion++;
            capacidadActivasKwh += turbina.capacidadKwh;
        }
        if (turbina.estado === "Mantenimiento") enMantenimiento++;
        capacidadTotalKwh += turbina.capacidadKwh;
    });

    $('#statTotal').text(total);
    $('#statOperacion').text(enOperacion);
    $('#statMantenimiento').text(enMantenimiento);
    $('#statCapacidad').html((capacidadTotalKwh / 1000).toFixed(1) + ' <span>MW</span>');

    if (enOperacion === total) {
        $('#statCapacidadDelta').text('');
        $('#statOperacionDelta').text('');
        $('#statMantenimientoDelta').text('');
    } else {
        var capacidadActualMW = (capacidadActivasKwh / 1000).toFixed(1);
        var porcentajeOperacion = Math.round((enOperacion / total) * 100);
        var porcentajeMantenimiento = Math.round((enMantenimiento / total) * 100);
        $('#statCapacidadDelta').text('Capacidad actual: ' + capacidadActualMW + ' MW').css('color', '#9ca3af');
        $('#statOperacionDelta').text(porcentajeOperacion + '% del Total');
        $('#statMantenimientoDelta').text(porcentajeMantenimiento + '% del Total');
    }


}



function FormatDate(fechaIso) {
    var d = new Date(fechaIso);
    var dia = String(d.getDate()).padStart(2, '0');
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var anio = d.getFullYear();
    return dia + '/' + mes + '/' + anio;
}



$(document).ready(function () {
    var vc = new TurbinaViewController();
    vc.InitView();
})

