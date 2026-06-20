USE [SGRH]; -- Ajusta si el nombre de la BD es distinto
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHExperienciaLaboralSolicitante]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RHExperienciaLaboralSolicitante](
        [ExperienciaLaboralSolicitudID] [int] IDENTITY(1,1) NOT NULL,
        [EmpresaID] [int] NOT NULL,
        [SolicitudID] [int] NOT NULL,
        [InstitucionLabor] [varchar](70) NOT NULL,
        [Direccion] [varchar](70) NOT NULL DEFAULT (''),
        [Telefono] [varchar](20) NOT NULL DEFAULT (''),
        [UltimoSueldo] [decimal](18, 2) NOT NULL DEFAULT (0),
        [FechaInicial] [datetime] NOT NULL,
        [FechaFinal] [datetime] NOT NULL,
        [CreadoPor] [int] NULL,
        [ModificadoPor] [int] NULL,
        [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
        [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ExperienciaLaboralSolicitante] PRIMARY KEY CLUSTERED 
        (
            [ExperienciaLaboralSolicitudID] ASC
        )
    ) ON [PRIMARY];

    PRINT 'Tabla RHExperienciaLaboralSolicitante creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla RHExperienciaLaboralSolicitante ya existe.';
END
GO
