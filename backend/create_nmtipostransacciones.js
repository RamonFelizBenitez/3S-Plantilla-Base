const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
CREATE TABLE [dbo].[NMTIPOSTRANSACCIONES](
	[TipoTransId] [varchar](10) NOT NULL,
	[EmpresaId] [varchar](3) NOT NULL,
	[Descripcion] [varchar](50) NOT NULL,
	[Tipo] [int] NOT NULL,
	[ISR] [bit] NOT NULL,
	[AFP] [bit] NOT NULL,
	[ARS] [bit] NOT NULL,
	[Excento] [bit] NOT NULL,
	[Dependiente] [bit] NOT NULL,
	[CreadoPor] [varchar](15) NOT NULL,
	[ModificadoPor] [varchar](15) NOT NULL,
	[FechaCreado] [datetime] NOT NULL,
	[FechaModificado] [datetime] NOT NULL,
	[RecordId] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_NMTIPOSTRANSACCIONES] PRIMARY KEY NONCLUSTERED 
(
	[TipoTransId] ASC,
	[EmpresaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
    `);
    console.log('Tabla NMTIPOSTRANSACCIONES creada');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
