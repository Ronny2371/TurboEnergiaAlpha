using CoreApp_;
using Microsoft.AspNetCore.Mvc;
using System;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditoriaController : ControllerBase
    {
        //Retrieve all con filtros opcionales por entidad y rango de fechas
        [HttpGet]
        [Route("RetrieveAll")]
        public ActionResult RetrieveAll(string? entidad = null, DateOnly? fechaInicio = null, DateOnly? fechaFin = null)
        {
            try
            {
                var am = new LogAuditoriaManager();
                var lstResults = am.RetrieveAllLogs(entidad, fechaInicio, fechaFin);
                return Ok(lstResults);                                                                      
            }                                                                                                // frontend, pide y muestra los datos)
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Retrieve By Id
        [HttpGet]
        [Route("RetrieveById")]
        public ActionResult RetrieveById(int id)
        {
            try
            {
                var am = new LogAuditoriaManager();
                var log = am.RetrieveLogById(id);
                return Ok(log);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //No hay Create/Update/Delete expuestos: los registros de auditoria solo se generan
        //internamente desde TurbinaManager, MantenimientoManager y UserManager, y son inmutables.
    }
}
