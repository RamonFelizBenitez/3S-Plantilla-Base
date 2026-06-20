const { connectDB } = require('./src/config/db');

async function run() {
    try {
        const pool = await connectDB();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RHPARAMETROS]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[RHPARAMETROS](
                    [EmpresaID] [varchar](3) NOT NULL,
                    [Firma1] [varchar](100) NOT NULL DEFAULT (''),
                    [CargoIDFirma1] [varchar](20) NOT NULL DEFAULT (''),
                    [Firma2] [varchar](100) NOT NULL DEFAULT (''),
                    [CargoIDFirma2] [varchar](20) NOT NULL DEFAULT (''),
                    [Firma3] [varchar](100) NOT NULL DEFAULT (''),
                    [CargoIDFirma3] [varchar](20) NOT NULL DEFAULT (''),
                    [CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
                    [ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
                    [FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
                    [FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
                 CONSTRAINT [PK_RHPARAMETROS] PRIMARY KEY CLUSTERED ([EmpresaID] ASC)
                ) ON [PRIMARY]
                console.log('Tabla RHPARAMETROS creada exitosamente.');
            END
            ELSE
            BEGIN
                console.log('Tabla RHPARAMETROS ya existe.');
            END
        `);
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit();
}

run();
