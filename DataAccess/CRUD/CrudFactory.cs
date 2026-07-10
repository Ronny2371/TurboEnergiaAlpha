using DataAccess.DAO;
using Entities_DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataAccess.CRUD
{
    public abstract class CrudFactory
    {
        protected SqlDao sqlDao;
        //Definir los metodos que forman parte del contrato
        //Create
        //Retrieve
        //Update
        //Delete

        public abstract void Create(BaseDTO baseDTO);
        public abstract void Update(BaseDTO baseDTO);

        public abstract void Delete(BaseDTO baseDTO);
        public abstract T RetrieveById<T>(int id);
        public abstract List<T> RetrieveAll<T>();
    }
}
