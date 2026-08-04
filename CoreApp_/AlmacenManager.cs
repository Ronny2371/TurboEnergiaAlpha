using Entities_DTOs;
using DataAccess.CRUD;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.IdentityModel.Tokens.Experimental;

namespace CoreApp_
{
    public class AlmacenManager
    {
        private const decimal CAPACIDAD_MAXIMA = 40000; //esto son MWh

        public AlmacenCentral GetAlmacen()
        {
            var aCrud = new AlmacenCrudFactory();
            var lstAlmacenes = aCrud.RetrieveAll<AlmacenCentral>();

            if(lstAlmacenes.Count == 0)
            {
                throw new Exception("Almacen no encontrado");
            }

            return lstAlmacenes[0];
        }


        public void UpdateAlmacenado(decimal nuevoAlmacenado)
        {
            Validate(nuevoAlmacenado);

            var almacen = GetAlmacen();
            almacen.Almacenado = nuevoAlmacenado;
            almacen.Updated = DateTime.Now;
            var aCrud = new AlmacenCrudFactory();

            aCrud.Update(almacen);
        }

        public decimal GetOcupacionPorcentaje()
        {
            var almacen = GetAlmacen();
            return (almacen.Almacenado / CAPACIDAD_MAXIMA) * 100;
        }

        public decimal GetCapacidadDisponible()
        {
            var almacen = GetAlmacen();
            return CAPACIDAD_MAXIMA - almacen.Almacenado;
        }

        public bool PuedeAlmacenarEnergia(decimal energiaAAlmacenar)
        {
            var almacen = GetAlmacen();
            return (almacen.Almacenado + energiaAAlmacenar) <= CAPACIDAD_MAXIMA;
        }

        private void Validate(decimal almacenado)
        {
            if (almacenado > CAPACIDAD_MAXIMA)
                throw new Exception($"El almacén no puede exceder {CAPACIDAD_MAXIMA} MWh.");

            if (almacenado < 0)
                throw new Exception("El almacenado no puede ser negativo.");
        }
    }
}
    

