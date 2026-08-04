using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class AlmacenCrudFactory : CrudFactory
    {
        public AlmacenCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }


        public override void Create(BaseDTO baseDTO)
        {
            throw new NotImplementedException("Almacen no soporta create - Solo existe una instancia");
        }

        public override void Update(BaseDTO baseDTO)
        {
            var almacen = baseDTO as AlmacenCentral;
            var sqlOperation = new SqlOperation();


            sqlOperation.ProcedureName = "UPD_ALMACENPR";
            sqlOperation.AddDecimalParameter("P_ALMACENADO", almacen.Almacenado);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstAlmacenes = new List<T>();
            var sqlOperation = new SqlOperation(); // Solo va a tener un registro
            sqlOperation.ProcedureName = "RET_ALMACEN_PR";


            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if(lstResults.Count > 0)
            {
                var almacen = BuildAlmacen(lstResults[0]);
                lstAlmacenes.Add((T)Convert.ChangeType(almacen, typeof(T)));
            }
            return lstAlmacenes;
        }

        public override T RetrieveById<T>(int id)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALMACEN_PR";
            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (lstResults.Count > 0)
            {
                var almacen = BuildAlmacen(lstResults[0]);
                return (T)Convert.ChangeType(almacen, typeof(T));
            }

            return default(T);
        }


        public override void Delete(BaseDTO baseDTO)
        {
            throw new NotImplementedException("Almacén no soporta Delete");
        }

        private AlmacenCentral BuildAlmacen(Dictionary<string, object> row)
        {
            var almacen = new AlmacenCentral()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                Updated = row["Updated"] != DBNull.Value ? (DateTime)row["Updated"] : DateTime.MinValue,
                CapacidadMaxima = (decimal)row["CapacidadMaxima"],
                Almacenado = (decimal)row["Almacenado"]
            };

            return almacen;
        }
    }
}
