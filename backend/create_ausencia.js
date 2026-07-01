const { connectDB } = require('./src/config/db');
async function create() {
  const pool = await connectDB();
  await pool.request().query(`
    CREATE TABLE [dbo].[RHAUSENCIA](
      [AusenciaID] [int] NOT NULL,
      [EmpresaID] [varchar](3) NOT NULL,
      [EmpleadoID] [varchar](20) NOT NULL,
      [TipoAccionID] [int] NULL,
      [FechaRegistro] [datetime] NULL,
      [FechaDesde] [datetime] NOT NULL,
      [FechaHasta] [datetime] NOT NULL,
      [CantidadHora] [int] NOT NULL,
      [FechaNombramiento] [datetime] NULL,
      [NumeroNombramiento] [int] NULL,
      [Aprobado] [bit] NULL,
      [Procesado] [bit] NULL,
      [Anulado] [bit] NULL,
      [Observacion] [varchar](500) NULL,
      [FechaCreado] [datetime] NOT NULL,
      [CreadoPor] [varchar](15) NOT NULL,
      [ModificadoPor] [varchar](15) NOT NULL,
      [FechaModificado] [datetime] NOT NULL,
      CONSTRAINT [PK_RHAUSENCIA] PRIMARY KEY CLUSTERED 
      (
        [AusenciaID] ASC,
        [EmpresaID] ASC
      )
    )
  `);
  console.log('Table created');
  process.exit(0);
}
create();
