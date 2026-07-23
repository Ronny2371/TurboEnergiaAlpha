using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Text;
using System.Xml.Linq;

namespace DataAccess.CRUD
{
    public class UserCrudFactory : CrudFactory
    {

        public UserCrudFactory()
        {
            sqlDao = SqlDao.GetInstance();
        }

        public override void Create(BaseDTO baseDTO)
        {
            var user = baseDTO as User;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CRE_USER_PR";

            sqlOperation.AddIntParameter("P_IDENTIFICACION", user.Identificacion);
            sqlOperation.AddStringParameter("P_NOMBRE", user.Nombre);
            sqlOperation.AddStringParameter("P_APELLIDO1", user.Apellido1);
            sqlOperation.AddStringParameter("P_APELLIDO2", user.Apellido2);
            sqlOperation.AddStringParameter("P_CORREO", user.Correo);
            sqlOperation.AddIntParameter("P_TELEFONO", user.Telefono);
            sqlOperation.AddDateTimeParameter("P_FECHA_NACIMIENTO", user.FechaNacimiento.ToDateTime(TimeOnly.MinValue));
            sqlOperation.AddStringParameter("P_FOTO_PERFIL", user.FotoPerfil);
            sqlOperation.AddStringParameter("P_CONTRASENA", user.Contrasena);

            sqlDao.ExecuteProcedure(sqlOperation);

        }

        public override void Delete(BaseDTO baseDTO)
        {
            var user = baseDTO as User;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "DEL_USER_PR";

            sqlOperation.AddIntParameter("P_ID", user.Id);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        public override List<T> RetrieveAll<T>()
        {
            var lstUsers = new List<T>();

            var operation = new SqlOperation();
            operation.ProcedureName = "RET_ALL_USERS_PR";

            var lstResults = sqlDao.ExecuteQueryProcedure(operation);

            if (lstResults.Count > 0)
            {
                foreach (var result in lstResults)
                {
                    var user = BuildUser(result);

                    lstUsers.Add((T)Convert.ChangeType(user, typeof(T)));
                }
            }

            return lstUsers;
        }

        public override T RetrieveById<T>(int id)
        {
            var operation = new SqlOperation();
            operation.ProcedureName = "RET_USER_BY_ID_PR";
            operation.AddIntParameter("P_ID", id);

            var lstResults = sqlDao.ExecuteQueryProcedure(operation);

            if (lstResults.Count > 0)
            {
                var user = BuildUser(lstResults[0]);
                return (T)Convert.ChangeType(user, typeof(T));
            }

            return default(T);
        }

        public override void Update(BaseDTO baseDTO)
        {
            var user = baseDTO as User;

            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "UPD_USER_PR";

            sqlOperation.AddIntParameter("P_ID", user.Id);
            sqlOperation.AddIntParameter("P_IDENTIFICACION", user.Identificacion);
            sqlOperation.AddStringParameter("P_NOMBRE", user.Nombre);
            sqlOperation.AddStringParameter("P_APELLIDO1", user.Apellido1);
            sqlOperation.AddStringParameter("P_APELLIDO2", user.Apellido2);
            sqlOperation.AddStringParameter("P_CORREO", user.Correo);
            sqlOperation.AddIntParameter("P_TELEFONO", user.Telefono);
            sqlOperation.AddDateTimeParameter("P_FECHA_NACIMIENTO", user.FechaNacimiento.ToDateTime(TimeOnly.MinValue));
            sqlOperation.AddStringParameter("P_FOTO_PERFIL", user.FotoPerfil);
            sqlOperation.AddStringParameter("P_CONTRASENA", user.Contrasena);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        private User BuildUser(Dictionary<string, object> row)
        {
            var user = new User()
            {
                Id = (int)row["Id"],
                Created = (DateTime)row["Created"],
                Identificacion = (int)row["Identificacion"],
                Nombre = (string)row["Nombre"],
                Apellido1 = (string)row["Apellido1"],
                Apellido2 = (string)row["Apellido2"],
                Telefono = (int)row["Telefono"],
                Correo = (string)row["Correo"],
                FechaNacimiento = DateOnly.FromDateTime((DateTime)row["FechaNacimiento"]),
                FotoPerfil = (string)row["FotoPerfil"],
                Contrasena = (string)row["Contrasena"],
                Rol = new Rol() { Id = (int)row["RolId"] },
                Otp = row["Otp"] != DBNull.Value ? (string)row["Otp"] : null,
                OtpExpiracion = row["OtpExpiracion"] != DBNull.Value ? (DateTime)row["OtpExpiracion"] : (DateTime?)null
            };

            return user;
        }

        //Recibe ID Usario, llama al SP y guarda el OTP y la fecha de expiración en la base de datos
        public void SetOtp(int userId, string otp, DateTime expiracion)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "SET_OTP_PR";

            sqlOperation.AddIntParameter("P_ID", userId);
            sqlOperation.AddStringParameter("P_OTP", otp);
            sqlOperation.AddDateTimeParameter("P_OTP_EXPIRACION", expiracion);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        //Pone Null en el campo OTP y OTP_EXPIRACION del usuario, para que no pueda volver a usar el mismo OTP
        public void ClearOtp(int userId)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "CLEAR_OTP_PR";

            sqlOperation.AddIntParameter("P_ID", userId);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

        //Buscar usuario con el correo, si no existe devuelve null, si existe devuelve el usuario
        public User GetByEmail(string correo)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "GET_USER_BY_EMAIL_PR";
            sqlOperation.AddStringParameter("P_CORREO", correo);

            var results = sqlDao.ExecuteQueryProcedure(sqlOperation);

            if (results.Count == 0)
                return null;

            return BuildUser(results[0]);
        }

        public void UpdatePassword(int userId, string nuevaContrasena)
        {
            var sqlOperation = new SqlOperation();
            sqlOperation.ProcedureName = "UPD_PASSWORD_PR";

            sqlOperation.AddIntParameter("P_ID", userId);
            sqlOperation.AddStringParameter("P_CONTRASENA", nuevaContrasena);

            sqlDao.ExecuteProcedure(sqlOperation);
        }

    }
}
