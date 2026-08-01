using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class ReporteFacturacionCrudFactory : CrudFactory
    {
        public ReporteFacturacionCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }

        public override void Create(BaseDTO baseDTO)
        {
            var reporte = baseDTO as ReporteFacturacion;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_REPORTE_FACTURACION_PR";
            sqlOperation.AddIntParameter("P_USUARIO_ID", reporte.UsuarioId);
            sqlOperation.AddStringParameter("P_DISTRIBUIDOR", reporte.Distribuidor);
            sqlOperation.AddStringParameter("P_NUMERO_FACTURA", reporte.NumeroFactura);
            sqlOperation.AddDateTimeParameter("P_PERIODO", reporte.Periodo);
            sqlOperation.AddStringParameter("P_ESTADO", reporte.Estado);
            sqlOperation.AddDecimalParameter("P_ENERGIA_ASIGNADA", reporte.EnergiaAsignada);
            sqlOperation.AddDecimalParameter("P_PRECIO_MWH", reporte.PrecioMWh);
            sqlOperation.AddDecimalParameter("P_SUBTOTAL", reporte.Subtotal);
            sqlOperation.AddDecimalParameter("P_IMPUESTO", reporte.Impuesto);
            sqlOperation.AddDecimalParameter("P_TOTAL", reporte.Total);
            sqlOperation.AddDateTimeParameter("P_FECHA_EMISION", reporte.FechaEmision);
            sqlOperation.AddDateTimeParameter("P_FECHA_VENCIMIENTO", reporte.FechaVencimiento);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override void Update(BaseDTO baseDTO)
        {
            var reporte = baseDTO as ReporteFacturacion;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "UPD_REPORTE_FACTURACION_PR";
            sqlOperation.AddIntParameter("P_ID", reporte.Id);
            sqlOperation.AddIntParameter("P_USUARIO_ID", reporte.UsuarioId);
            sqlOperation.AddStringParameter("P_DISTRIBUIDOR", reporte.Distribuidor);
            sqlOperation.AddStringParameter("P_NUMERO_FACTURA", reporte.NumeroFactura);
            sqlOperation.AddDateTimeParameter("P_PERIODO", reporte.Periodo);
            sqlOperation.AddStringParameter("P_ESTADO", reporte.Estado);
            sqlOperation.AddDecimalParameter("P_ENERGIA_ASIGNADA", reporte.EnergiaAsignada);
            sqlOperation.AddDecimalParameter("P_PRECIO_MWH", reporte.PrecioMWh);
            sqlOperation.AddDecimalParameter("P_SUBTOTAL", reporte.Subtotal);
            sqlOperation.AddDecimalParameter("P_IMPUESTO", reporte.Impuesto);
            sqlOperation.AddDecimalParameter("P_TOTAL", reporte.Total);
            sqlOperation.AddDateTimeParameter("P_FECHA_EMISION", reporte.FechaEmision);
            sqlOperation.AddDateTimeParameter("P_FECHA_VENCIMIENTO", reporte.FechaVencimiento);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstReportes = new List<T>();
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALL_REPORTE_FACTURACION_PR";
            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);
            if (lstResults.Count > 0)
            {
                foreach (var result in lstResults)
                {
                    var reporte = BuildReporteFacturacion(result);
                    lstReportes.Add((T)Convert.ChangeType(reporte, typeof(T)));
                }
            }
            return lstReportes;
        }

        public override T RetrieveById<T>(int id)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_REPORTE_FACTURACION_BY_ID_PR";
            sqlOperation.AddIntParameter("P_ID", id);

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                var reporte = BuildReporteFacturacion(lstResults[0]);

                return (T)Convert.ChangeType(reporte, typeof(T));
            }

            return default(T);
        }

        public override void Delete(BaseDTO baseDTO)
        {
            var reporte = baseDTO as ReporteFacturacion;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "DEL_REPORTE_FACTURACION_PR";
            sqlOperation.AddIntParameter("P_ID", reporte.Id);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        // Trae el reporte de facturacion mas reciente para un distribuidor (el que se muestra en la pagina)
        public ReporteFacturacion RetrieveUltimoPorUsuario(int usuarioId)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_REPORTE_FACTURACION_ULTIMO_PR";
            sqlOperation.AddIntParameter("P_USUARIO_ID", usuarioId);

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                return BuildReporteFacturacion(lstResults[0]);
            }

            return null;
        }

        //Build ReporteFacturacion - - - - - -
        private ReporteFacturacion BuildReporteFacturacion(Dictionary<string, object> row)
        {
            var reporte = new ReporteFacturacion()
            {
                Id = (int)row["Id"],
                UsuarioId = (int)row["UsuarioId"],
                Distribuidor = (string)row["Distribuidor"],
                NumeroFactura = (string)row["NumeroFactura"],
                Periodo = (DateTime)row["Periodo"],
                Estado = (string)row["Estado"],
                EnergiaAsignada = (decimal)row["EnergiaAsignada"],
                PrecioMWh = (decimal)row["PrecioMWh"],
                Subtotal = (decimal)row["Subtotal"],
                Impuesto = (decimal)row["Impuesto"],
                Total = (decimal)row["Total"],
                FechaEmision = (DateTime)row["FechaEmision"],
                FechaVencimiento = (DateTime)row["FechaVencimiento"],
            };
            return reporte;
        }
    }
}
