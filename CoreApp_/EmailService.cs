using Azure;
using Azure.Communication.Email;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreApp_.Services
{
    public class EmailService
    {
        //Connection string para Azure Communication Services Email
        private readonly string _connectionString;
        private const string SenderAddress = "DoNotReply@c28b3558-5500-4648-96e2-05d480211b74.azurecomm.net";

        public EmailService(string connectionString)
        {
            _connectionString = connectionString;

        }
        //Metodo para enviar un correo electrónico con un OTP/ 
        public async Task EnviarOtpAsync(string destinatario, string otp)
        {
            //Crea el cliente en Azure 
            var emailClient = new EmailClient(_connectionString);

            //Armado de asunto del correo 
            var asunto = "Tu código de verificación - TurboEnergía";
            var contenidoHtml = $@"
                <h2>Código de verificación</h2>
                <p>Tu código OTP es:</p>
                <h1 style='letter-spacing: 4px;'>{otp}</h1>
                <p>Este código expira en 5 minutos.</p>";

            //Arma el mensaje de correo electrónico con el remitente, asunto, contenido y destinatario
            var emailMessage = new EmailMessage(
                senderAddress: SenderAddress,
                content: new EmailContent(asunto) { Html = contenidoHtml },
                recipients: new EmailRecipients(new List<EmailAddress> { new EmailAddress(destinatario) })
            );

            //Envía el correo electrónico
            await emailClient.SendAsync(WaitUntil.Started, emailMessage);
        }

        //Metodo para enviar un correo de confirmación cuando se crea exitosamente un pedido/solicitud
        public async Task EnviarConfirmacionPedidoAsync(string correoDestino, SolicitudCompra pedido)
        {
            //Crea el cliente en Azure
            var emailClient = new EmailClient(_connectionString);

            //Armado de asunto del correo
            var asunto = "Confirmación de pedido - TurboEnergía";
            var contenidoHtml = $@"
                <h2>Pedido confirmado</h2>
                <p>Hola {pedido.Usuario?.Nombre},</p>
                <p>Tu pedido fue registrado exitosamente con los siguientes datos:</p>
                <ul>
                    <li><strong>ID del pedido:</strong> {pedido.Id}</li>
                    <li><strong>Fecha:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</li>
                    <li><strong>Detalle:</strong> Solicitud de {pedido.CantidadMWh} MWh para {pedido.MesSolicitado}/{pedido.AnioSolicitado}</li>
                    <li><strong>Total:</strong> {pedido.CantidadMWh} MWh</li>
                </ul>";

            //Arma el mensaje de correo electrónico con el remitente, asunto, contenido y destinatario
            var emailMessage = new EmailMessage(
                senderAddress: SenderAddress,
                content: new EmailContent(asunto) { Html = contenidoHtml },
                recipients: new EmailRecipients(new List<EmailAddress> { new EmailAddress(correoDestino) })
            );

            //Envía el correo electrónico
            await emailClient.SendAsync(WaitUntil.Started, emailMessage);
        }
    }
}