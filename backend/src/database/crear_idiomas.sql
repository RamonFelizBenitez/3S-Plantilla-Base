USE [SGRH]; -- Ajusta si el nombre de la BD es distinto
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHIdiomaSolicitante]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RHIdiomaSolicitante](
        [IdiomaSolicitanteID] [int] IDENTITY(1,1) NOT NULL,
        [EmpresaID] [int] NOT NULL,
        [SolicitudID] [int] NOT NULL,
        [IdiomaID] [int] NOT NULL,
        [HablaBien] [bit] NOT NULL DEFAULT (0),
        [HablaRegular] [bit] NOT NULL DEFAULT (0),
        [LeeBien] [bit] NOT NULL DEFAULT (0),
        [LeeRegular] [bit] NOT NULL DEFAULT (0),
        [EscribeBien] [bit] NOT NULL DEFAULT (0),
        [EscribeRegular] [bit] NOT NULL DEFAULT (0),
        [TraduceBien] [bit] NOT NULL DEFAULT (0),
        [TraduceRegular] [bit] NOT NULL DEFAULT (0),
        [CreadoPor] [int] NULL,
        [ModificadoPor] [int] NULL,
        [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
        [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_IdiomaSolicitante] PRIMARY KEY CLUSTERED 
        (
            [IdiomaSolicitanteID] ASC
        )
    ) ON [PRIMARY];

    PRINT 'Tabla RHIdiomaSolicitante creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla RHIdiomaSolicitante ya existe.';
END
GO
