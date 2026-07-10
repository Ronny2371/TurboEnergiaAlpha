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
            sqlOperation.AddStringParameter("P_UBICACION", turbina.Ubicacion);
            sqlOperation.AddStringParameter("P_MODELO", turbina.Modelo);
            sqlOperation.AddStringParameter("P_MARCA", turbina.Marca);
            sqlOperation.AddIntParameter("P_ANIO_FABRICACION", turbina.anioFabricacion);
            sqlOperation.AddDecimalParameter("P_CAPACIDAD_KWH", turbina.capacidadKwh);
            sqlOperation.AddStringParameter("P_ESTADO", turbina.Estado.ToString());


            //Ejecutamos el SP
            sqlDao.ExecuteProcedure(sqlOperation);
        }
    }
}
