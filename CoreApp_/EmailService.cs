using Azure;
using Azure.Communication.Email;
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
    }
}