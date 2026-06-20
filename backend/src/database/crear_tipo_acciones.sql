-- Script para crear la tabla RHTIPOACCIONES
-- Ejecutar en la base de datos de Recursos Humanos

CREATE TABLE [dbo].[RHTIPOACCIONES](
	[TipoAccionID] [int] NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[Tipo] [varchar](50) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_RHTIPOACCIONES] PRIMARY KEY CLUSTERED ([TipoAccionID] ASC)
) ON [PRIMARY]
GO
