using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class AlmacenCentral : BaseDTO
    {
        public decimal SaldoMWh { get; set; }
        public DateOnly UltimaActualizacion { get; set; }
    }
}