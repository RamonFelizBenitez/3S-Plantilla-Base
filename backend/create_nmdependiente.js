const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    
    // Check if table already exists
    const tableCheck = await pool.request().query(`
      SELECT * FROM sys.objects 
      WHERE object_id = OBJECT_ID(N'[dbo].[NMDependiente]') AND type in (N'U')
    `);
    
    if (tableCheck.recordset.length > 0) {
      console.log('La tabla NMDependiente ya existe. Eliminándola para recrear...');
      await pool.request().query(`DROP TABLE [dbo].[NMDependiente]`);
    }

    await pool.request().query(`
      CREATE TABLE [dbo].[NMDependiente](
        [DependienteID] [int] NOT NULL,
        [EmpresaID] [varchar](3) NOT NULL,
        [EmpleadoID] [varchar](20) NOT NULL,
        [NombreDependiente] [varchar](70) NULL,
        [Cobrar] [bit] NOT NULL DEFAULT 1,
        [TransaccionID] [varchar](10) NOT NULL,
        [CreadoPor] [varchar](80) NOT NULL DEFAULT 'SYSTEM',
        [ModificadoPor] [varchar](80) NOT NULL DEFAULT 'SYSTEM',
        [FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
        [FechaModificado] [datetime] NOT NULL DEFAULT GETDATE(),
        [RecordId] [int] IDENTITY(1,1) NOT NULL,
        CONSTRAINT [PK_NMDependiente] PRIMARY KEY CLUSTERED 
        (
          [DependienteID] ASC,
          [EmpresaID] ASC,
          [EmpleadoID] ASC
        ),
        CONSTRAINT [FK_NMDependiente_NMTIPOSTRANSACCIONES] FOREIGN KEY 
        (
          [TransaccionID], 
          [EmpresaID]
        ) REFERENCES [dbo].[NMTIPOSTRANSACCIONES] ([TipoTransId], [EmpresaId])
      ) ON [PRIMARY]
    `);
    
    console.log('Tabla NMDependiente creada exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error al crear la tabla NMDependiente:', err);
    process.exit(1);
  }
}

run();
