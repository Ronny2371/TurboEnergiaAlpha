using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolicitudCompraController : ControllerBase
    {
        //Retrieve all solicitudes
        [HttpGet]
        [Route("RetrieveAll")]
        public ActionResult RetrieveAll()
        {
            try
            {
                var sm = new SolicitudCompraManager();
                var lstResults = sm.RetrieveAllSolicitudes();
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
                var sm = new SolicitudCompraManager();
                var solicitud = sm.RetrieveSolicitudById(id);
                return Ok(solicitud);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Crear Solicitud
        [HttpPost]
        [Route("Create")]
        public ActionResult Create(SolicitudCompraRequest request, int usuarioAccionId)
        {
            try
            {
                var solicitud = MapToEntity(request);

                var sm = new SolicitudCompraManager();
                sm.CreateSolicitud(solicitud, usuarioAccionId);
                return Ok(solicitud);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Actualizar Solicitud
        [HttpPut]
        [Route("Update")]
        public ActionResult Update(SolicitudCompraRequest request, int usuarioAccionId)
        {
            try
            {
                var solicitud = MapToEntity(request);

                var sm = new SolicitudCompraManager();
                sm.UpdateSolicitud(solicitud, usuarioAccionId);
                return Ok(solicitud);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //Eliminar Solicitud
        [HttpDelete]
        [Route("Delete")]
        public ActionResult Delete(SolicitudCompraRequest request, int usuarioAccionId)
        {
            try
            {
                var solicitud = MapToEntity(request);

                var sm = new SolicitudCompraManager();
                sm.DeleteSolicitud(solicitud, usuarioAccionId);
                return Ok(solicitud);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private static SolicitudCompra MapToEntity(SolicitudCompraRequest request)
        {
            return new SolicitudCompra
            {
                Id = request.Id,
                Usuario = new User { Id = request.Usuario.Id },
                MesSolicitado = request.MesSolicitado,
                AnioSolicitado = request.AnioSolicitado,
                CantidadMWh = request.CantidadMWh,
                Estado = request.Estado
            };
        }
    }

    public class SolicitudCompraRequest
    {
        public int Id { get; set; }
        public UsuarioRefRequest Usuario { get; set; }
        public int MesSolicitado { get; set; }
        public int AnioSolicitado { get; set; }
        public decimal CantidadMWh { get; set; }
        public EstadoSolicitud Estado { get; set; }
    }

    public class UsuarioRefRequest
    {
        public int Id { get; set; }
    }
}