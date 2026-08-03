-- Borrar SPs si existen
DROP PROCEDURE IF EXISTS [dbo].[CRE_AUDITORIA_PR];
DROP PROCEDURE IF EXISTS [dbo].[RET_ALL_AUDITORIA_PR];
DROP PROCEDURE IF EXISTS [dbo].[RET_AUDITORIA_BY_ID_PR];
GO

-- CREATE SP
CREATE PROCEDURE [dbo].[CRE_AUDITORIA_PR]
    @P_USUARIO_ID INT,
    @P_ENTIDAD_MODIFICADA NVARCHAR(50),
    @P_CAMPO_MODIFICADO NVARCHAR(50),
    @P_VALOR_ANTERIOR NVARCHAR(50),
    @P_VALOR_NUEVO NVARCHAR(50),
    @P_FECHA_EVENTO DATE,
    @P_HORA_EVENTO TIME(7)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.tblLogAuditoria
        (UsuarioId, EntidadModificada, CampoModificado, ValorAnterior, ValorNuevo, FechaEvento, HoraEvento, Created)
    VALUES
        (@P_USUARIO_ID, @P_ENTIDAD_MODIFICADA, @P_CAMPO_MODIFICADO, @P_VALOR_ANTERIOR, @P_VALOR_NUEVO, @P_FECHA_EVENTO, @P_HORA_EVENTO, GETDATE());
END
GO

-- RETRIEVE ALL SP (filtros opcionales: NULL = sin filtro)
CREATE PROCEDURE [dbo].[RET_ALL_AUDITORIA_PR]
    @P_ENTIDAD_MODIFICADA NVARCHAR(50) = NULL,
    @P_FECHA_INICIO DATE = NULL,
    @P_FECHA_FIN DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        la.Id, la.Created, la.Updated, la.EntidadModificada, la.CampoModificado,
        la.ValorAnterior, la.ValorNuevo, la.FechaEvento, la.HoraEvento,
        u.Id AS UsuarioId, u.Nombre AS UsuarioNombre, u.Apellido1 AS UsuarioApellido1,
        u.Apellido2 AS UsuarioApellido2, u.Correo AS UsuarioCorreo
    FROM dbo.tblLogAuditoria la
    INNER JOIN dbo.tblUser u ON u.Id = la.UsuarioId
    WHERE (@P_ENTIDAD_MODIFICADA IS NULL OR la.EntidadModificada = @P_ENTIDAD_MODIFICADA)
      AND (@P_FECHA_INICIO IS NULL OR la.FechaEvento >= @P_FECHA_INICIO)
      AND (@P_FECHA_FIN IS NULL OR la.FechaEvento <= @P_FECHA_FIN)
    ORDER BY la.FechaEvento DESC, la.HoraEvento DESC;
END
GO

-- RETRIEVE BY ID SP
CREATE PROCEDURE [dbo].[RET_AUDITORIA_BY_ID_PR]
    @P_ID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        la.Id, la.Created, la.Updated, la.EntidadModificada, la.CampoModificado,
        la.ValorAnterior, la.ValorNuevo, la.FechaEvento, la.HoraEvento,
        u.Id AS UsuarioId, u.Nombre AS UsuarioNombre, u.Apellido1 AS UsuarioApellido1,
        u.Apellido2 AS UsuarioApellido2, u.Correo AS UsuarioCorreo
    FROM dbo.tblLogAuditoria la
    INNER JOIN dbo.tblUser u ON u.Id = la.UsuarioId
    WHERE la.Id = @P_ID;
END
GO
