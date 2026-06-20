-- Script para crear la tabla NMDIRECCIONES
-- Ejecutar en la base de datos de Recursos Humanos

CREATE TABLE [dbo].[NMDIRECCIONES](
	[DireccionID] [varchar](20) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_NMDIRECCIONES] PRIMARY KEY CLUSTERED ([DireccionID] ASC)
) ON [PRIMARY]
GO
