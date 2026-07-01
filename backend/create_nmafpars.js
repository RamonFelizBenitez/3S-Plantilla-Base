const { sql, connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    
    const createQuery = `
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NMAFPARS]') AND type in (N'U'))
      BEGIN
        CREATE TABLE [dbo].[NMAFPARS](
            [EmpresaId] [varchar](3) NOT NULL,
            [TOPEAFP] [float] NOT NULL,
            [TOPEARS] [float] NOT NULL,
            [Riesgo] [float] NOT NULL,
            [Pcto1] [float] NOT NULL,
            [Pcto2] [float] NOT NULL,
            [Pcto3] [float] NOT NULL,
            [AportePension] [float] NOT NULL,
            [AporteSalud] [float] NOT NULL,
            [PatronoAFP] [float] NOT NULL,
            [PatronoARS] [float] NOT NULL,
            [CreadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [ModificadoPor] [varchar](15) NOT NULL DEFAULT 'SYSTEM',
            [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
            [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
            [RecordID] [int] IDENTITY(1,1) NOT NULL,
            CONSTRAINT [PK_NMAFPARS] PRIMARY KEY CLUSTERED 
            (
                [EmpresaId] ASC
            )
        ) ON [PRIMARY]
        print 'Table NMAFPARS created successfully.'
      END
      ELSE
      BEGIN
        print 'Table NMAFPARS already exists.'
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
