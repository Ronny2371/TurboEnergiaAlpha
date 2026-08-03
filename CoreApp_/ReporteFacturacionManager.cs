using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreApp_
{
    public class ReporteFacturacionManager
    {
        public List<ReporteFacturacion> RetrieveAllReportes()
        {
            var rCrud = new ReporteFacturacionCrudFactory();
            return rCrud.RetrieveAll<ReporteFacturacion>();
        }

        public ReporteFacturacion RetrieveReporteById(int id)
        {
            var rCrud = new ReporteFacturacionCrudFactory();
            return rCrud.RetrieveById<ReporteFacturacion>(id);
        }

        // El reporte mas reciente del distribuidor logueado, usado por la pagina de Reporte de Distribucion
        public ReporteFacturacion RetrieveUltimoReporte(int usuarioId)
        {
            var rCrud = new ReporteFacturacionCrudFactory();
            return rCrud.RetrieveUltimoPorUsuario(usuarioId);
        }

        public void CreateReporte(ReporteFacturacion r)
        {
            Validate(r);

            var rCrud = new ReporteFacturacionCrudFactory();
            rCrud.Create(r);
        }

        public void UpdateReporte(ReporteFacturacion r)
        {
            Validate(r);

            var rCrud = new ReporteFacturacionCrudFactory();
            rCrud.Update(r);
        }

        public void DeleteReporte(ReporteFacturacion r)
        {
            var rCrud = new ReporteFacturacionCrudFactory();
            rCrud.Delete(r);
        }

        private void Validate(ReporteFacturacion reporte)
        {
            if (string.IsNullOrWhiteSpace(reporte.Distribuidor))
                throw new Exception("El distribuidor es obligatorio.");

            if (string.IsNullOrWhiteSpace(reporte.NumeroFactura))
                throw new Exception("El número de factura es obligatorio.");

            if (string.IsNullOrWhiteSpace(reporte.Estado))
                throw new Exception("El estado es obligatorio.");

            if (reporte.EnergiaAsignada <= 0)
                throw new Exception("La energía asignada debe ser mayor que cero.");

            if (reporte.PrecioMWh <= 0)
                throw new Exception("El precio por MWh debe ser mayor que cero.");
        }
    }
}
