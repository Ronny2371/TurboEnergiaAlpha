CREATE PROCEDURE [dbo].[RET_TURBINA_BY_ID_PR]
    @P_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id,
        Created,
        Updated,
        Nombre,
        Modelo,
        Marca,
        AnioFabricacion,
        CapacidadKwh,
        Estado
    FROM dbo.tblTurbinas
    WHERE Id = @P_ID;
END
GO