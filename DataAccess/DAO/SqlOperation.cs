using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Data.SqlClient;

namespace DataAccess.DAO
{
    public class SqlOperation
    {
        public string ProcedureName { get; set; }
        public List<SqlParameter> Parameters { get; set; }

        public SqlOperation()
        {
            Parameters = new List<SqlParameter>();
        }

        //Solo vamos a trabajar con estos 4 tipos

        public void AddStringParameter(string parameterName, string value)
        {
            Parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddIntParameter(string parameterName, int value)
        {
            Parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddDoubleParameter(string parameterName, double value)
        {
            Parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddDecimalParameter(string parameterName, decimal value)
        {
            Parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddDateTimeParameter(string parameterName, DateTime value)
        {
            Parameters.Add(new SqlParameter(parameterName, value));
        }

        public void AddDateParameter(string parameterName, DateOnly value)
        {
            Parameters.Add(new SqlParameter(parameterName, value.ToDateTime(TimeOnly.MinValue)));
        }

        public void AddTimeParameter(string parameterName, TimeOnly value)
        {
            Parameters.Add(new SqlParameter(parameterName, value.ToTimeSpan()));
        }
        //====== Esto lo cree para poder poner la fechaFin y horaFin null en el mantenimiento cuando esta no este definida 
        public void AddNullParameter(string parameterName)
        {
            Parameters.Add(new SqlParameter(parameterName, DBNull.Value));
        }



    }
}
