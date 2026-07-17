using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class Turbina : BaseDTO
    {
        public string Nombre { get; set; }
        public string Modelo { get; set; }
        public string Marca { get; set; }
        public int anioFabricacion { get; set; }
        public decimal capacidadKwh { get; set; }
        public string Estado { get; set; }

        //Metodos

        public decimal CalcularEnergia(int hora)
        {
            return capacidadKwh * hora;
        }


    }
}
