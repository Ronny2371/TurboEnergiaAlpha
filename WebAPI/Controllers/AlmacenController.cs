using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlmacenController : ControllerBase
    {
 
        [HttpGet]
        [Route("RetrieveAll")]
        public ActionResult RetrieveAll()
        {
            try
            {
                var am = new AlmacenManager();
                var almacen = am.GetAlmacen();
                return Ok(almacen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // Retrieve By Id
        [HttpGet]
        [Route("RetrieveById")]
        public ActionResult RetrieveById(int id)
        {
            try
            {
                var am = new AlmacenManager();
                var almacen = am.GetAlmacen();
                return Ok(almacen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // Actualizar Almacenado
        [HttpPut]
        [Route("Update")]
        public ActionResult Update(AlmacenCentral almacen, int usuarioAccionId)
        {
            try
            {
                var am = new AlmacenManager();
                am.UpdateAlmacenado(almacen.Almacenado);
                return Ok(almacen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // Get Ocupación Porcentaje
        [HttpGet]
        [Route("GetOcupacion")]
        public ActionResult GetOcupacion()
        {
            try
            {
                var am = new AlmacenManager();
                var almacen = am.GetAlmacen();
                var ocupacion = am.GetOcupacionPorcentaje();
                var disponible = am.GetCapacidadDisponible();

                return Ok(new
                {
                    almacenado = almacen.Almacenado,
                    capacidadMaxima = 40000,
                    ocupacionPorcentaje = Math.Round(ocupacion, 2),
                    capacidadDisponible = disponible
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // Verificar si puede almacenar energía
        [HttpPost]
        [Route("PuedeAlmacenar")]
        public ActionResult PuedeAlmacenar(decimal energiaAAlmacenar)
        {
            try
            {
                var am = new AlmacenManager();
                bool puedeAlmacenar = am.PuedeAlmacenarEnergia(energiaAAlmacenar);

                return Ok(new
                {
                    puedeAlmacenar = puedeAlmacenar,
                    energiaRequerida = energiaAAlmacenar
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}