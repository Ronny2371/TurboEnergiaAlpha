using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {

        private readonly IConfiguration _config;

        public UsersController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet]
        [Route("RetrieveAll")]

        public ActionResult RetrieveAll()
        {
            try
            {
                var um = new UserManager();

                var lstResults = um.RetrieveAllUser();

                return Ok(lstResults);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        [HttpPost]
        [Route("Create")]

        public ActionResult Create(User user)
        {
            try
            {
                var um = new UserManager();
                um.Create(user);

                return Ok(um);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }


        [HttpPut]
        [Route("Update")]

        public ActionResult Update(User user)
        {
            try
            {
                var um = new UserManager();
                um.Update(user);

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        [HttpDelete]
        [Route("Delete")]

        public ActionResult Delete(User user)
        {
            try
            {
                var um = new UserManager();
                um.Delete(user);

                return Ok(user);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        [Route("RetrieveById/{id}")]
        public ActionResult GetById(int id)
        {
            try
            {
                var um = new UserManager();
                var user = um.RetrieveById(id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("GenerarOtp/{id}")]
        public async Task<IActionResult> GenerarOtp(int id)
        {
            try
            {
                // Obtén la cadena de conexión desde la configuración
                var connStr = _config["AzureCommunicationServices:ConnectionString"];
                var um = new UserManager();
                await um.GenerarOtp(id, connStr);
                return Ok("Se generó un código OTP para el usuario.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("ValidarOtp/{userId}/{otp}")]
        public async Task<IActionResult> ValidarOtp(int userId, string otp)
        {
            try
            {
                var um = new UserManager();
                um.ValidarOtp(userId, otp);
                return Ok(new { valido = true, mensaje = "OTP validado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { valido = false, mensaje = ex.Message });
            }
        }

        
        [HttpPost("Login/{correo}/{contrasena}")]
        public async Task<IActionResult> Login(string correo, string contrasena)
        {
            try
            {
                var connStr = _config["AzureCommunicationServices:ConnectionString"];
                var um = new UserManager();
                var user = await um.ValidarCredenciales(correo, contrasena, connStr);

                return Ok(new
                {
                    id = user.Id,
                    nombre = user.Nombre,
                    apellido1 = user.Apellido1,
                    apellido2 = user.Apellido2,
                    correo = user.Correo,
                    rol = user.Rol
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("SolicitarCambioContrasena/{correo}")]
        public async Task<IActionResult> SolicitarCambioContrasena(string correo)
        {
            try
            {
                var connStr = _config["AzureCommunicationServices:ConnectionString"];
                var um = new UserManager();
                await um.SolicitarCambioContrasena(correo, connStr);
                return Ok("Se envió un código de verificación a tu correo.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("ConfirmarCambioContrasena/{correo}/{otp}/{nuevaContrasena}")]
        public IActionResult ConfirmarCambioContrasena(string correo, string otp, string nuevaContrasena)
        {
            try
            {
                var um = new UserManager();
                um.ConfirmarCambioContrasena(correo, otp, nuevaContrasena);
                return Ok(new { mensaje = "Contraseña actualizada correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

    }
}
