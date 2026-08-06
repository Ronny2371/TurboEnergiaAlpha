using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Entities_DTOs
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EstadoSolicitud
    {
        PENDIENTE,
        PROCESADA,
        BLOQUEADA,
        CANCELADA
    }
}