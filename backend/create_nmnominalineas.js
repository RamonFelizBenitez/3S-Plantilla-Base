const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMNOMINALINEAS]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMNOMINALINEAS](
            [NominalineaID] [int] IDENTITY(1,1) NOT NULL,
            [CodigoPeriodo] [int] NOT NULL,
            [Empresaid] [varchar](3) NOT NULL,
            [TipoNominaId] [varchar](20) NOT NULL,
            [Secuencia] [int] NOT NULL,
            [NominaNumero] [int] NOT NULL,
            [LineaNumero] [varchar](10) NOT NULL,
            [MonedaID] [varchar](3) NOT NULL DEFAULT 'DOP',
            [TipoPago] [int] NOT NULL,
            [cuentabanco] [varchar](20) NULL,
            [EmpleadoID] [varchar](20) NOT NULL,
            [TipoTransId] [varchar](10) NOT NULL,
            [Tipo] [int] NOT NULL,
            [Monto] [money] NOT NULL DEFAULT 0,
            [salarioneto] [money] NULL,
            [SalarioMensual] [money] NOT NULL DEFAULT 0,
            [Posteado] [bit] NOT NULL DEFAULT 0,
            [Texto] [varchar](30) NOT NULL DEFAULT '',
            [CreadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [ModificadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaRetencion] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
         CONSTRAINT [PK_NMNOMINALINEAS_1] PRIMARY KEY CLUSTERED 
        (
            [CodigoPeriodo] ASC,
            [Empresaid] ASC,
            [TipoNominaId] ASC,
            [Secuencia] ASC,
            [NominaNumero] ASC,
            [LineaNumero] ASC,
            [NominalineaID] ASC
        ) ON [PRIMARY]
        ) ON [PRIMARY]
        print 'Table NMNOMINALINEAS created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMNOMINALINEAS already exists.'
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
