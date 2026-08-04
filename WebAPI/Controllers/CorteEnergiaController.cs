using CoreApp_;
using Entities_DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CorteEnergiaController : ControllerBase
    {
        private CorteEnergiaManager _manager;

        public CorteEnergiaController()
        {
            _manager = new CorteEnergiaManager();
        }

        [HttpGet("RetrieveAll")]
        public IActionResult RetrieveAll()
        {
            try
            {
                var lstCortes = _manager.RetrieveAllCortes();
                return Ok(lstCortes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] CorteEnergia corte)
        {
            try
            {
                _manager.CreateCorte(corte);
                return Ok(new { message = "Corte creado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}