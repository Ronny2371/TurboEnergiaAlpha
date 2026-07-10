using System;
using System.Collections.Generic;
using System.Text;

namespace Entities_DTOs
{
    public class User : BaseDTO
    {
        public int Identificacion { get; set; }
        public string Nombre { get; set; }
        public string Apellido1 { get; set; }
        public string Apellido2 { get; set; }
        public int Telefono { get; set; }
        public string Correo { get; set; }
        public DateOnly FechaNacimiento { get; set; }
        public string FotoPerfil { get; set; }
        public string Contrasena { get; set; }
        public Rol Rol { get; set; }
    }
}
