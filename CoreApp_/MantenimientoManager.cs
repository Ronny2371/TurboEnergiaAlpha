using DataAccess.CRUD;
using Entities_DTOs;
using Microsoft.IdentityModel.Tokens.Experimental;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreApp_
{
    public class MantenimientoManager
    {
        public List<Mantenimiento> RetrieveAllMantenimientos()
        {
            var mCrud = new MantenimientoCrudFactory();
            return mCrud.RetrieveAll<Mantenimiento>();
        }

        public Mantenimiento RetrieveMantenimientoById(int id)
        {
            var mCrud = new MantenimientoCrudFactory();
            return mCrud.RetrieveById<Mantenimiento>(id);
        }

        public void CreateMantenimiento(Mantenimiento m, int usuarioAccionId)
        {
            Validate(m);

            var mCrud = new MantenimientoCrudFactory();
            mCrud.Create(m);

            var identificador = $"Turbina {m.TurbinaId} - {m.FechaInicio}";
            new LogAuditoriaManager().RegistrarEvento(usuarioAccionId, "Mantenimiento", "Creación", "", identificador);
        }

        public void UpdateMantenimiento(Mantenimiento m, int usuarioAccionId)
        {
            Validate(m);

            var mCrud = new MantenimientoCrudFactory();
            var anterior = mCrud.RetrieveById<Mantenimiento>(m.Id);

            mCrud.Update(m);

            RegistrarCambios(anterior, m, usuarioAccionId);
        }

        public void DeleteMantenimiento(Mantenimiento m, int usuarioAccionId)
        {
            var mCrud = new MantenimientoCrudFactory();
            mCrud.Delete(m);

            var identificador = $"Turbina {m.TurbinaId} - {m.FechaInicio}";
            new LogAuditoriaManager().RegistrarEvento(usuarioAccionId, "Mantenimiento", "Eliminación", identificador, "");
        }

        private void RegistrarCambios(Mantenimiento anterior, Mantenimiento nuevo, int usuarioAccionId)
        {
            if (anterior == null) return;

            var logManager = new LogAuditoriaManager();

            if (anterior.TurbinaId != nuevo.TurbinaId)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "TurbinaId", anterior.TurbinaId.ToString(), nuevo.TurbinaId.ToString());

            if (anterior.UsuarioId != nuevo.UsuarioId)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "UsuarioId", anterior.UsuarioId.ToString(), nuevo.UsuarioId.ToString());

            if (anterior.FechaInicio != nuevo.FechaInicio)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "FechaInicio", anterior.FechaInicio.ToString(), nuevo.FechaInicio.ToString());

            if (anterior.HoraInicio != nuevo.HoraInicio)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "HoraInicio", anterior.HoraInicio.ToString(), nuevo.HoraInicio.ToString());

            if (anterior.FechaFin != nuevo.FechaFin)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "FechaFin", anterior.FechaFin?.ToString() ?? "", nuevo.FechaFin?.ToString() ?? "");

            if (anterior.HoraFin != nuevo.HoraFin)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "HoraFin", anterior.HoraFin?.ToString() ?? "", nuevo.HoraFin?.ToString() ?? "");

            if (anterior.TipoMantenimiento != nuevo.TipoMantenimiento)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "Tipo", anterior.TipoMantenimiento, nuevo.TipoMantenimiento);

            if (anterior.EstadoMantenimiento != nuevo.EstadoMantenimiento)
                logManager.RegistrarEvento(usuarioAccionId, "Mantenimiento", "Estado", anterior.EstadoMantenimiento, nuevo.EstadoMantenimiento);
        }



        //Metodo para Validar los ingresos a los metodo de llamado al crud
        public void Validate(Mantenimiento mantenimiento)
        {
            if(mantenimiento.TurbinaId <= 0)
            {
                throw new Exception("El ID de la turbina es obligatorio");
            }
            if (mantenimiento.UsuarioId <= 0)
                throw new Exception("El ID del usuario es obligatorio");
            if (mantenimiento.FechaInicio == default)
                throw new Exception("La fecha de inicio es obligatoria");
            if (mantenimiento.HoraInicio == default)
                throw new Exception("La hora de inicio es obligatoria");
            if (string.IsNullOrWhiteSpace(mantenimiento.TipoMantenimiento))
                throw new Exception("El tipo de mantenimiento es obligatorio");
            if (string.IsNullOrWhiteSpace(mantenimiento.EstadoMantenimiento))
                throw new Exception("El estado del mantenimiento es obligatorio.");

            if (mantenimiento.FechaFin.HasValue && mantenimiento.FechaFin < mantenimiento.FechaInicio)
                throw new Exception("La fecha de fin no puede ser anterior a la fecha de inicio.");







        }


    }
}
