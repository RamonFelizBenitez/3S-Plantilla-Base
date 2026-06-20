-- Script para crear la tabla RHDESIGNACION
-- Ejecutar en la base de datos de Recursos Humanos/Nomina

IF OBJECT_ID('dbo.RHDESIGNACION', 'U') IS NOT NULL DROP TABLE dbo.RHDESIGNACION;
GO

CREATE TABLE [dbo].[RHDESIGNACION](
	[DesignacionID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[TipoAcionID] [int] NOT NULL,
	[UsuarioAprobado] [varchar](20) NOT NULL DEFAULT(''),
	[UsuarioProcesado] [varchar](20) NOT NULL DEFAULT(''),
	[CargoID] [varchar](20) NOT NULL,
	[DireccionID] [varchar](20) NOT NULL,
	[DependenciaID] [varchar](20) NULL,
	[Sueldo] [decimal](10, 2) NOT NULL,
	[TurnoID] [varchar](20) NOT NULL,
	[TipoNominaID] [varchar](20) NOT NULL,
	[EmpleadoID] [varchar](20) NOT NULL DEFAULT(''),
	[Observacion] [varchar](500) NOT NULL DEFAULT(''),
	[NumeroNombramiento] [int] NOT NULL DEFAULT(0),
	[FechaRegistro] [datetime] NOT NULL DEFAULT(GETDATE()),
	[FechaNombramiento] [datetime] NOT NULL DEFAULT(GETDATE()),
	[Aprobado] [bit] NOT NULL DEFAULT(0),
	[Procesado] [bit] NOT NULL DEFAULT(0),
	[Anulado] [bit] NOT NULL DEFAULT(0),
	[Impreso] [bit] NOT NULL DEFAULT(0),
	[FechaCreado] [datetime] NOT NULL DEFAULT(GETDATE()),
	[CreadoPor] [varchar](15) NOT NULL DEFAULT('SYSTEM'),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT('SYSTEM'),
	[FechaModificado] [datetime] NOT NULL DEFAULT(GETDATE()),
 CONSTRAINT [PK__RHDESIGNACION__167333ED] PRIMARY KEY CLUSTERED 
(
	[DesignacionID] ASC,
	[EmpresaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
