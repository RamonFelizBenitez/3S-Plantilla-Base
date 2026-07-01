const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMSUELDOEMPLEADO]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMSUELDOEMPLEADO](
            [EmpleadoID] [varchar](20) NOT NULL,
            [EmpresaId] [varchar](3) NOT NULL,
            [NominaNumero] [int] NOT NULL,
            [TipoNominaID] [varchar](20) NOT NULL,
            [CodigoPeriodo] [int] NOT NULL,
            [Salario] [money] NOT NULL DEFAULT 0,
            [CreadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
            [ModificadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
            [RecordId] [int] IDENTITY(1,1) NOT NULL,
         CONSTRAINT [PK_NMSUELDOEMPLEADO] PRIMARY KEY CLUSTERED 
        (
            [EmpleadoID] ASC,
            [EmpresaId] ASC,
            [NominaNumero] ASC,
            [TipoNominaID] ASC
        ) ON [PRIMARY]
        ) ON [PRIMARY]
        print 'Table NMSUELDOEMPLEADO created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMSUELDOEMPLEADO already exists.'
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
