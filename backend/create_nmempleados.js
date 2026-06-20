const sql = require('mssql');
const config = require('./src/config/db').config; // assuming it exports config, or I'll just use raw

const query = `
CREATE TABLE [dbo].[NMEMPLEADOS](
	[EmpleadoID] [varchar](20) NOT NULL,
	[EmpresaId] [int] NOT NULL,
	[Nombres] [varchar](100) NULL,
	[Nombre1] [varchar](50) NULL,
	[Nombre2] [varchar](50) NULL,
	[Apellido1] [varchar](50) NULL,
	[Apellido2] [varchar](50) NULL,
	[HorasExtra] [bit] NOT NULL DEFAULT 0,
	[diasvacfisica] [float] NOT NULL DEFAULT 0,
	[Direccion] [varchar](250) NULL,
	[CodigoPostal] [varchar](20) NULL,
	[Telefono1] [varchar](20) NULL,
	[Telefono2] [varchar](20) NULL,
	[Celular] [varchar](20) NULL,
	[Email] [varchar](80) NULL,
	[URL] [varchar](255) NULL,
	[CiudadID] [varchar](10) NULL,
	[Cedula] [varchar](20) NULL,
	[EstadoCivil] [int] NOT NULL DEFAULT 1,
	[Sexo] [int] NOT NULL DEFAULT 1,
	[Estatus] [int] NOT NULL DEFAULT 1,
	[FormaPago] [int] NOT NULL DEFAULT 1,
	[CargoId] [varchar](20) NULL,
	[ISR] [bit] NOT NULL DEFAULT 0,
	[IDSS] [bit] NOT NULL DEFAULT 0,
	[AFP] [bit] NOT NULL DEFAULT 0,
	[ARS] [bit] NOT NULL DEFAULT 0,
	[CuentaBanco] [varchar](20) NULL,
	[FechaNacimiento] [datetime] NULL,
	[MonedaID] [varchar](3) NULL,
	[DireccionID] [varchar](20) NULL,
	[DependenciaID] [varchar](20) NULL,
	[TipoNominaID] [varchar](20) NULL,
	[PaisID] [varchar](20) NULL,
	[ProvinciaID] [varchar](20) NULL,
	[MunicipioID] [varchar](20) NULL,
	[TurnoId] [int] NULL,
	[MinisterioPublico] [bit] NOT NULL DEFAULT 0,
	[Poncha] [bit] NOT NULL DEFAULT 0,
	[Nomina] [bit] NOT NULL DEFAULT 0,
	[Incorporado] [bit] NOT NULL DEFAULT 0,
	[EmpleadoPlanta] [bit] NOT NULL DEFAULT 0,
	[TipoSangre] [int] NULL,
	[PaisIDNacimiento] [varchar](20) NULL,
	[ProvinciaIDNacimiento] [varchar](20) NULL,
	[MunicipioIDNacimiento] [varchar](20) NULL,
	[Sector] [varchar](30) NULL,
	[Referencia] [varchar](50) NULL,
	[FechaNombramiento] [datetime] NULL,
	[FechaIngreso] [datetime] NULL,
	[FechaSalida] [datetime] NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
	[FechaModificado] [datetime] NULL,
	[RecordID] [int] IDENTITY(1,1) NOT NULL,
	[ISRGlobal] [bit] NOT NULL DEFAULT 0,
	[FechaResolucion] [datetime] NULL,
	[Resolucion] [varchar](100) NULL,
	[EnCarrera] [bit] NOT NULL DEFAULT 0,
 CONSTRAINT [PK_NMEMPLEADOS] PRIMARY KEY NONCLUSTERED 
(
	[EmpleadoID] ASC,
	[EmpresaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
`;

async function run() {
    try {
        const pool = await sql.connect({
            user: 'sa',
            password: '123456789',
            server: 'localhost',
            database: 'RHDBW',
            port: 61980,
            options: { encrypt: false, trustServerCertificate: true }
        });
        await pool.request().query(query);
        console.log('Tabla NMEMPLEADOS creada exitosamente.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
run();
