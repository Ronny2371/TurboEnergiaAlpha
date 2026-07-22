using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class CorteEnergia : BaseDTO
    {
        public Turbina Turbina { get; set; }
        public AlmacenCentral AlmacenCentral { get; set; }
        public DateOnly FechaCorte { get; set; }
        public decimal EnergiaKWh { get; set; }
        public decimal EnergiaMWh { get; set; }
    }
}