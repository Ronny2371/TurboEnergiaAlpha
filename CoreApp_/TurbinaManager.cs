using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreApp_
{
    public class TurbinaManager
    {
        public List<Turbina> RetrieveAllTurbinas()
        {
            var tCrud = new TurbinaCrudFactory();
            return tCrud.RetrieveAll<Turbina>();
        }

        public Turbina RetrieveTurbinaById(int id)
        {
            var tCrud = new TurbinaCrudFactory();
            return tCrud.RetrieveById<Turbina>(id);
        }

        public void CreateTurbina(Turbina t)
        {
            Validate(t);

            var tCrud = new TurbinaCrudFactory();

            // Verificar si ya existe una turbina con ese nombre
            var turbinaExistente = tCrud.RetrieveByNombre(t.Nombre);

            if (turbinaExistente != null)
            {
                throw new Exception("Ya existe una turbina registrada con ese nombre.");
            }

            tCrud.Create(t);
        }
        public void UpdateTurbina(Turbina t)
        {
            var tCrud = new TurbinaCrudFactory();
            tCrud.Update(t);
        }
        public void DeleteTurbina(Turbina t)
        {
            var uCrud = new TurbinaCrudFactory();
            uCrud.Delete(t);
        }

        private void Validate(Turbina turbina)
        {
            // Nombre
            if (string.IsNullOrWhiteSpace(turbina.Nombre))
                throw new Exception("El nombre de la turbina es obligatorio.");

            // Modelo
            if (string.IsNullOrWhiteSpace(turbina.Modelo))
                throw new Exception("El modelo es obligatorio.");

            // Marca
            if (string.IsNullOrWhiteSpace(turbina.Marca))
                throw new Exception("La marca es obligatoria.");

            // Estado
            if (string.IsNullOrWhiteSpace(turbina.Estado))
                throw new Exception("El estado es obligatorio.");

            // Capacidad
            if (turbina.capacidadKwh <= 0)
                throw new Exception("La capacidad debe ser mayor que cero.");

            // Año
            int anioActual = DateTime.Now.Year;

            if (turbina.anioFabricacion < 1900)
                throw new Exception("El año de fabricación no puede ser menor a 1900.");

            if (turbina.anioFabricacion > anioActual)
                throw new Exception("El año de fabricación no puede ser mayor al año actual.");

            // Nombre repetido
            var crud = new TurbinaCrudFactory();

            var existente = crud.RetrieveByNombre(turbina.Nombre);

            if (existente != null)
                throw new Exception("Ya existe una turbina con ese nombre.");
        }
    }
}
