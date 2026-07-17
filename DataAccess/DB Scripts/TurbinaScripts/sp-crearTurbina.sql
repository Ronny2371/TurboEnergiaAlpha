CREATE PROCEDURE [dbo].[CRE_TURBINA_PR]
    @P_NOMBRE NVARCHAR(150),
    @P_MODELO NVARCHAR(100),
    @P_MARCA NVARCHAR(100),
    @P_ANIO_FABRICACION INT,
    @P_CAPACIDAD_KWH DECIMAL(18,2),
    @P_ESTADO NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.tblTurbinas
    (
        Nombre,
        Modelo,
        Marca,
        AnioFabricacion,
        CapacidadKwh,
        Estado
    )
    VALUES
    (
        @P_NOMBRE,
        @P_MODELO,
        @P_MARCA,
        @P_ANIO_FABRICACION,
        @P_CAPACIDAD_KWH,
        @P_ESTADO
    );
END
GO