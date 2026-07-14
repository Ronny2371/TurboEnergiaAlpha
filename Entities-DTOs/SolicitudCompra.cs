using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class SolicitudCompra : BaseDTO
    {
        public User Usuario { get; set; }
        public int MesSolicitado { get; set; }
        public int AnioSolicitado { get; set; }
        public decimal CantidadMWh { get; set; }
        public EstadoSolicitud Estado { get; set; }
    }
}