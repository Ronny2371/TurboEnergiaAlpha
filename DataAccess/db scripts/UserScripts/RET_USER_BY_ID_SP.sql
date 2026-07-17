CREATE PROCEDURE RET_USER_BY_ID_PR
(
	@P_ID INT
)

AS
BEGIN
	SET NOCOUNT ON;
	SELECT Id, Created, Updated, Identificacion, Nombre, Apellido1, Apellido2, 
	       Correo, Telefono, FechaNacimiento, FotoPerfil, Contrasena, RolId
	FROM tblUser
	WHERE Id = @P_ID;
END
GO
