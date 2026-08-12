using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CoreApp_
{
    public class ReporteFacturacionManager
    {
        private const int ROL_DISTRIBUIDOR = 2;
        private const int LIMITE_SOLICITUDES_ANIO = 6;

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

        // Segun rolId, agrega o no los datos extra del Distribuidor
        public ReporteFacturacion RetrieveUltimoReporte(int usuarioId, int rolId)
        {
            var rCrud = new ReporteFacturacionCrudFactory();
            var reporte = rCrud.RetrieveUltimoPorUsuario(usuarioId);

            if (reporte != null && rolId == ROL_DISTRIBUIDOR)
                AgregarDatosDistribuidor(reporte, usuarioId);

            return reporte;
        }

        // Agrega historial, contador anual y volumen distribuido del Distribuidor
        private void AgregarDatosDistribuidor(ReporteFacturacion reporte, int usuarioId)
        {
            var solicitudesUsuario = new SolicitudCompraManager().RetrieveAllSolicitudes()
                .Where(s => s.Usuario != null && s.Usuario.Id == usuarioId)
                .ToList();

            reporte.HistorialSolicitudes = solicitudesUsuario;
            reporte.LimiteSolicitudesAnio = LIMITE_SOLICITUDES_ANIO;
            reporte.SolicitudesActivasAnio = solicitudesUsuario.Count(s =>
                s.AnioSolicitado == DateTime.Now.Year && s.Estado != EstadoSolicitud.CANCELADA);
            reporte.VolumenTotalDistribuidoMWh = solicitudesUsuario
                .Where(s => s.Estado == EstadoSolicitud.PROCESADA)
                .Sum(s => s.CantidadMWh);

            reporte.DetalleFacturacionDistribucion = RetrieveAllReportes()
                .Where(r => r.UsuarioId == usuarioId)
                .OrderByDescending(r => r.Periodo)
                .ToList();
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
