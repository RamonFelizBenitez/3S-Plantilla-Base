const { sql, connectDB } = require('./src/config/db');

async function createTable() {
    try {
        const pool = await connectDB();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RHVACACION' and xtype='U')
            BEGIN
                CREATE TABLE [dbo].[RHVACACION](
                    [VacacionID] [int] NOT NULL,
                    [EmpresaID] [varchar](3) NOT NULL,
                    [EmpleadoID] [varchar](20) NOT NULL,
                    [TipoAccionID] [int] NULL,
                    [Observacion] [varchar](500) NULL,
                    [FechaNombramiento] [datetime] NULL,
                    [FechaInicio] [datetime] NULL,
                    [FechaFin] [datetime] NULL,
                    [FechaRegistro] [datetime] NULL,
                    [NumeroNombramiento] [int] NULL,
                    [Procesado] [bit] NULL,
                    [Aprobado] [bit] NULL,
                    [Anulado] [bit] NULL,
                    [FechaCreado] [datetime] NOT NULL,
                    [CreadoPor] [varchar](15) NOT NULL,
                    [ModificadoPor] [varchar](15) NOT NULL,
                    [FechaModificado] [datetime] NOT NULL,
                 CONSTRAINT [PK_RHVACACION] PRIMARY KEY CLUSTERED 
                (
                    [VacacionID] ASC,
                    [EmpresaID] ASC
                )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
                ) ON [PRIMARY]
                
                PRINT 'Tabla RHVACACION creada exitosamente.'
            END
            ELSE
            BEGIN
                PRINT 'La tabla RHVACACION ya existe.'
            END
        `);
        console.log('Script ejecutado exitosamente.');
        process.exit(0);
    } catch (err) {
        console.error('Error creando tabla RHVACACION:', err);
        process.exit(1);
    }
}

createTable();
