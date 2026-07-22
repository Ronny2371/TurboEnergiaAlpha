using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class ConfiguracionSistema : BaseDTO
    {
        public decimal PrecioMWh { get; set; }
        public decimal PorcentajeImpuesto { get; set; }
        public string FrecuenciaCorte { get; set; }
    }
}