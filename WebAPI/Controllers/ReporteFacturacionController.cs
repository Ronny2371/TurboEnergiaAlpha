using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReporteFacturacionController : ControllerBase
    {
        //Retrieve all reportes
        [HttpGet]
        [Route("RetrieveAll")]
        public ActionResult RetrieveAll()
        {
            try
            {
                var rm = new ReporteFacturacionManager();
                var lstResults = rm.RetrieveAllReportes();
                return Ok(lstResults);
            }
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
                var rm = new ReporteFacturacionManager();
                var reporte = rm.RetrieveReporteById(id);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Retrieve el reporte mas reciente del usuario logueado
        [HttpGet]
        [Route("RetrieveUltimo")]
        public ActionResult RetrieveUltimo(int usuarioId, int rolId = 0)
        {
            try
            {
                var rm = new ReporteFacturacionManager();
                var reporte = rm.RetrieveUltimoReporte(usuarioId, rolId);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Crear Reporte
        [HttpPost]
        [Route("Create")]
        public ActionResult Create(ReporteFacturacion reporte)
        {
            try
            {
                var rm = new ReporteFacturacionManager();
                rm.CreateReporte(reporte);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Actualizar Reporte
        [HttpPut]
        [Route("Update")]
        public ActionResult Update(ReporteFacturacion reporte)
        {
            try
            {
                var rm = new ReporteFacturacionManager();
                rm.UpdateReporte(reporte);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Eliminar Reporte
        [HttpDelete]
        [Route("Delete")]
        public ActionResult Delete(ReporteFacturacion reporte)
        {
            try
            {
                var rm = new ReporteFacturacionManager();
                rm.DeleteReporte(reporte);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
