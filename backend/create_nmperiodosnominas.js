const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMPERIODOSNOMINAS]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMPERIODOSNOMINAS](
            [CodigoPeriodo] [int] NOT NULL,
            [TipoPago] [int] NOT NULL,
            [Empresaid] [varchar](3) NOT NULL,
            [SecuenciaReg] [int] NOT NULL,
            [Secuencia] [int] NOT NULL,
            [Intervalo] [varchar](50) NOT NULL,
            [Posteado] [bit] NOT NULL DEFAULT 0,
            [Fecha] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaInicio] [datetime] NOT NULL,
            [FechaFinal] [datetime] NOT NULL,
            [TipoEmp] [varchar](15) NOT NULL DEFAULT 'TODOS',
            [CreadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [ModificadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
            [RecordID] [int] IDENTITY(1,1) NOT NULL,
         CONSTRAINT [PK_NMPERIODOSNOMINAS] PRIMARY KEY NONCLUSTERED 
        (
            [CodigoPeriodo] ASC,
            [TipoPago] ASC,
            [Empresaid] ASC,
            [SecuenciaReg] ASC,
            [Secuencia] ASC
        ) ON [PRIMARY]
        ) ON [PRIMARY]
        print 'Table NMPERIODOSNOMINAS created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMPERIODOSNOMINAS already exists.'
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
