using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApp.Pages
{
    public class CambiarContraseniaModel : PageModel
    {
        public void OnGet()
        {
        }

        public IActionResult OnPost()
        {
         
            return RedirectToPage("/Login");
        }
    }
}