const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
CREATE TABLE [dbo].[NMEMPLEADOSNOM](
	[EmpleadoID] [varchar](20) NOT NULL,
	[TipoNominaId] [varchar](20) NOT NULL,
	[Empresaid] [varchar](3) NOT NULL,
	[FechaInicio] [datetime] NOT NULL,
	[CreadoPor] [varchar](15) NOT NULL,
	[ModificadoPor] [varchar](15) NOT NULL,
	[FechaCreado] [datetime] NOT NULL,
	[FechaModificado] [datetime] NOT NULL,
	[RecordId] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_NMEMPLEADOSNOM] PRIMARY KEY CLUSTERED 
(
	[EmpleadoID] ASC,
	[TipoNominaId] ASC,
	[Empresaid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
    `);
    console.log('Tabla NMEMPLEADOSNOM creada');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
