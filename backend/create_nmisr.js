const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    // Create NMISR table
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMISR]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMISR](
            [Ident] [int] NOT NULL,
            [EmpresaID] [varchar](3) NOT NULL,
            [TipoTransID] [varchar](50) NULL,
            [SueldoInicial] [money] NULL,
            [SueldoFinal] [money] NULL,
            [Valor] [money] NULL,
            [Base] [money] NULL,
            [FechaInicial] [datetime] NULL,
            [FechaFinal] [datetime] NULL,
            [CreadoPor] [varchar](15) NULL,
            [ModificadoPor] [varchar](15) NULL,
            [FechaCreado] [datetime] NULL DEFAULT GETDATE(),
            [FechaModificado] [datetime] NULL DEFAULT GETDATE(),
            CONSTRAINT [PK_NMISR] PRIMARY KEY CLUSTERED 
            (
                [Ident] ASC,
                [EmpresaID] ASC
            )
        ) ON [PRIMARY]
        print 'Table NMISR created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMISR already exists.'
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
