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

        public void CreateMantenimiento(Mantenimiento m)
        {
            Validate(m);

            var mCrud = new MantenimientoCrudFactory();
            mCrud.Create(m);
        }

        public void UpdateMantenimiento(Mantenimiento m)
        {
            Validate(m);

            var mCrud = new MantenimientoCrudFactory();
            mCrud.Update(m);
        }

        public void DeleteMantenimiento(Mantenimiento m)
        {
            var mCrud = new MantenimientoCrudFactory();
            mCrud.Delete(m);
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
