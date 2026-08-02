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

        public void CreateTurbina(Turbina t, int usuarioAccionId)
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

            new LogAuditoriaManager().RegistrarEvento(usuarioAccionId, "Turbina", "Creación", "", t.Nombre);
        }
        public void UpdateTurbina(Turbina t, int usuarioAccionId)
        {
            var tCrud = new TurbinaCrudFactory();
            var anterior = tCrud.RetrieveById<Turbina>(t.Id);

            tCrud.Update(t);

            RegistrarCambios(anterior, t, usuarioAccionId);
        }
        public void DeleteTurbina(Turbina t, int usuarioAccionId)
        {
            var uCrud = new TurbinaCrudFactory();
            uCrud.Delete(t);

            new LogAuditoriaManager().RegistrarEvento(usuarioAccionId, "Turbina", "Eliminación", t.Nombre, "");
        }

        private void RegistrarCambios(Turbina anterior, Turbina nuevo, int usuarioAccionId)
        {
            if (anterior == null) return;

            var logManager = new LogAuditoriaManager();

            if (anterior.Nombre != nuevo.Nombre)
                logManager.RegistrarEvento(usuarioAccionId, "Turbina", "Nombre", anterior.Nombre, nuevo.Nombre);

            if (anterior.Modelo != nuevo.Modelo)
                logManager.RegistrarEvento(usuarioAccionId, "Turbina", "Modelo", anterior.Modelo, nuevo.Modelo);

            if (anterior.Marca != nuevo.Marca)
                logManager.RegistrarEvento(usuarioAccionId, "Turbina", "Marca", anterior.Marca, nuevo.Marca);

            if (anterior.anioFabricacion != nuevo.anioFabricacion)
                logManager.RegistrarEvento(usuarioAccionId, "Turbina", "AnioFabricacion", anterior.anioFabricacion.ToString(), nuevo.anioFabricacion.ToString());

            if (anterior.capacidadKwh != nuevo.capacidadKwh)
                logManager.RegistrarEvento(usuarioAccionId, "Turbina", "CapacidadKwh", anterior.capacidadKwh.ToString(), nuevo.capacidadKwh.ToString());

            if (anterior.Estado != nuevo.Estado)
                logManager.RegistrarEvento(usuarioAccionId, "Turbina", "Estado", anterior.Estado, nuevo.Estado);
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
