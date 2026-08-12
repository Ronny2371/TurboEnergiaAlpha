using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class ReporteFacturacion : BaseDTO
    {
        public int UsuarioId { get; set; }
        public string Distribuidor { get; set; }
        public string NumeroFactura { get; set; }
        public DateTime Periodo { get; set; }
        public string Estado { get; set; }
        public decimal EnergiaAsignada { get; set; }
        public decimal PrecioMWh { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public DateTime FechaEmision { get; set; }
        public DateTime FechaVencimiento { get; set; }

        // Campos extra: solo se llenan para el rol Distribuidor
        public List<SolicitudCompra> HistorialSolicitudes { get; set; }
        public int SolicitudesActivasAnio { get; set; }
        public int LimiteSolicitudesAnio { get; set; }
        public decimal VolumenTotalDistribuidoMWh { get; set; }
        public List<ReporteFacturacion> DetalleFacturacionDistribucion { get; set; }
    }
}
