using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class AlmacenCentral : BaseDTO
    {
        public decimal CapacidadMaxima { get; set; }
        public decimal Almacenado { get; set; }
    }
}