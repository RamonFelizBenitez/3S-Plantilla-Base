USE [SGRH]; -- Ajusta si el nombre de la BD es distinto
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHDependienteSolicitante]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RHDependienteSolicitante](
        [DependienteSolicitanteID] [int] IDENTITY(1,1) NOT NULL,
        [EmpresaID] [int] NOT NULL,
        [SolicitudID] [int] NOT NULL,
        [NombreDependiente] [varchar](70) NOT NULL,
        [Cedula] [varchar](13) NOT NULL DEFAULT (''),
        [ParentescoID] [int] NOT NULL,
        [Sexo] [int] NOT NULL DEFAULT (0),
        [FechaNacimiento] [datetime] NOT NULL,
        [AplicaSeguroMedico] [bit] NOT NULL DEFAULT (0),
        [CreadoPor] [int] NULL,
        [ModificadoPor] [int] NULL,
        [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
        [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_DependienteSolicitante] PRIMARY KEY CLUSTERED 
        (
            [DependienteSolicitanteID] ASC
        )
    ) ON [PRIMARY];

    PRINT 'Tabla RHDependienteSolicitante creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla RHDependienteSolicitante ya existe.';
END
GO
