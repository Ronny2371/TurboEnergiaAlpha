using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class LogAuditoria : BaseDTO
    {
        public User Usuario { get; set; }
        public string EntidadModificada { get; set; }
        public string CampoModificado { get; set; }
        public string ValorAnterior { get; set; }
        public string ValorNuevo { get; set; }
        public DateOnly FechaEvento { get; set; }
        public TimeOnly HoraEvento { get; set; }
    }
}