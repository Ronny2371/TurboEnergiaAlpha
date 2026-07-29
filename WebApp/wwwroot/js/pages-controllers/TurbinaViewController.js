function TurbinaViewController() {

    this.API_ControllerName = "Turbina";
    this.InitView = function () {
        this.LoadTable();

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

    var ca = new ControlActions();
    ca.PostToAPI("Turbina/Create", turbinaDTO, function () {

        CerrarModalTurbina();

        var vc = new TurbinaViewController();
        vc.LoadTable();
    });


}


function RenderStats(lstTurbinas) {
    var total = lstTurbinas.length;
    var enOperacion = 0;
    var enMantenimiento = 0;
    var capacidadTotalKwh = 0;

    $.each(lstTurbinas, function (i, turbina) {
        if (turbina.estado === "Activa") enOperacion++;
        if (turbina.estado === "Mantenimiento") enMantenimiento++;
        capacidadTotalKwh += turbina.capacidadKwh;
    });

    $('#statTotal').text(total);
    $('#statOperacion').text(enOperacion);
    $('#statMantenimiento').text(enMantenimiento);
    $('#statCapacidad').html((capacidadTotalKwh / 1000).toFixed(1) + ' <span>MW</span>');
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

