
-- ==============================================================================
-- MODULE: NOMINA / RECURSOS HUMANOS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: Cargos
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cargos](
	[CargoID] [varchar](20) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[RecordId] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_Cargos] PRIMARY KEY CLUSTERED 
(
	[CargoID] ASC,
	[EmpresaID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHSolicitud
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHSolicitud](
	[SolicitudID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[FechaSolicitud] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[Empleadoid] [varchar](20) NOT NULL DEFAULT (''),
	[Cedula] [varchar](20) NOT NULL DEFAULT (''),
	[Tratamiento] [varchar](20) NOT NULL DEFAULT (''),
	[TituloAcademicoID] [tinyint] NOT NULL DEFAULT ((0)),
	[Nombre] [varchar](100) NOT NULL DEFAULT (''),
	[Nombre1] [varchar](50) NOT NULL DEFAULT (''),
	[Nombre2] [varchar](50) NOT NULL DEFAULT (''),
	[Apellido1] [varchar](50) NOT NULL DEFAULT (''),
	[Apellido2] [varchar](50) NOT NULL DEFAULT (''),
	[Alias] [varchar](20) NOT NULL DEFAULT (''),
	[TipoID] [varchar](20) NOT NULL DEFAULT (''),
	[Apodo] [varchar](25) NOT NULL DEFAULT (''),
	[Telefono] [varchar](20) NOT NULL DEFAULT (''),
	[Celular] [varchar](20) NOT NULL DEFAULT (''),
	[Beeper] [varchar](10) NOT NULL DEFAULT (''),
	[Email] [varchar](30) NOT NULL DEFAULT (''),
	[EstadoCivil] [int] NOT NULL DEFAULT ((0)),
	[TipoSangreID] [tinyint] NOT NULL DEFAULT ((0)),
	[LicenciaConducir] [varchar](11) NOT NULL DEFAULT (''),
	[Pasaporte] [varchar](15) NOT NULL DEFAULT (''),
	[CodigoPostal] [varchar](10) NOT NULL DEFAULT (''),
	[Telefono1] [varchar](20) NOT NULL DEFAULT (''),
	[Telefono2] [varchar](20) NOT NULL DEFAULT (''),
	[TelefonoExtensionEmp] [varchar](10) NOT NULL DEFAULT (''),
	[Beeper1] [varchar](20) NOT NULL DEFAULT (''),
	[Fax] [varchar](20) NOT NULL DEFAULT (''),
	[URL] [varchar](255) NOT NULL DEFAULT (''),
	[TipoSangre] [int] NOT NULL DEFAULT ((0)),
	[Sexo] [int] NOT NULL DEFAULT ((0)),
	[FechaDisponible] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[FechaNacimiento] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[MunicipioIDNacieminto] [varchar](20) NOT NULL DEFAULT (''),
	[ProvinciaIDNacimiento] [varchar](20) NOT NULL DEFAULT (''),
	[PaisIDNacimiento] [varchar](20) NOT NULL DEFAULT (''),
	[MunicipioID] [varchar](20) NOT NULL DEFAULT (''),
	[ProvinciaID] [varchar](20) NOT NULL DEFAULT (''),
	[PaisID] [varchar](20) NOT NULL DEFAULT (''),
	[CargoID] [varchar](20) NOT NULL DEFAULT (''),
	[Sueldo] [decimal](18, 0) NOT NULL DEFAULT ((0)),
	[Prioridad] [bit] NOT NULL DEFAULT ((0)),
	[Traslado] [bit] NOT NULL DEFAULT ((0)),
	[Nombrado] [bit] NOT NULL DEFAULT ((0)),
	[Viajar] [bit] NOT NULL DEFAULT ((0)),
	[Direccion] [varchar](80) NOT NULL DEFAULT (''),
	[Referencia] [varchar](50) NOT NULL DEFAULT (''),
	[Sector] [varchar](50) NOT NULL DEFAULT (''),
	[DepartamentoId] [varchar](20) NOT NULL DEFAULT (''),
	[DependenciaID] [varchar](20) NOT NULL DEFAULT (''),
	[SeccionID] [varchar](20) NOT NULL DEFAULT (''),
	[DivisionID] [varchar](20) NOT NULL DEFAULT (''),
	[CentroCostoId] [varchar](20) NOT NULL DEFAULT (''),
	[PropositoId] [varchar](20) NOT NULL DEFAULT (''),
	[PerfilInternacional] [bit] NOT NULL DEFAULT ((0)),
	[CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[RecordID] [int] NOT NULL DEFAULT ((0)),
 CONSTRAINT [PK_RHSolicitud] PRIMARY KEY CLUSTERED 
(
	[SolicitudID] ASC,
	[EmpresaID] ASC
),
 CONSTRAINT [UQ_RHSolicitud_Cedula] UNIQUE 
(
    [Cedula] ASC,
    [EmpresaID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHSolicitudDocumentos
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHSolicitudDocumentos](
	[DocumentoID] [int] IDENTITY(1,1) NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[NombreArchivo] [varchar](255) NOT NULL,
	[RutaArchivo] [varchar](MAX) NOT NULL,
	[FechaSubida] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_RHSolicitudDocumentos] PRIMARY KEY CLUSTERED 
(
	[DocumentoID] ASC
)
) ON [PRIMARY]
GO
