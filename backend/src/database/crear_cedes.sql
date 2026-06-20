-- Script para crear la tabla RHCEDES (Sedes)
-- Ejecutar este script en la base de datos de Recursos Humanos

CREATE TABLE [dbo].[RHCEDES](
	[CedeID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_RHCEDES] PRIMARY KEY CLUSTERED ([CedeID] ASC)
) ON [PRIMARY]
GO
