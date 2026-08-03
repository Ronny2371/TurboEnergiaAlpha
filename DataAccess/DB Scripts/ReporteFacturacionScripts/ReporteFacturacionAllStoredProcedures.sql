-- Stored procedures para dbo.tblReporteFacturacion (la tabla ya existe, no se crea aqui)
-- Columnas reales: Id, UsuarioId, Distribuidor, NumeroFactura, Periodo, Estado,
-- EnergiaAsignada, PrecioMWh, Subtotal, Impuesto, Total, FechaEmision, FechaVencimiento

-- Borrar SPs si existen
DROP PROCEDURE IF EXISTS [dbo].[CRE_REPORTE_FACTURACION_PR];
DROP PROCEDURE IF EXISTS [dbo].[UPD_REPORTE_FACTURACION_PR];
DROP PROCEDURE IF EXISTS [dbo].[DEL_REPORTE_FACTURACION_PR];
DROP PROCEDURE IF EXISTS [dbo].[RET_ALL_REPORTE_FACTURACION_PR];
DROP PROCEDURE IF EXISTS [dbo].[RET_REPORTE_FACTURACION_BY_ID_PR];
DROP PROCEDURE IF EXISTS [dbo].[RET_REPORTE_FACTURACION_ULTIMO_PR];
GO

-- CREATE SP
CREATE PROCEDURE [dbo].[CRE_REPORTE_FACTURACION_PR]
    @P_USUARIO_ID INT,
    @P_DISTRIBUIDOR NVARCHAR(150),
    @P_NUMERO_FACTURA NVARCHAR(50),
    @P_PERIODO DATETIME,
    @P_ESTADO NVARCHAR(50),
    @P_ENERGIA_ASIGNADA DECIMAL(18,2),
    @P_PRECIO_MWH DECIMAL(18,2),
    @P_SUBTOTAL DECIMAL(18,2),
    @P_IMPUESTO DECIMAL(18,2),
    @P_TOTAL DECIMAL(18,2),
    @P_FECHA_EMISION DATETIME,
    @P_FECHA_VENCIMIENTO DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.tblReporteFacturacion
        (UsuarioId, Distribuidor, NumeroFactura, Periodo, Estado, EnergiaAsignada, PrecioMWh, Subtotal, Impuesto, Total, FechaEmision, FechaVencimiento)
    VALUES
        (@P_USUARIO_ID, @P_DISTRIBUIDOR, @P_NUMERO_FACTURA, @P_PERIODO, @P_ESTADO, @P_ENERGIA_ASIGNADA, @P_PRECIO_MWH, @P_SUBTOTAL, @P_IMPUESTO, @P_TOTAL, @P_FECHA_EMISION, @P_FECHA_VENCIMIENTO);
END
GO

-- UPDATE SP
CREATE PROCEDURE [dbo].[UPD_REPORTE_FACTURACION_PR]
    @P_ID INT,
    @P_USUARIO_ID INT,
    @P_DISTRIBUIDOR NVARCHAR(150),
    @P_NUMERO_FACTURA NVARCHAR(50),
    @P_PERIODO DATETIME,
    @P_ESTADO NVARCHAR(50),
    @P_ENERGIA_ASIGNADA DECIMAL(18,2),
    @P_PRECIO_MWH DECIMAL(18,2),
    @P_SUBTOTAL DECIMAL(18,2),
    @P_IMPUESTO DECIMAL(18,2),
    @P_TOTAL DECIMAL(18,2),
    @P_FECHA_EMISION DATETIME,
    @P_FECHA_VENCIMIENTO DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.tblReporteFacturacion
    SET
        UsuarioId = @P_USUARIO_ID,
        Distribuidor = @P_DISTRIBUIDOR,
        NumeroFactura = @P_NUMERO_FACTURA,
        Periodo = @P_PERIODO,
        Estado = @P_ESTADO,
        EnergiaAsignada = @P_ENERGIA_ASIGNADA,
        PrecioMWh = @P_PRECIO_MWH,
        Subtotal = @P_SUBTOTAL,
        Impuesto = @P_IMPUESTO,
        Total = @P_TOTAL,
        FechaEmision = @P_FECHA_EMISION,
        FechaVencimiento = @P_FECHA_VENCIMIENTO
    WHERE Id = @P_ID;
END
GO

-- DELETE SP
CREATE PROCEDURE [dbo].[DEL_REPORTE_FACTURACION_PR]
    @P_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.tblReporteFacturacion
    WHERE Id = @P_ID;
END
GO

-- RETRIEVE ALL SP
CREATE PROCEDURE [dbo].[RET_ALL_REPORTE_FACTURACION_PR]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        Id, UsuarioId, Distribuidor, NumeroFactura, Periodo, Estado,
        EnergiaAsignada, PrecioMWh, Subtotal, Impuesto, Total, FechaEmision, FechaVencimiento
    FROM dbo.tblReporteFacturacion
    ORDER BY Periodo DESC;
END
GO

-- RETRIEVE BY ID SP
CREATE PROCEDURE [dbo].[RET_REPORTE_FACTURACION_BY_ID_PR]
    @P_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        Id, UsuarioId, Distribuidor, NumeroFactura, Periodo, Estado,
        EnergiaAsignada, PrecioMWh, Subtotal, Impuesto, Total, FechaEmision, FechaVencimiento
    FROM dbo.tblReporteFacturacion
    WHERE Id = @P_ID;
END
GO

-- RETRIEVE ULTIMO SP (el reporte mas reciente de un distribuidor; lo usa la pagina Reporte de Distribucion)
CREATE PROCEDURE [dbo].[RET_REPORTE_FACTURACION_ULTIMO_PR]
    @P_USUARIO_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1
        Id, UsuarioId, Distribuidor, NumeroFactura, Periodo, Estado,
        EnergiaAsignada, PrecioMWh, Subtotal, Impuesto, Total, FechaEmision, FechaVencimiento
    FROM dbo.tblReporteFacturacion
    WHERE UsuarioId = @P_USUARIO_ID
    ORDER BY Periodo DESC, Id DESC;
END
GO
