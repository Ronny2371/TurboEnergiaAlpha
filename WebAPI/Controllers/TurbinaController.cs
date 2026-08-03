using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurbinaController : ControllerBase
    {
        //Retrieve all turbinas
        [HttpGet]
        [Route("RetrieveAll")]
        public ActionResult RetrieveAll()
        {
            try
            {
                var tm = new TurbinaManager();
                var lstResults = tm.RetrieveAllTurbinas();
                return Ok(lstResults);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        //Retrive By Id
        [HttpGet]
        [Route("RetrieveById")]
        public ActionResult RetrieveById(int id)
        {
            try
            {
                var tm = new TurbinaManager();
                var movie = tm.RetrieveTurbinaById(id);
                return Ok(movie);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Crear Turbina
        [HttpPost]
        [Route("Create")]
        public ActionResult Create(Turbina turbina, int usuarioAccionId)
        {
            try
            {
                var tm = new TurbinaManager();
                tm.CreateTurbina(turbina, usuarioAccionId);
                return Ok(tm);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Actualizar Turbina
        [HttpPut]
        [Route("Update")]
        public ActionResult Update(Turbina turbina, int usuarioAccionId)
        {
            try
            {
                var tm = new TurbinaManager();
                tm.UpdateTurbina(turbina, usuarioAccionId);
                return Ok(turbina);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        //Eliminar Turbina
        [HttpDelete]
        [Route("Delete")]
        public ActionResult Delete(Turbina turbina, int usuarioAccionId)
        {
            try
            {
                var tm = new TurbinaManager();
                tm.DeleteTurbina(turbina, usuarioAccionId);
                return Ok(turbina);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
