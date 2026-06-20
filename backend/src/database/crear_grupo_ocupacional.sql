-- Script para crear la tabla RHGrupoOcupacional
-- Ejecutar este script en la base de datos de Recursos Humanos

CREATE TABLE [dbo].[RHGrupoOcupacional](
	[GrupoOcupacionalID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[Grupo] [varchar](20) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_GrupoOcupacional] PRIMARY KEY CLUSTERED ([GrupoOcupacionalID] ASC)
) ON [PRIMARY]
GO
