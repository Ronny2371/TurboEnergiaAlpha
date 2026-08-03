using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MantenimientoController : ControllerBase
    {
        [HttpGet]
        [Route("RetrieveAll")]
        public ActionResult RetrieveAll()
        {
            try
            {
                var mm = new MantenimientoManager();
                var lstResults = mm.RetrieveAllMantenimientos();
                return Ok(lstResults);

            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }




        [HttpGet]
        [Route("RetrieveById")]
        public ActionResult RetrieveById(int id)
        {
            try
            {
                var mm = new MantenimientoManager();
                var mantenimiento = mm.RetrieveMantenimientoById(id);
                return Ok(mantenimiento);
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }



        [HttpPost]
        [Route("Create")]
        public ActionResult Create(Mantenimiento mantenimiento, int usuarioAccionId)
        {
            try
            {
                var mm = new MantenimientoManager();
                mm.CreateMantenimiento(mantenimiento, usuarioAccionId);
                return Ok(mantenimiento);
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut]
        [Route("Update")]
        public ActionResult Update(Mantenimiento mantenimiento, int usuarioAccionId)
        {
            try
            {
                var mm = new MantenimientoManager();
                mm.UpdateMantenimiento(mantenimiento, usuarioAccionId);
                return Ok(mantenimiento);
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete]
        [Route("Delete")]
        public ActionResult Delete(Mantenimiento mantenimiento, int usuarioAccionId)
        {
            try
            {
                var mm = new MantenimientoManager();
                mm.DeleteMantenimiento(mantenimiento, usuarioAccionId);
                return Ok(mantenimiento);
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }



    }
}
