using DataAccess.CRUD;
using Entities_DTOs;
using Microsoft.IdentityModel.Tokens.Experimental;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreApp_
{
    public class CorteEnergiaManager
    {
        public List<CorteEnergia> RetrieveAllCortes()
        {
            var cCrud = new CorteEnergiaCrudFactory();
            return cCrud.RetrieveAll<CorteEnergia>();
        }

        public void CreateCorte(CorteEnergia corte)
        {
            Validate(corte);

            var cCrud = new CorteEnergiaCrudFactory();
            cCrud.Create(corte);
        }

        private void Validate(CorteEnergia corte)
        {
            // Energía Generada
            if (corte.EnergiaGenerada < 0)
                throw new Exception("La energía generada no puede ser negativa.");

            // Energía Solicitada
            if (corte.EnergiaSolicitada < 0)
                throw new Exception("La energía solicitada no puede ser negativa.");

            // Porcentaje
            if (corte.Porcentaje < 1 || corte.Porcentaje > 100)
                throw new Exception("El porcentaje debe estar entre 1 y 100.");

            // Cantidad de Horas
            if (corte.CantidadHoras < 1 || corte.CantidadHoras > 24)
                throw new Exception("La cantidad de horas debe estar entre 1 y 24.");
        }
    }
}
