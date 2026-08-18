
function ReporteFacturacionViewController() {

    this.API_ControllerName = "ReporteFacturacion";

    this.InitView = function () {
        this.LoadReporte();
    }

    this.ObtenerUsuarioActual = function () {
        var data = sessionStorage.getItem('usuarioActual');
        return data ? JSON.parse(data) : null;
    }

    this.LoadReporte = function () {
        var ca = new ControlActions();
        var usuario = this.ObtenerUsuarioActual();
        var usuarioId = ca.GetUsuarioActualId();
        var rolId = usuario && usuario.rol ? usuario.rol.id : 0;

        //Mismo endpoint para ambos roles; rolId indica que datos extra incluir
        var urlEndPoint = this.API_ControllerName + "/RetrieveUltimo?usuarioId=" + usuarioId + "&rolId=" + rolId;

        var ajaxReporte = $.ajax({
            type: "GET",
            url: ca.GetUrlApiService(urlEndPoint)
        });

        $.when(ajaxReporte).done(function (reporte) {
            if (!reporte) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin datos',
                    text: 'Todavía no hay reportes de facturación para este distribuidor.'
                });
                return;
            }
            RenderReporte(reporte);
            RenderDistribuidorExtra(reporte, rolId);
        }).fail(function (jqXHR) {
            var message = jqXHR.responseJSON ? jqXHR.responseJSON.mensaje : "No se pudo cargar el reporte de distribución.";
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: message
            });
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

// Grafico muestra composicion del total: Subtotal vs Impuesto
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

// Muestra la seccion extra solo si el rol es Distribuidor
function RenderDistribuidorExtra(r, rolId) {
    var ROL_DISTRIBUIDOR = 2;
    if (rolId !== ROL_DISTRIBUIDOR) {
        $('#distribuidorExtraSection').hide();
        return;
    }

    $('#distribuidorExtraSection').show();

    var activas = r.solicitudesActivasAnio || 0;
    var limite = r.limiteSolicitudesAnio || 6;
    $('#statSolicitudesActivas').text(activas);
    $('#statSolicitudesLimite').text(activas + ' de ' + limite + ' del límite anual');
    $('#statSolicitudesLimite').attr('class', 'stat-delta ' + (activas >= limite ? 'yellow' : 'green'));

    $('#statVolumenDistribuido').html(Number(r.volumenTotalDistribuidoMWh || 0).toLocaleString() + ' <span style="font-size:11px;color:#9ca3af;">MWh</span>');

    var nombresEstado = { PENDIENTE: 'Pendiente', PROCESADA: 'Aprobada', BLOQUEADA: 'Bloqueada', CANCELADA: 'Cancelada' };

    var $tbodyHistorial = $('#tbodyHistorialSolicitudes');
    $tbodyHistorial.empty();
    (r.historialSolicitudes || []).forEach(function (s) {
        $tbodyHistorial.append(
            '<tr><td>' + s.mesSolicitado + '/' + s.anioSolicitado + '</td><td>' + s.cantidadMWh + ' MWh</td><td>' + (nombresEstado[s.estado] || s.estado) + '</td></tr>'
        );
    });

    var $tbodyDetalle = $('#tbodyDetalleFacturacion');
    $tbodyDetalle.empty();
    (r.detalleFacturacionDistribucion || []).forEach(function (f) {
        $tbodyDetalle.append(
            '<tr><td>' + FormatPeriodo(f.periodo) + '</td><td>' + f.numeroFactura + '</td><td>' + f.estado + '</td><td>$ ' + FormatMoney(f.total) + '</td></tr>'
        );
    });
}

function FormatPeriodo(fechaIso) {
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var d = new Date(fechaIso);
    return meses[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}
v
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
