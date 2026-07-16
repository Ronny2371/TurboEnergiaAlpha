using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class Mantenimiento : BaseDTO
    {
        public Turbina Turbina { get; set; }
        public User Usuario { get; set; }
        public DateOnly FechaInicio { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public DateOnly FechaFin { get; set; }
        public TimeOnly HoraFin { get; set; }
        public TipoMantenimiento Tipo { get; set; }
        public EstadoMantenimiento Estado { get; set; }
    }
}