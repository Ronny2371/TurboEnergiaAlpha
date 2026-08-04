using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class CorteEnergia : BaseDTO
    {
        public decimal EnergiaGenerada { get; set; }
        public decimal EnergiaSolicitada { get; set; }
        public decimal Balance { get; set; }
        public int Porcentaje { get; set; }
        public int CantidadHoras { get; set; }
    }
}