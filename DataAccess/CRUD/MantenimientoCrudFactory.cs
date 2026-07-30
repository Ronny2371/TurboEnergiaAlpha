using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class MantenimientoCrudFactory : CrudFactory
    {
        public MantenimientoCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }

        public override void Create(BaseDTO baseDTO)
        {
            var mantenimiento = baseDTO as Mantenimiento;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_MANTENIMIENTO_PR";

            sqlOperation.AddIntParameter("P_TURBINA_ID", mantenimiento.TurbinaId);
            sqlOperation.AddIntParameter("P_USUARIO_ID", mantenimiento.UsuarioId);
            sqlOperation.AddDateParameter("P_FECHA_INICIO", mantenimiento.FechaInicio);
            sqlOperation.AddTimeParameter("P_HORA_INICIO", mantenimiento.HoraInicio);

            if (mantenimiento.FechaFin.HasValue)
                sqlOperation.AddDateParameter("P_FECHA_FIN", mantenimiento.FechaFin.Value);
            else
                sqlOperation.AddNullParameter("P_FECHA_FIN");

            if (mantenimiento.HoraFin.HasValue)
                sqlOperation.AddTimeParameter("P_HORA_FIN", mantenimiento.HoraFin.Value);
            else
                sqlOperation.AddNullParameter("P_HORA_FIN");

            sqlOperation.AddStringParameter("P_TIPO", mantenimiento.TipoMantenimiento);
            sqlOperation.AddStringParameter("P_ESTADO", mantenimiento.EstadoMantenimiento);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstMantenimientos = new List<T>();
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALL_MANTENIMIENTOS_PR";
            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                foreach (var result in lstResults)
                {
                    var mantenimiento = BuildMantenimiento(result);
                    lstMantenimientos.Add((T)Convert.ChangeType(mantenimiento, typeof(T)));
                }
            }
            return lstMantenimientos;
        }

        public override T RetrieveById<T>(int id)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_MANTENIMIENTO_BY_ID_PR";
            sqlOperation.AddIntParameter("P_ID", id);

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                var mantenimiento = BuildMantenimiento(lstResults[0]);
                return (T)Convert.ChangeType(mantenimiento, typeof(T));
            }

            return default(T);
        }

        public override void Update(BaseDTO baseDTO)
        {
            var mantenimiento = baseDTO as Mantenimiento;
            var sqlOperation = new SqlOperation();

            sqlOperation.ProcedureName = "UPD_MANTENIMIENTO_PR";

            sqlOperation.AddIntParameter("P_ID", mantenimiento.Id);
            sqlOperation.AddIntParameter("P_TURBINA_ID", mantenimiento.TurbinaId);
            sqlOperation.AddIntParameter("P_USUARIO_ID", mantenimiento.UsuarioId);
            sqlOperation.AddDateParameter("P_FECHA_INICIO", mantenimiento.FechaInicio);
            sqlOperation.AddTimeParameter("P_HORA_INICIO", mantenimiento.HoraInicio);

            if (mantenimiento.FechaFin.HasValue)
                sqlOperation.AddDateParameter("P_FECHA_FIN", mantenimiento.FechaFin.Value);
            else
                sqlOperation.AddNullParameter("P_FECHA_FIN");

            if (mantenimiento.HoraFin.HasValue)
                sqlOperation.AddTimeParameter("P_HORA_FIN", mantenimiento.HoraFin.Value);
            else
                sqlOperation.AddNullParameter("P_HORA_FIN");

            sqlOperation.AddStringParameter("P_TIPO", mantenimiento.TipoMantenimiento);
            sqlOperation.AddStringParameter("P_ESTADO", mantenimiento.EstadoMantenimiento);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override void Delete(BaseDTO baseDTO)
        {
            var mantenimiento = baseDTO as Mantenimiento;
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "DEL_MANTENIMIENTO_PR";
            sqlOperation.AddIntParameter("P_ID", mantenimiento.Id);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        private Mantenimiento BuildMantenimiento(Dictionary<string, object> row)
        {
            var mantenimiento = new Mantenimiento()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                TurbinaId = (int)row["TurbinaId"],
                UsuarioId = (int)row["UsuarioId"],
                FechaInicio = DateOnly.FromDateTime((DateTime)row["FechaInicio"]),
                HoraInicio = TimeOnly.FromTimeSpan((TimeSpan)row["HoraInicio"]),
                FechaFin = row["FechaFin"] != DBNull.Value ? DateOnly.FromDateTime((DateTime)row["FechaFin"]) : null,
                HoraFin = row["HoraFin"] != DBNull.Value ? TimeOnly.FromTimeSpan((TimeSpan)row["HoraFin"]) : null,
                TipoMantenimiento = (string)row["Tipo"],
                EstadoMantenimiento = (string)row["Estado"],
            };
            return mantenimiento;
        }
    }
}