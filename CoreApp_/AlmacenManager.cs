using Entities_DTOs;
using DataAccess.CRUD;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CoreApp_
{
    public class AlmacenManager
    {
        private const decimal CAPACIDAD_MAXIMA = 40000; //esto son MWh

        public AlmacenCentral GetAlmacen()
        {
            var aCrud = new AlmacenCrudFactory();
            var lstAlmacenes = aCrud.RetrieveAll<AlmacenCentral>();

            if (lstAlmacenes.Count == 0)
            {
                throw new Exception("Almacen no encontrado");
            }

            return lstAlmacenes[0];
        }

        public void UpdateAlmacenado(decimal nuevoAlmacenado)
        {
            Validate(nuevoAlmacenado);

            var almacen = GetAlmacen();
            almacen.Almacenado = nuevoAlmacenado;
            almacen.Updated = DateTime.Now;
            var aCrud = new AlmacenCrudFactory();

            aCrud.Update(almacen);
        }

        public decimal GetOcupacionPorcentaje()
        {
            var almacen = GetAlmacen();
            return (almacen.Almacenado / CAPACIDAD_MAXIMA) * 100;
        }

        public decimal GetCapacidadDisponible()
        {
            var almacen = GetAlmacen();
            return CAPACIDAD_MAXIMA - almacen.Almacenado;
        }

        public bool PuedeAlmacenarEnergia(decimal energiaAAlmacenar)
        {
            var almacen = GetAlmacen();
            return (almacen.Almacenado + energiaAAlmacenar) <= CAPACIDAD_MAXIMA;
        }

        //Suma de lo pedido originalmente por todas las solicitudes pendientes (la demanda real, sin importar si ya se recortaron antes)
        public decimal GetDemandaTotalPendiente()
        {
            var sCrud = new SolicitudCompraCrudFactory();
            return sCrud.RetrieveAll<SolicitudCompra>()
                .Where(s => s.Estado == EstadoSolicitud.PENDIENTE)
                .Sum(s => s.CantidadMWhOriginal);
        }

        //Aplica el mismo porcentaje a todas las solicitudes pendientes, y actualiza la factura asociada de cada una
        public void AplicarRecorteProporcional(decimal porcentaje)
        {
            if (porcentaje <= 0 || porcentaje > 100)
                throw new Exception("El porcentaje debe estar entre 1 y 100.");

            var sCrud = new SolicitudCompraCrudFactory();
            var rCrud = new ReporteFacturacionCrudFactory();

            var lstSolicitudes = sCrud.RetrieveAll<SolicitudCompra>()
                .Where(s => s.Estado == EstadoSolicitud.PENDIENTE)
                .ToList();

            var lstReportes = rCrud.RetrieveAll<ReporteFacturacion>();

            foreach (var s in lstSolicitudes)
            {
                var nuevaCantidad = Math.Round(s.CantidadMWhOriginal * (porcentaje / 100m), 2);

                sCrud.UpdateCantidad(s.Id, nuevaCantidad);
                ActualizarFacturaAsociada(s, nuevaCantidad, lstReportes, rCrud);
            }
        }

        //Vuelve a poner la cantidad original en todas las solicitudes pendientes que hayan sido recortadas
        public void RevertirRecorte()
        {
            var sCrud = new SolicitudCompraCrudFactory();
            var rCrud = new ReporteFacturacionCrudFactory();

            var lstSolicitudes = sCrud.RetrieveAll<SolicitudCompra>()
                .Where(s => s.Estado == EstadoSolicitud.PENDIENTE && s.CantidadMWh != s.CantidadMWhOriginal)
                .ToList();

            var lstReportes = rCrud.RetrieveAll<ReporteFacturacion>();

            foreach (var s in lstSolicitudes)
            {
                sCrud.UpdateCantidad(s.Id, s.CantidadMWhOriginal);
                ActualizarFacturaAsociada(s, s.CantidadMWhOriginal, lstReportes, rCrud);
            }
        }

        //Busca la factura asociada a la solicitud (por UsuarioId + mes/año) y recalcula sus montos con la nueva cantidad
        private void ActualizarFacturaAsociada(SolicitudCompra s, decimal nuevaCantidad, List<ReporteFacturacion> lstReportes, ReporteFacturacionCrudFactory rCrud)
        {
            var reporte = lstReportes.FirstOrDefault(r =>
                r.UsuarioId == s.Usuario.Id &&
                r.Periodo.Month == s.MesSolicitado &&
                r.Periodo.Year == s.AnioSolicitado);

            if (reporte == null) return;

            reporte.EnergiaAsignada = nuevaCantidad;
            reporte.Subtotal = nuevaCantidad * reporte.PrecioMWh;
            reporte.Impuesto = reporte.Subtotal * 0.13m;
            reporte.Total = reporte.Subtotal + reporte.Impuesto;

            rCrud.Update(reporte);
        }

        private void Validate(decimal almacenado)
        {
            if (almacenado > CAPACIDAD_MAXIMA)
                throw new Exception($"El almacén no puede exceder {CAPACIDAD_MAXIMA} MWh.");

            if (almacenado < 0)
                throw new Exception("El almacenado no puede ser negativo.");
        }
    }
}