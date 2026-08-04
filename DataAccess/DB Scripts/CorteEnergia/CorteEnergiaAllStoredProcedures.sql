-- ======================================================================
-- TABLA: tblCorteDeEnergía
-- ======================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tblCorteDeEnergía')
BEGIN
    CREATE TABLE dbo.tblCorteDeEnergía (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Created DATETIME DEFAULT GETDATE() NOT NULL,
        Updated DATETIME NULL,
        EnergiaGenerada DECIMAL(18,2) NOT NULL,
        EnergiaSolicitada DECIMAL(18,2) NOT NULL,
        Balance DECIMAL(18,2) NOT NULL,
        Porcentaje INT NOT NULL,
        CantidadHoras INT DEFAULT 10 NOT NULL
    );

    -- Crear índices
    CREATE INDEX IX_CorteDeEnergía_Created ON dbo.tblCorteDeEnergía(Created DESC);
    CREATE INDEX IX_CorteDeEnergía_Porcentaje ON dbo.tblCorteDeEnergía(Porcentaje);


END
GO

-- ======================================================================
-- CREATE SP: CRE_CORTE_DE_ENERGIA_PR
-- ======================================================================
CREATE PROCEDURE [dbo].[CRE_CORTE_DE_ENERGIA_PR]
    @P_ENERGIA_GENERADA DECIMAL(18,2),
    @P_ENERGIA_SOLICITADA DECIMAL(18,2),
    @P_BALANCE DECIMAL(18,2),
    @P_PORCENTAJE INT,
    @P_CANTIDAD_HORAS INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.tblCorteDeEnergía (Created, EnergiaGenerada, EnergiaSolicitada, Balance, Porcentaje, CantidadHoras)
    VALUES (GETDATE(), @P_ENERGIA_GENERADA, @P_ENERGIA_SOLICITADA, @P_BALANCE, @P_PORCENTAJE, @P_CANTIDAD_HORAS);
END
GO

-- ======================================================================
-- RETRIEVE ALL SP: RET_ALL_CORTES_DE_ENERGIA_PR
-- ======================================================================
CREATE PROCEDURE [dbo].[RET_ALL_CORTES_DE_ENERGIA_PR]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Created, Updated, EnergiaGenerada, EnergiaSolicitada, Balance, Porcentaje, CantidadHoras
    FROM dbo.tblCorteDeEnergía
    ORDER BY Created DESC;
END
GO

