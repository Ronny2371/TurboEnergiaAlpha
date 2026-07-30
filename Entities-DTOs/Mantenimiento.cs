using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class Mantenimiento : BaseDTO
    {
        public int TurbinaId { get; set; }
        public int UsuarioId { get; set; }
        public DateOnly FechaInicio { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public DateOnly? FechaFin { get; set; }
        public TimeOnly? HoraFin { get; set; }
        public string TipoMantenimiento { get; set; }
        public string EstadoMantenimiento { get; set; }
    }
}