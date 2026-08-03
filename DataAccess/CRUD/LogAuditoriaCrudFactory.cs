using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class LogAuditoriaCrudFactory : CrudFactory
    {
        public LogAuditoriaCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }

        public override void Create(BaseDTO baseDTO)
        {
            var log = baseDTO as LogAuditoria;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_AUDITORIA_PR";

            sqlOperation.AddIntParameter("P_USUARIO_ID", log.Usuario.Id);
            sqlOperation.AddStringParameter("P_ENTIDAD_MODIFICADA", log.EntidadModificada);
            sqlOperation.AddStringParameter("P_CAMPO_MODIFICADO", log.CampoModificado);
            sqlOperation.AddStringParameter("P_VALOR_ANTERIOR", log.ValorAnterior);
            sqlOperation.AddStringParameter("P_VALOR_NUEVO", log.ValorNuevo);
            sqlOperation.AddDateParameter("P_FECHA_EVENTO", log.FechaEvento);
            sqlOperation.AddTimeParameter("P_HORA_EVENTO", log.HoraEvento);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        //Un registro de auditoria es inmutable: no se puede editar ni eliminar
        public override void Update(BaseDTO baseDTO)
        {
            throw new NotSupportedException("Los registros de auditoría son inmutables y no se pueden modificar.");
        }

        public override void Delete(BaseDTO baseDTO)
        {
            throw new NotSupportedException("Los registros de auditoría son inmutables y no se pueden eliminar.");
        }

        public override List<T> RetrieveAll<T>()
        {
            return RetrieveAll<T>(null, null, null);
        }

        //Overload con filtros opcionales por entidad y rango de fechas
        public List<T> RetrieveAll<T>(string entidadModificada, DateOnly? fechaInicio, DateOnly? fechaFin)
        {
            var lstLogs = new List<T>();
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALL_AUDITORIA_PR";

            if (string.IsNullOrWhiteSpace(entidadModificada))
                sqlOperation.AddNullParameter("P_ENTIDAD_MODIFICADA");
            else
                sqlOperation.AddStringParameter("P_ENTIDAD_MODIFICADA", entidadModificada);

            if (fechaInicio.HasValue)
                sqlOperation.AddDateParameter("P_FECHA_INICIO", fechaInicio.Value);
            else
                sqlOperation.AddNullParameter("P_FECHA_INICIO");

            if (fechaFin.HasValue)
                sqlOperation.AddDateParameter("P_FECHA_FIN", fechaFin.Value);
            else
                sqlOperation.AddNullParameter("P_FECHA_FIN");

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            foreach (var result in lstResults)
            {
                var log = BuildLogAuditoria(result);
                lstLogs.Add((T)Convert.ChangeType(log, typeof(T)));
            }

            return lstLogs;
        }

        public override T RetrieveById<T>(int id)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_AUDITORIA_BY_ID_PR";
            sqlOperation.AddIntParameter("P_ID", id);

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                var log = BuildLogAuditoria(lstResults[0]);
                return (T)Convert.ChangeType(log, typeof(T));
            }

            return default(T);
        }

        //Build LogAuditoria - - - - - -
        //El objeto Usuario solo se puebla parcialmente (sin Contrasena), igual que Rol en UserCrudFactory
        private LogAuditoria BuildLogAuditoria(Dictionary<string, object> row)
        {
            var log = new LogAuditoria()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                EntidadModificada = (string)row["EntidadModificada"],
                CampoModificado = (string)row["CampoModificado"],
                ValorAnterior = (string)row["ValorAnterior"],
                ValorNuevo = (string)row["ValorNuevo"],
                FechaEvento = DateOnly.FromDateTime((DateTime)row["FechaEvento"]),
                HoraEvento = TimeOnly.FromTimeSpan((TimeSpan)row["HoraEvento"]),
                Usuario = new User()
                {
                    Id = (int)row["UsuarioId"],
                    Nombre = (string)row["UsuarioNombre"],
                    Apellido1 = (string)row["UsuarioApellido1"],
                    Apellido2 = (string)row["UsuarioApellido2"],
                    Correo = (string)row["UsuarioCorreo"],
                }
            };
            return log;
        }
    }
}
