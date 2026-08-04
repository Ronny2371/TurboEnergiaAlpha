-- ======================================================================
-- TABLA: tblAlmacen
-- Descripción: Almacén Central de energía (Una única instancia)
-- ======================================================================
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tblAlmacen')
BEGIN
    CREATE TABLE dbo.tblAlmacen (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Created DATETIME DEFAULT GETDATE() NOT NULL,
        Updated DATETIME NULL,
        CapacidadMaxima DECIMAL(18,2) NOT NULL DEFAULT 40000,
        Almacenado DECIMAL(18,2) NOT NULL DEFAULT 0
    );

    PRINT '✓ Tabla tblAlmacen creada';
END
ELSE
BEGIN
    PRINT '✓ Tabla tblAlmacen ya existe';
END

GO

-- ======================================================================
-- RETRIEVE SP: RET_ALMACEN_PR
-- Descripción: Obtiene el único registro del Almacén Central
-- ======================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'RET_ALMACEN_PR')
    DROP PROCEDURE [dbo].[RET_ALMACEN_PR];

GO

CREATE PROCEDURE [dbo].[RET_ALMACEN_PR]
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            Id,
            Created,
            Updated,
            CapacidadMaxima,
            Almacenado
        FROM dbo.tblAlmacen;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END

GO

-- ======================================================================
-- UPDATE SP: UPD_ALMACEN_PR
-- Descripción: Actualiza el almacenado del Almacén Central
-- Parámetros:
--   @P_ALMACENADO: Nueva cantidad almacenada (MWh)
-- ======================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'UPD_ALMACEN_PR')
    DROP PROCEDURE [dbo].[UPD_ALMACEN_PR];

GO

CREATE PROCEDURE [dbo].[UPD_ALMACEN_PR]
    @P_ALMACENADO DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Validar que no exceda capacidad máxima
        IF @P_ALMACENADO > 40000
        BEGIN
            RAISERROR('El almacén no puede exceder 40,000 MWh', 16, 1);
            RETURN -1;
        END

        -- Validar que no sea negativo
        IF @P_ALMACENADO < 0
        BEGIN
            RAISERROR('El almacenado no puede ser negativo', 16, 1);
            RETURN -1;
        END

        -- Actualizar el almacenado
        UPDATE dbo.tblAlmacen
        SET Almacenado = @P_ALMACENADO,
            Updated = GETDATE()
        WHERE Id = 1;

        PRINT 'Almacén actualizado exitosamente. Almacenado: ' + CAST(@P_ALMACENADO AS VARCHAR(10)) + ' MWh';

        RETURN 1;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
        RETURN -1;
    END CATCH
END

GO

-- ======================================================================
-- INSERTAR REGISTRO INICIAL
-- ======================================================================
IF NOT EXISTS (SELECT * FROM dbo.tblAlmacen WHERE Id = 1)
BEGIN
    INSERT INTO dbo.tblAlmacen (CapacidadMaxima, Almacenado)
    VALUES (40000, 435);

    PRINT '✓ Registro inicial del Almacén creado con 435 MWh';
END
ELSE
BEGIN
    PRINT '✓ Almacén ya contiene datos';
END

GO

-- ======================================================================
-- VERIFICAR INSTALACIÓN
-- ======================================================================
PRINT '═══════════════════════════════════════════════════════════════';
PRINT 'RESUMEN DE INSTALACIÓN - ALMACÉN CENTRAL';
PRINT '═══════════════════════════════════════════════════════════════';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tblAlmacen')
    PRINT '✓ Tabla tblAlmacen: CREADA';
ELSE
    PRINT '✗ Tabla tblAlmacen: ERROR';

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'RET_ALMACEN_PR')
    PRINT '✓ SP RET_ALMACEN_PR: CREADA';
ELSE
    PRINT '✗ SP RET_ALMACEN_PR: ERROR';

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'UPD_ALMACEN_PR')
    PRINT '✓ SP UPD_ALMACEN_PR: CREADA';
ELSE
    PRINT '✗ SP UPD_ALMACEN_PR: ERROR';

PRINT '═══════════════════════════════════════════════════════════════';

GO

-- ======================================================================
-- EJEMPLOS DE USO
-- ======================================================================

/*
-- Obtener estado actual del almacén
EXEC RET_ALMACEN_PR;

-- Actualizar almacenado a 5000 MWh
EXEC UPD_ALMACEN_PR @P_ALMACENADO = 5000;

-- Ver datos actualizados
EXEC RET_ALMACEN_PR;

-- Ver datos directamente
SELECT * FROM tblAlmacen;
*/