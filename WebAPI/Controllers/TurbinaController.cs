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
        public ActionResult Create(Turbina turbina)
        {
            try
            {
                var tm = new TurbinaManager();
                tm.CreateTurbina(turbina);
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
        public ActionResult Update(Turbina turbina)
        {
            try
            {
                var tm = new TurbinaManager();
                tm.UpdateTurbina(turbina);
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
        public ActionResult Delete(Turbina turbina)
        {
            try
            {
                var tm = new TurbinaManager();
                tm.DeleteTurbina(turbina);
                return Ok(turbina);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
