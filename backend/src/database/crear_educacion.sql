USE [SGRH]; -- Ajusta si el nombre de la BD es distinto
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHEducacionSolicitante]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RHEducacionSolicitante](
        [EducacionSolicitanteID] [int] IDENTITY(1,1) NOT NULL,
        [EmpresaID] [int] NOT NULL,
        [SolicitudID] [int] NOT NULL,
        [NivelAcademicoID] [int] NOT NULL,
        [AnoTitulacion] [int] NOT NULL,
        [TituloAcademicoID] [int] NOT NULL,
        [InstitucionAcademica] [varchar](500) NOT NULL,
        [CreadoPor] [int] NULL,
        [ModificadoPor] [int] NULL,
        [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
        [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_EducacionSolicitante] PRIMARY KEY CLUSTERED 
        (
            [EducacionSolicitanteID] ASC
        )
    ) ON [PRIMARY];

    PRINT 'Tabla RHEducacionSolicitante creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla RHEducacionSolicitante ya existe.';
END
GO
