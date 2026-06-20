-- Script para agregar CedeID y GrupoOcupacionalID a RHSolicitud
-- Ejecutar en la base de datos de Recursos Humanos

ALTER TABLE [dbo].[RHSolicitud] ADD [CedeID] [int] NULL;
GO

ALTER TABLE [dbo].[RHSolicitud] ADD [GrupoOcupacionalID] [int] NULL;
GO
