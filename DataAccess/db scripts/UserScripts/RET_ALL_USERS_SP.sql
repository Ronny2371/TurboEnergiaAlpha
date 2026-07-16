CREATE PROCEDURE RET_ALL_USERS_PR

AS
BEGIN
	SET NOCOUNT ON;

	SELECT Id, Created, Identificacion, Nombre, Apellido1, Apellido2, 
	       Correo, Telefono, FechaNacimiento, FotoPerfil, Contrasena, RolId
	FROM tblUser;
END
GO