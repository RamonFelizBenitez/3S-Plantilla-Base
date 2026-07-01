const { connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RHSEPARACIONSERVICIO' and xtype='U')
      CREATE TABLE [dbo].[RHSEPARACIONSERVICIO](
          [SeparacionID] [int] NOT NULL,
          [EmpresaID] [varchar](3) NOT NULL,
          [EmpleadoID] [varchar](20) NULL,
          [TipoAccionID] [int] NULL,
          [Observacion] [varchar](750) NULL,
          [Procesado] [bit] NOT NULL,
          [FechaRegistro] [datetime] NULL,
          [Aprobado] [bit] NULL,
          [FechaSalida] [datetime] NULL,
          [FechaNombramiento] [datetime] NULL,
          [NumeroNombramiento] [int] NULL,
          [FechaCreado] [datetime] NOT NULL,
          [CreadoPor] [varchar](15) NOT NULL,
          [ModificadoPor] [varchar](15) NOT NULL,
          [FechaModificado] [datetime] NOT NULL,
       CONSTRAINT [PK_RHSEPARACIONSERVICIO] PRIMARY KEY CLUSTERED 
      (
          [SeparacionID] ASC,
          [EmpresaID] ASC
      )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
      ) ON [PRIMARY]
    `);
    console.log("Tabla RHSEPARACIONSERVICIO creada exitosamente.");
  } catch(e) {
    console.error("Error al crear tabla:", e.message);
  }
  process.exit();
}
createTable();
