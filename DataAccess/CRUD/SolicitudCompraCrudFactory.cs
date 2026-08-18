using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class SolicitudCompraCrudFactory : CrudFactory
    {
        public SolicitudCompraCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }

        public override void Create(BaseDTO baseDTO)
        {
            var solicitud = baseDTO as SolicitudCompra;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_SOLICITUD_COMPRA_PR";

            sqlOperation.AddIntParameter("P_USUARIO_ID", solicitud.Usuario.Id);
            sqlOperation.AddIntParameter("P_MES_SOLICITADO", solicitud.MesSolicitado);
            sqlOperation.AddIntParameter("P_ANIO_SOLICITADO", solicitud.AnioSolicitado);
            sqlOperation.AddDecimalParameter("P_CANTIDAD_MWH", solicitud.CantidadMWh);
            sqlOperation.AddStringParameter("P_ESTADO", solicitud.Estado.ToString());

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override void Update(BaseDTO baseDTO)
        {
            var solicitud = baseDTO as SolicitudCompra;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "UPD_SOLICITUD_COMPRA_PR";

            sqlOperation.AddIntParameter("P_ID", solicitud.Id);
            sqlOperation.AddIntParameter("P_USUARIO_ID", solicitud.Usuario.Id);
            sqlOperation.AddIntParameter("P_MES_SOLICITADO", solicitud.MesSolicitado);
            sqlOperation.AddIntParameter("P_ANIO_SOLICITADO", solicitud.AnioSolicitado);
            sqlOperation.AddDecimalParameter("P_CANTIDAD_MWH", solicitud.CantidadMWh);
            sqlOperation.AddStringParameter("P_ESTADO", solicitud.Estado.ToString());

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        //Actualiza SOLO la cantidad actual, sin tocar CantidadMWhOriginal - lo usa el recorte proporcional
        public void UpdateCantidad(int id, decimal nuevaCantidad)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "UPD_SOLICITUD_COMPRA_CANTIDAD_PR";

            sqlOperation.AddIntParameter("P_ID", id);
            sqlOperation.AddDecimalParameter("P_CANTIDAD_MWH", nuevaCantidad);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override void Delete(BaseDTO baseDTO)
        {
            var solicitud = baseDTO as SolicitudCompra;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "DEL_SOLICITUD_COMPRA_PR";

            sqlOperation.AddIntParameter("P_ID", solicitud.Id);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override T RetrieveById<T>(int id)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_SOLICITUD_COMPRA_BY_ID_PR";
            sqlOperation.AddIntParameter("P_ID", id);

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                var solicitud = BuildSolicitudCompra(lstResults[0]);
                return (T)Convert.ChangeType(solicitud, typeof(T));
            }

            return default(T);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstSolicitudes = new List<T>();

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALL_SOLICITUDES_COMPRA_PR";

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                foreach (var result in lstResults)
                {
                    var solicitud = BuildSolicitudCompra(result);

                    lstSolicitudes.Add((T)Convert.ChangeType(solicitud, typeof(T)));
                }
            }

            return lstSolicitudes;
        }

        private SolicitudCompra BuildSolicitudCompra(Dictionary<string, object> row)
        {
            var solicitud = new SolicitudCompra()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                MesSolicitado = (int)row["MesSolicitado"],
                AnioSolicitado = (int)row["AnioSolicitado"],
                CantidadMWh = (decimal)row["CantidadMWh"],
                CantidadMWhOriginal = (decimal)row["CantidadMWhOriginal"],
                Estado = Enum.Parse<EstadoSolicitud>((string)row["Estado"]),
                Usuario = new User() { Id = (int)row["UsuarioId"] }
            };

            return solicitud;
        }
    }
}