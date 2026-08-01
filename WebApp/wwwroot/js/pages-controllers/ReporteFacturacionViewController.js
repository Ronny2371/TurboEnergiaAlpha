
// Hasta que exista sesion/login real (ver LoginViewController.js), se usa un Id fijo
// de referencia para el distribuidor, igual que USUARIO_ACTUAL_ID en Mantenimiento.
var USUARIO_ACTUAL_ID = 10;

function ReporteFacturacionViewController() {

    this.API_ControllerName = "ReporteFacturacion";

    this.InitView = function () {
        this.LoadReporte();
    }

    this.LoadReporte = function () {
        var ca = new ControlActions();
        var urlEndPoint = this.API_ControllerName + "/RetrieveUltimo?usuarioId=" + USUARIO_ACTUAL_ID;

        $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(urlEndPoint),
            success: function (reporte) {
                if (!reporte) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin datos',
                        text: 'Todavía no hay reportes de facturación para este distribuidor.'
                    });
                    return;
                }
                RenderReporte(reporte);
            },
            error: function (jqXHR) {
                var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo cargar el reporte de distribución.";
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: message
                });
            }
        });
    }
}

function RenderReporte(r) {
    window.reporteActual = r;

    $('#lblPeriodo').text(FormatPeriodo(r.periodo));
    $('#lblDistribuidor').text(r.distribuidor);
    $('#lblNumeroFactura').text(r.numeroFactura);

    var badgeColor = "blue";
    if (r.estado === "Pagada") badgeColor = "green";
    if (r.estado === "Pendiente") badgeColor = "yellow";
    if (r.estado === "Vencida") badgeColor = "red";

    $('#badgeEstado').attr('class', 'badge badge-' + badgeColor);
    $('#badgeEstadoDot').attr('class', 'badge-dot badge-dot-' + badgeColor);
    $('#lblEstado').text(r.estado);

    $('#lblEnergiaAsignada').text(r.energiaAsignada + ' MWh');
    $('#lblPrecioMWh').text('$ ' + FormatMoney(r.precioMWh));
    $('#lblSubtotal').text('$ ' + FormatMoney(r.subtotal));

    var porcentajeImpuesto = r.subtotal > 0 ? Math.round((r.impuesto / r.subtotal) * 100) : 0;
    $('#lblImpuestoLabel').text('Impuesto (' + porcentajeImpuesto + '%)');
    $('#lblImpuesto').text('$ ' + FormatMoney(r.impuesto));
    $('#lblTotal').text('$ ' + FormatMoney(r.total));

    RenderChart(r);
    RenderNotas(r);
}

// La tabla no tiene energia consumida, asi que el grafico muestra la composicion
// real del total (Subtotal vs Impuesto) en vez de inventar un dato de consumo.
function RenderChart(r) {
    var anchoTotal = 260;
    var xInicio = 10;

    var pctSubtotal = r.total > 0 ? (r.subtotal / r.total) : 0;
    var pctImpuesto = r.total > 0 ? (r.impuesto / r.total) : 0;

    var anchoSubtotal = anchoTotal * pctSubtotal;
    var anchoImpuesto = anchoTotal * pctImpuesto;

    $('#barSubtotal').attr('width', anchoSubtotal);
    $('#barImpuesto').attr('x', xInicio + anchoSubtotal).attr('width', anchoImpuesto);

    $('#lblChartSubtotalPct').text(Math.round(pctSubtotal * 100) + '%');
    $('#lblChartImpuestoPct').text(Math.round(pctImpuesto * 100) + '%');
}

function RenderNotas(r) {
    var $lista = $('#notasList');
    $lista.empty();

    $lista.append(
        '<div class="note-item"><span class="note-icon check">✓</span>Factura emitida el ' + FormatDate(r.fechaEmision) + '</div>'
    );

    var hoy = new Date();
    var vencimiento = new Date(r.fechaVencimiento);

    if (r.estado === 'Pagada') {
        $lista.append(
            '<div class="note-item"><span class="note-icon check">✓</span>Factura pagada</div>'
        );
    } else if (vencimiento < hoy) {
        $lista.append(
            '<div class="note-item"><span class="note-icon warning">!</span>Factura vencida el ' + FormatDate(r.fechaVencimiento) + '</div>'
        );
    } else {
        $lista.append(
            '<div class="note-item"><span class="note-icon check">✓</span>Vence el ' + FormatDate(r.fechaVencimiento) + '</div>'
        );
    }
}

function FormatPeriodo(fechaIso) {
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var d = new Date(fechaIso);
    return meses[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

function FormatDate(fechaIso) {
    var d = new Date(fechaIso);
    var dia = String(d.getUTCDate()).padStart(2, '0');
    var mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    var anio = d.getUTCFullYear();
    return dia + '/' + mes + '/' + anio;
}

function FormatMoney(valor) {
    return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

$(document).ready(function () {
    var vc = new ReporteFacturacionViewController();
    vc.InitView();
})
