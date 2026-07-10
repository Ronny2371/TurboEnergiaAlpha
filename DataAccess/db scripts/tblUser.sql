/****** Object:  Table [dbo].[tblUser]    Script Date: 09/07/2026 09:46:53 p. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[tblUser](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[Updated] [datetime] NULL,
	[Nombre] [nvarchar](20) NOT NULL,
	[Apellido1] [nvarchar](20) NOT NULL,
	[Apellido2] [nvarchar](20) NOT NULL,
	[Correo] [nvarchar](50) NOT NULL,
	[Telefono] [int] NOT NULL,
	[FechaNacimiento] [date] NOT NULL,
	[FotoPerfil] [nvarchar](250) NOT NULL,
	[Contrasena] [nvarchar](50) NOT NULL,
	[RolId] [int] NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[tblUser]  WITH CHECK ADD  CONSTRAINT [Rol_FK] FOREIGN KEY([RolId])
REFERENCES [dbo].[tblRol] ([Id])
GO

ALTER TABLE [dbo].[tblUser] CHECK CONSTRAINT [Rol_FK]
GO