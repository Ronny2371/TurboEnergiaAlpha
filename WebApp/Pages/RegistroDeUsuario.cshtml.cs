using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApp.Pages
{
    public class RegistroModel : PageModel
    {
        public void OnGet()
        {
        }

        public IActionResult OnPost()
        {
            // Aquí va la lógica para registrar el usuario
            // Validar datos, guardar en base de datos, etc.
            return RedirectToPage("/Login");
        }
    }
}