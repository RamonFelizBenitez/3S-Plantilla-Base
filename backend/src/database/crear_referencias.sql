USE [SGRH]; -- Ajusta si el nombre de la BD es distinto
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHReferenciaSolicitud]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RHReferenciaSolicitud](
        [ReferenciaID] [int] IDENTITY(1,1) NOT NULL,
        [EmpresaID] [int] NOT NULL,
        [SolicitudID] [int] NOT NULL,
        [Nombre] [varchar](70) NOT NULL,
        [Direccion] [varchar](70) NOT NULL DEFAULT (''),
        [Telefono] [varchar](20) NOT NULL DEFAULT (''),
        [Anios] [int] NOT NULL DEFAULT (0),
        [CreadoPor] [int] NULL,
        [ModificadoPor] [int] NULL,
        [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
        [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ReferenciaPersonalSolicitud] PRIMARY KEY CLUSTERED 
        (
            [ReferenciaID] ASC
        )
    ) ON [PRIMARY];

    PRINT 'Tabla RHReferenciaSolicitud creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla RHReferenciaSolicitud ya existe.';
END
GO
