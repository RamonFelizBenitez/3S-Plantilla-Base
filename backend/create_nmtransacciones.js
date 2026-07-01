const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMTRANSACCIONES]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMTRANSACCIONES](
            [EmpleadoID] [varchar](20) NOT NULL,
            [EmpresaId] [varchar](3) NOT NULL,
            [TipoNovedad] [int] NOT NULL,
            [LineaNumero] [int] IDENTITY(1,1) NOT NULL,
            [TipoNominaId] [varchar](20) NOT NULL,
            [TipoTransId] [varchar](10) NOT NULL,
            [Fecha] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaActualizacion] [datetime] NOT NULL DEFAULT GETDATE(),
            [Balance] [money] NOT NULL DEFAULT 0,
            [Acumulado] [money] NOT NULL DEFAULT 0,
            [Monto] [money] NOT NULL DEFAULT 0,
            [Abono] [money] NOT NULL DEFAULT 0,
            [TotalPagado] [money] NOT NULL DEFAULT 0,
            [Inactiva] [bit] NOT NULL DEFAULT 0,
            [Intervalo] [int] NOT NULL,
            [Frecuencia] [int] NOT NULL DEFAULT 0,
            [Estatus] [varchar](20) NOT NULL DEFAULT 'Activo',
            [Texto] [varchar](30) NOT NULL DEFAULT '',
            [CreadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [ModificadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
            [RecordID] [int] NOT NULL DEFAULT 0,
         CONSTRAINT [PK_NMTRANSACCIONES] PRIMARY KEY CLUSTERED 
        (
            [EmpleadoID] ASC,
            [EmpresaId] ASC,
            [TipoNovedad] ASC,
            [LineaNumero] ASC
        ) ON [PRIMARY]
        ) ON [PRIMARY]
        print 'Table NMTRANSACCIONES created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMTRANSACCIONES already exists.'
      END
    `;
    
    await pool.request().query(createQuery);
    console.log("Database script executed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

createTable();
