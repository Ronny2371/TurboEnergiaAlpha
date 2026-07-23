using CoreApp_.Services;
using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace CoreApp_
{
    public class UserManager
    {

        public void Create(User u)
        {
            var uCrud = new UserCrudFactory();

            ValidateFields(u);

            if (EmailTaken(u.Correo))
            {
                throw new Exception("Ya existe un usuario registrado con ese correo.");
            }

            if (!ValidEmail(u.Correo))
            {
                throw new Exception("El formato del correo no es válido.");
            }

            if (IdentificacionTaken(u.Identificacion))
            {
                throw new Exception("Ya existe un usuario registrado con esa identificación.");
            }

            uCrud.Create(u);
        }

        public void Update(User u)
        {
            var uCrud = new UserCrudFactory();

            ValidateFields(u);

            if (EmailTaken(u.Correo, u.Id))
            {
                throw new Exception("Ya existe un usuario registrado con ese correo.");
            }

            if (!ValidEmail(u.Correo))
            {
                throw new Exception("El formato del correo no es válido.");
            }

            if (IdentificacionTaken(u.Identificacion, u.Id))
            {
                throw new Exception("Ya existe un usuario registrado con esa identificación.");
            }

            uCrud.Update(u);
        }

        public void Delete(User u)
        {
            var uCrud = new UserCrudFactory();
            uCrud.Delete(u);
        }


        public List<User> RetrieveAllUser()
        {
            var uCrud = new UserCrudFactory();
            return uCrud.RetrieveAll<User>();
        }

        public User RetrieveById(int id)
        {
            var uCrud = new UserCrudFactory();
            return uCrud.RetrieveById<User>(id);
        }

        public bool EmailTaken(string correo, int idExcluir = 0)
        {
            var lstUsers = RetrieveAllUser();
            return lstUsers.Any(u => u.Correo.Equals(correo, StringComparison.OrdinalIgnoreCase) && u.Id != idExcluir);
        }

        public bool ValidEmail(string correo)
        {
            return Regex.IsMatch(correo, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }

        public bool IdentificacionTaken(int identificacion, int idExcluir = 0)
        {
            var lstUsers = RetrieveAllUser();
            return lstUsers.Any(u => u.Identificacion == identificacion && u.Id != idExcluir);
        }

        public void ValidateFields(User u)
        {
            if (u.Identificacion == 0)
                throw new Exception("La identificación es obligatoria.");

            if (u.Identificacion <= 0)
                throw new Exception("La identificación debe ser un valor positivo.");

            if (string.IsNullOrWhiteSpace(u.Nombre))
                throw new Exception("El nombre es obligatorio.");

            if (string.IsNullOrWhiteSpace(u.Apellido1))
                throw new Exception("El primer apellido es obligatorio.");

            if (string.IsNullOrWhiteSpace(u.Apellido2))
                throw new Exception("El segundo apellido es obligatorio.");

            if (string.IsNullOrWhiteSpace(u.Correo))
                throw new Exception("El correo es obligatorio.");

            if (string.IsNullOrWhiteSpace(u.Contrasena))
                throw new Exception("La contraseña es obligatoria.");

            if (u.Telefono == 0)
                throw new Exception("El teléfono es obligatorio.");

            if (u.Telefono <= 0)
                throw new Exception("El teléfono debe ser un valor positivo.");

            if (u.FechaNacimiento == default(DateOnly))
                throw new Exception("La fecha de nacimiento es obligatoria.");
        }

        public async Task GenerarOtp(int userId, string connectionString)
        {
            var uCrud = new UserCrudFactory();

            var otp = new Random().Next(100000, 999999).ToString();
            var expiracion = DateTime.Now.AddMinutes(5);

            uCrud.SetOtp(userId, otp, expiracion);

            var user = uCrud.RetrieveById<User>(userId);

            var emailService = new EmailService(connectionString);
            await emailService.EnviarOtpAsync(user.Correo, otp);
        }

        public bool ValidarOtp(int userId, string otpIngresado)
        {
            var uCrud = new UserCrudFactory();
            var user = uCrud.RetrieveById<User>(userId);

            if (user.Otp == null || user.OtpExpiracion == null)
                throw new Exception("No hay un código OTP activo. Solicita uno nuevo.");

            if (DateTime.Now > user.OtpExpiracion)
            {
                uCrud.ClearOtp(userId);
                throw new Exception("El código OTP ha expirado. Solicita uno nuevo.");
            }

            if (user.Otp != otpIngresado)
                throw new Exception("El código OTP ingresado es incorrecto.");

            uCrud.ClearOtp(userId);
            return true;
        }

        public async Task<User> ValidarCredenciales(string correo, string contrasena, string connectionString)
        {
            var uCrud = new UserCrudFactory();
            var user = uCrud.GetByEmail(correo);

            if (user == null)
                throw new Exception("Correo o contraseña incorrectos.");

            if (user.Contrasena != contrasena)
                throw new Exception("Correo o contraseña incorrectos.");

            await GenerarOtp(user.Id, connectionString);

            return user;
        }

    }
}
