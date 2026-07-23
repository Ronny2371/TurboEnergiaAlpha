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

        //Se utiliza Async task para enviar la solicitud a Azure y esperar la respuesta sin bloquear el hilo principal de ejecución. Esto permite que la aplicación continúe respondiendo a otras solicitudes mientras se espera la respuesta del servicio de correo electrónico.
        public async Task GenerarOtp(int userId, string connectionString)
        {
            var uCrud = new UserCrudFactory();

            // Generar un OTP de 6 dígitos y lo convierte a texto
            var otp = new Random().Next(100000, 999999).ToString();
            var expiracion = DateTime.Now.AddMinutes(5);

            //Llama al método SetOtp del UserCrudFactory para guardar el OTP y su expiración en la base de datos
            uCrud.SetOtp(userId, otp, expiracion);

            //Se llama al usurio para saber a qué correo enviar el OTP
            var user = uCrud.RetrieveById<User>(userId);

            //Se crea una instancia de EmailService y se llama al método EnviarOtpAsync para enviar el OTP al correo del usuario
            var emailService = new EmailService(connectionString);
            await emailService.EnviarOtpAsync(user.Correo, otp);
        }

        // Método para validar el OTP ingresado por el usuario
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

            //Llama a ClearOtp para limpiar el OTP y su expiración después de una validación exitosa
            uCrud.ClearOtp(userId);
            return true;
        }

        //Busca al usuario por correo y contraseña, si es correcto genera un OTP y lo envía al correo del usuario
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

        public async Task SolicitarCambioContrasena(string correo, string connectionString)
        {
            var uCrud = new UserCrudFactory();
            var user = uCrud.GetByEmail(correo);

            if (user == null)
                throw new Exception("No existe un usuario registrado con ese correo.");

            await GenerarOtp(user.Id, connectionString);
        }

        public void ConfirmarCambioContrasena(string correo, string otp, string nuevaContrasena)
        {
            var uCrud = new UserCrudFactory();
            var user = uCrud.GetByEmail(correo);

            if (user == null)
                throw new Exception("No existe un usuario registrado con ese correo.");

            //Reutilizamos la misma validación de OTP que en el login
            ValidarOtp(user.Id, otp);

            uCrud.UpdatePassword(user.Id, nuevaContrasena);
        }

    }
}
