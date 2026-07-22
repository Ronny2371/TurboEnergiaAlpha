using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class Distribucion : BaseDTO
    {
        public AlmacenCentral AlmacenCentral { get; set; }
        public SolicitudCompra SolicitudCompra { get; set; }
        public decimal EnergiaAsignadaMWh { get; set; }
        public decimal PrecioMWh { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public DateOnly FechaProceso { get; set; }
    }
}