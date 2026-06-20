USE [SGRH]; -- Ajusta si el nombre de la BD es distinto
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHOtros]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RHOtros](
        [OtrosID] [int] IDENTITY(1,1) NOT NULL,
        [EmpresaID] [int] NOT NULL,
        [SolicitudID] [int] NOT NULL,
        [ActividadID] [int] NOT NULL,
        [Descripcion] [varchar](100) NOT NULL DEFAULT (''),
        [CreadoPor] [int] NULL,
        [ModificadoPor] [int] NULL,
        [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
        [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_RHOtros] PRIMARY KEY CLUSTERED 
        (
            [OtrosID] ASC
        )
    ) ON [PRIMARY];

    PRINT 'Tabla RHOtros creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla RHOtros ya existe.';
END
GO
