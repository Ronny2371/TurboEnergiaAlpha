using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreApp_
{
    public class LogAuditoriaManager
    {
        private const int MAX_LONGITUD_VALOR = 50; //ValorAnterior/ValorNuevo son NVARCHAR(50) en la base

        public List<LogAuditoria> RetrieveAllLogs(string entidadModificada = null, DateOnly? fechaInicio = null, DateOnly? fechaFin = null)
        {
            var crud = new LogAuditoriaCrudFactory();
            return crud.RetrieveAll<LogAuditoria>(entidadModificada, fechaInicio, fechaFin);
        }

        public LogAuditoria RetrieveLogById(int id)
        {
            var crud = new LogAuditoriaCrudFactory();
            return crud.RetrieveById<LogAuditoria>(id);
        }

        //Metodo central que usan TurbinaManager, MantenimientoManager y UserManager para dejar rastro de sus cambios.
        //Nunca debe interrumpir la operacion de negocio que la origina, por eso traga cualquier excepcion.
        public void RegistrarEvento(int usuarioAccionId, string entidadModificada, string campoModificado, string valorAnterior, string valorNuevo)
        {
            try
            {
                var ahora = DateTime.Now;

                var log = new LogAuditoria()
                {
                    Usuario = new User() { Id = usuarioAccionId },
                    EntidadModificada = Truncar(entidadModificada),
                    CampoModificado = Truncar(campoModificado),
                    ValorAnterior = Truncar(valorAnterior),
                    ValorNuevo = Truncar(valorNuevo),
                    FechaEvento = DateOnly.FromDateTime(ahora),
                    HoraEvento = TimeOnly.FromDateTime(ahora)
                };

                var crud = new LogAuditoriaCrudFactory();
                crud.Create(log);
            }
            catch
            {
                //La auditoria nunca debe tumbar la operacion principal que la origino
            }
        }

        private string Truncar(string valor)
        {
            if (string.IsNullOrEmpty(valor))
                return string.Empty;

            return valor.Length > MAX_LONGITUD_VALOR ? valor.Substring(0, MAX_LONGITUD_VALOR) : valor;
        }
    }
}
