const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
CREATE TABLE [dbo].[NMACTUALIZASUELDO](
	[Actualizasueldoid] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaId] [varchar](3) NOT NULL,
	[Empleadoid] [varchar](20) NULL,
	[Nombre] [varchar](80) NULL,
	[SueldoActual] [decimal](12,2) NULL,
	[SueldoPropuesto] [decimal](12,2) NULL,
	[FechaInicio] [datetime] NULL,
	[Estatus] [bit] NULL DEFAULT 0,
	[CreadoPor] [varchar](15) NULL,
	[ModificadoPor] [varchar](15) NULL,
	[FechaCreado] [datetime] NULL,
	[FechaModificado] [datetime] NULL,
 CONSTRAINT [PK_NMACTUALIZASUELDO] PRIMARY KEY CLUSTERED 
(
	[Actualizasueldoid] ASC,
	[EmpresaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
    `);
    console.log('Tabla NMACTUALIZASUELDO creada');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
