using DataAccess.CRUD;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace CoreApp_
{
    public class TurbinaManager
    {
        public List<Turbina> RetrieveAllTurbinas()
        {
            var tCrud = new TurbinaCrudFactory();
            return tCrud.RetrieveAll<Turbina>();
        }

        public Turbina RetrieveTurbinaById(int id)
        {
            var tCrud = new TurbinaCrudFactory();
            return tCrud.RetrieveById<Turbina>(id);
        }

        public void CreateTurbina(Turbina t)
        {
            var tCrud = new TurbinaCrudFactory();
            tCrud.Create(t);
        }
        public void UpdateTurbina(Turbina t)
        {
            var tCrud = new TurbinaCrudFactory();
            tCrud.Update(t);
        }
        public void DeleteTurbina(Turbina t)
        {
            var uCrud = new TurbinaCrudFactory();
            uCrud.Delete(t);
        }
    }
}
