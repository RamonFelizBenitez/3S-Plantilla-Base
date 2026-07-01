const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMNOMINA]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMNOMINA](
            [Linea] [int] IDENTITY(1,1) NOT NULL,
            [CodigoPeriodo] [int] NOT NULL,
            [Empresaid] [varchar](3) NOT NULL,
            [TipoNominaId] [varchar](20) NOT NULL,
            [Secuencia] [int] NOT NULL,
            [NominaNumero] [int] NOT NULL,
            [Descripcion] [varchar](200) NOT NULL,
            [TipoPago] [int] NOT NULL,
            [FechaInicial] [datetime] NOT NULL,
            [FechaFinal] [datetime] NOT NULL,
            [FechaGeneracion] [datetime] NOT NULL,
            [FechaCierre] [datetime] NOT NULL DEFAULT '1900-01-01',
            [Posteado] [bit] NOT NULL DEFAULT 0,
            [Voucher] [varchar](20) NOT NULL DEFAULT '',
            [CreadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [ModificadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
         CONSTRAINT [PK_NMNOMINA] PRIMARY KEY NONCLUSTERED 
        (
            [CodigoPeriodo] ASC,
            [Empresaid] ASC,
            [TipoNominaId] ASC,
            [Secuencia] ASC,
            [NominaNumero] ASC,
            [Linea] ASC
        ) ON [PRIMARY]
        ) ON [PRIMARY]
        print 'Table NMNOMINA created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMNOMINA already exists.'
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
