CREATE PROCEDURE [dbo].[UPD_TURBINA_PR]
    @P_ID INT,
    @P_NOMBRE NVARCHAR(150),
    @P_UBICACION NVARCHAR(250),
    @P_MODELO NVARCHAR(100),
    @P_MARCA NVARCHAR(100),
    @P_ANIO_FABRICACION INT,
    @P_CAPACIDAD_KWH DECIMAL(18,2),
    @P_ESTADO NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.tblTurbinas
    SET
        Updated = GETDATE(),
        Nombre = @P_NOMBRE,
        Modelo = @P_MODELO,
        Marca = @P_MARCA,
        AnioFabricacion = @P_ANIO_FABRICACION,
        CapacidadKwh = @P_CAPACIDAD_KWH,
        Estado = @P_ESTADO
    WHERE Id = @P_ID;
END
GO