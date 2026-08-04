using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public class CorteEnergiaCrudFactory : CrudFactory
    {
        public CorteEnergiaCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }


        public override void Create(BaseDTO baseDTO)
        {
            var corte = baseDTO as CorteEnergia;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_CORTE_DE_ENERGIA_PR";
            sqlOperation.AddDecimalParameter("P_ENERGIA_GENERADA", corte.EnergiaGenerada);
            sqlOperation.AddDecimalParameter("P_ENERGIA_SOLICITADA", corte.EnergiaSolicitada);
            sqlOperation.AddDecimalParameter("P_BALANCE", corte.Balance);
            sqlOperation.AddIntParameter("P_PORCENTAJE", corte.Porcentaje);
            sqlOperation.AddIntParameter("P_CANTIDAD_HORAS", corte.CantidadHoras);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstCortes = new List<T>();
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "RET_ALL_CORTES_DE_ENERGIA_PR";
            var lstResults = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if(lstResults.Count > 0)
            {
                foreach (var result in lstResults)
                {
                    var corte = BuildCorteDeEnergia(result);
                    lstCortes.Add((T)Convert.ChangeType(corte, typeof(T)));
                }
            }
            return lstCortes;
        }

        private CorteEnergia BuildCorteDeEnergia(Dictionary<string, object> row)
        {
            var corte = new CorteEnergia()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                Updated = row["Updated"] != DBNull.Value ? (DateTime)row["Updated"] : DateTime.MinValue,
                EnergiaGenerada = (decimal)row["EnergiaGenerada"],
                EnergiaSolicitada = (decimal)row["EnergiaSolicitada"],
                Balance = (decimal)row["Balance"],
                Porcentaje = (int)row["Porcentaje"],
                CantidadHoras = (int)row["CantidadHoras"]
            };

            return corte;
        }

        public override void Update(BaseDTO baseDTO)
        {
            throw new NotImplementedException("CorteDeEnergía no soporta Update");
        }

        public override T RetrieveById<T>(int id)
        {
            throw new NotImplementedException("CorteDeEnergía no soporta RetrieveById");
        }

        public override void Delete(BaseDTO baseDTO)
        {
            throw new NotImplementedException("CorteDeEnergía no soporta Delete");
        }
    }
}
