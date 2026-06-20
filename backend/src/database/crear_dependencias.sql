-- Script para crear la tabla NMDEPENDENCIAS
-- Ejecutar en la base de datos de Recursos Humanos

CREATE TABLE [dbo].[NMDEPENDENCIAS](
	[DependenciaID] [varchar](20) NOT NULL,
	[DireccionID] [varchar](20) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_NMDEPENDENCIAS] PRIMARY KEY CLUSTERED ([DependenciaID] ASC),
 CONSTRAINT [FK_NMDEPENDENCIAS_DIRECCION] FOREIGN KEY ([DireccionID]) REFERENCES [NMDIRECCIONES]([DireccionID])
) ON [PRIMARY]
GO
