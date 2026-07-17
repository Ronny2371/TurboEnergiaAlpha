using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class TurbinaCrudFactory : CrudFactory
    {
        public TurbinaCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }

        public override void Create(BaseDTO baseDTO)
        {
            //Convirtiendo el baseDTO en un objeto usuario
            var turbina = baseDTO as Turbina;

            //definir el SP, por medio del sqlOperation
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_TURBINA_PR";
            sqlOperation.AddStringParameter("P_NOMBRE", turbina.Nombre);
            sqlOperation.AddStringParameter("P_MODELO", turbina.Modelo);
            sqlOperation.AddStringParameter("P_MARCA", turbina.Marca);
            sqlOperation.AddIntParameter("P_ANIO_FABRICACION", turbina.anioFabricacion);
            sqlOperation.AddDecimalParameter("P_CAPACIDAD_KWH", turbina.capacidadKwh);
            sqlOperation.AddStringParameter("P_ESTADO", turbina.Estado.ToString());


            //Ejecutamos el SP
            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override void Update(BaseDTO baseDTO)
        {
            var turbina = baseDTO as Turbina;
            var sqlOperation = new SqlOperation();

            sqlOperation.ProcedureName = "UPD_TURBINA_PR";
            sqlOperation.AddStringParameter("P_NOMBRE", turbina.Nombre);
            sqlOperation.AddStringParameter("P_MODELO", turbina.Modelo);
            sqlOperation.AddStringParameter("P_MARCA", turbina.Marca);
            sqlOperation.AddIntParameter("P_ANIO_FABRICACION", turbina.anioFabricacion);
            sqlOperation.AddDecimalParameter("P_CAPACIDAD_KWH", turbina.capacidadKwh);
            sqlOperation.AddStringParameter("P_ESTADO", turbina.Estado.ToString());

            //Ejecutamos el SP
            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstTurbinas = new List<T>();
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALL_TURBINAS_PR";
            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);
            if (lstResults.Count > 0)
            {
                foreach (var result in lstResults)
                {
                    var turbina = BuildTurbina(result);
                    lstTurbinas.Add((T)Convert.ChangeType(turbina, typeof(T)));
                }
            }
            return lstTurbinas;
        }

        public override T RetrieveById<T>(int id)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_TURBINA_BY_ID_PR";
            sqlOperation.AddIntParameter("P_ID", id);

            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                var turbina = BuildTurbina(lstResults[0]);

                return (T)Convert.ChangeType(turbina, typeof(T));
            }

            return default(T);
        }

        public override void Delete(BaseDTO baseDTO)
        {
            var turbina = baseDTO as Turbina;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "DEL_TURBINA_PR";
            sqlOperation.AddIntParameter("P_ID", turbina.Id);

            sqlDao.ExecuteProcedure(sqlOperation);
        }



        //Build Turbina - - - - - -
        private Turbina BuildTurbina(Dictionary<string, object> row)
        {
            var turbina = new Turbina()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                Nombre = (string)row["Nombre"],
                Modelo = (string)row["Modelo"],
                Marca = (string)row["Marca"],
                anioFabricacion = (int)row["anioFabricacion"],
                capacidadKwh = (decimal)row["capacidadKwh"],
                Estado = (EstadoTurbina)row["Estado"],
            };
            return turbina;

        }
    }
}
