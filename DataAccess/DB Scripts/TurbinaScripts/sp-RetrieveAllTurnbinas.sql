CREATE PROCEDURE [dbo].[RET_ALL_TURBINAS_PR]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        Created,
        Updated,
        Nombre,
        Ubicacion,
        Modelo,
        Marca,
        AnioFabricacion,
        CapacidadKwh,
        Estado
    FROM dbo.tblTurbinas;
END
GO