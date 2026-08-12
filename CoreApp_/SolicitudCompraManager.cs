using CoreApp_.Services;
using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace CoreApp_
{
    public class SolicitudCompraManager
    {
        public List<SolicitudCompra> RetrieveAllSolicitudes()
        {
            var sCrud = new SolicitudCompraCrudFactory();
            return sCrud.RetrieveAll<SolicitudCompra>();
        }

        public SolicitudCompra RetrieveSolicitudById(int id)
        {
            var sCrud = new SolicitudCompraCrudFactory();
            return sCrud.RetrieveById<SolicitudCompra>(id);
        }

        public async Task CreateSolicitud(SolicitudCompra s, int usuarioAccionId, string connectionString)
        {
            Validate(s);

            var sCrud = new SolicitudCompraCrudFactory();
            sCrud.Create(s);

            var identificador = $"{s.MesSolicitado}/{s.AnioSolicitado} - {s.CantidadMWh} MWh";
            new LogAuditoriaManager().RegistrarEvento(usuarioAccionId, "SolicitudCompra", "Creación", "", identificador);

            //Envío del correo de confirmación del pedido. Si falla, se loguea el error pero no se interrumpe la creación ya exitosa del pedido.
            try
            {
                var usuario = new UserCrudFactory().RetrieveById<User>(s.Usuario.Id);
                s.Usuario = usuario;

                var emailService = new EmailService(connectionString);
                await emailService.EnviarConfirmacionPedidoAsync(usuario.Correo, s);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar el correo de confirmación del pedido {s.Id}: {ex.Message}");
            }
        }

        public void UpdateSolicitud(SolicitudCompra s, int usuarioAccionId)
        {
            Validate(s);

            var sCrud = new SolicitudCompraCrudFactory();
            var anterior = sCrud.RetrieveById<SolicitudCompra>(s.Id);

            sCrud.Update(s);

            RegistrarCambios(anterior, s, usuarioAccionId);
        }

        public void DeleteSolicitud(SolicitudCompra s, int usuarioAccionId)
        {
            var sCrud = new SolicitudCompraCrudFactory();
            sCrud.Delete(s);

            var identificador = $"{s.MesSolicitado}/{s.AnioSolicitado} - {s.CantidadMWh} MWh";
            new LogAuditoriaManager().RegistrarEvento(usuarioAccionId, "SolicitudCompra", "Eliminación", identificador, "");
        }

        private void RegistrarCambios(SolicitudCompra anterior, SolicitudCompra nuevo, int usuarioAccionId)
        {
            if (anterior == null) return;

            var logManager = new LogAuditoriaManager();

            if (anterior.Usuario.Id != nuevo.Usuario.Id)
                logManager.RegistrarEvento(usuarioAccionId, "SolicitudCompra", "UsuarioId", anterior.Usuario.Id.ToString(), nuevo.Usuario.Id.ToString());

            if (anterior.MesSolicitado != nuevo.MesSolicitado)
                logManager.RegistrarEvento(usuarioAccionId, "SolicitudCompra", "MesSolicitado", anterior.MesSolicitado.ToString(), nuevo.MesSolicitado.ToString());

            if (anterior.AnioSolicitado != nuevo.AnioSolicitado)
                logManager.RegistrarEvento(usuarioAccionId, "SolicitudCompra", "AnioSolicitado", anterior.AnioSolicitado.ToString(), nuevo.AnioSolicitado.ToString());

            if (anterior.CantidadMWh != nuevo.CantidadMWh)
                logManager.RegistrarEvento(usuarioAccionId, "SolicitudCompra", "CantidadMWh", anterior.CantidadMWh.ToString(), nuevo.CantidadMWh.ToString());

            if (anterior.Estado != nuevo.Estado)
                logManager.RegistrarEvento(usuarioAccionId, "SolicitudCompra", "Estado", anterior.Estado.ToString(), nuevo.Estado.ToString());
        }

        //Metodo para Validar los ingresos a los metodo de llamado al crud
        public void Validate(SolicitudCompra solicitud)
        {
            if (solicitud.Usuario == null || solicitud.Usuario.Id <= 0)
                throw new Exception("El ID del usuario es obligatorio");

            if (solicitud.MesSolicitado < 1 || solicitud.MesSolicitado > 12)
                throw new Exception("El mes solicitado debe estar entre 1 y 12");

            if (solicitud.AnioSolicitado <= 0)
                throw new Exception("El año solicitado es obligatorio");

            if (solicitud.CantidadMWh <= 0)
                throw new Exception("La cantidad de MWh debe ser mayor que cero.");
        }
    }
}