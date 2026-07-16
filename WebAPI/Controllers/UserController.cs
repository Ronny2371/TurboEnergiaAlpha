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


    }
 }
