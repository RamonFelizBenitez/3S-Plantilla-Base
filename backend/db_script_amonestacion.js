const { sql, connectDB } = require('./src/config/db');

async function executeDBScript() {
    try {
        const pool = await connectDB();
        
        console.log("Creating RHAMONESTACION...");
        await pool.request().query(`
            IF OBJECT_ID('RHAMONESTACION', 'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[RHAMONESTACION](
                    [AmonestacionID] [int] NOT NULL,
                    [EmpresaID] [varchar](3) NOT NULL,
                    [EmpleadoID] [varchar](20) NOT NULL,
                    [TipoAccionID] [int] NULL,
                    [Fecha] [datetime] NULL,
                    [Documento] [varchar](30) NOT NULL,
                    [Observacion] [varchar](500) NULL,
                    [Grado] [varchar](50) NULL,
                    [ClasificacionID] [int] NOT NULL,
                    [FechaRegistro] [datetime] NULL,
                    [Aprobado] [bit] NULL,
                    [FechaNombramiento] [datetime] NULL,
                    [NumeroNombramiento] [int] NULL,
                    [Procesado] [bit] NULL,
                    [Anulado] [bit] NULL,
                    [FechaCreado] [datetime] NOT NULL,
                    [CreadoPor] [varchar](15) NOT NULL,
                    [ModificadoPor] [varchar](15) NOT NULL,
                    [FechaModificado] [datetime] NOT NULL,
                    CONSTRAINT [PK_RHAMONESTACION] PRIMARY KEY CLUSTERED 
                    (
                        [AmonestacionID] ASC,
                        [EmpresaID] ASC
                    ) ON [PRIMARY]
                ) ON [PRIMARY]
            END
        `);
        console.log("RHAMONESTACION created.");

        // Insert into Opciones for Sidebar
        console.log("Adding Amonestaciones to Opciones...");
        const res = await pool.request().query("SELECT OpcionID FROM Opciones WHERE Nombre = 'Acciones' AND EsCarpeta = 1");
        if (res.recordset.length > 0) {
            const parentId = res.recordset[0].OpcionID;
            // Check if it exists
            const check = await pool.request().query("SELECT OpcionID FROM Opciones WHERE Nombre = 'Amonestaciones' AND CarpetaPadreID = " + parentId);
            if (check.recordset.length === 0) {
                await pool.request().query(`
                    INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden)
                    VALUES (1, ${parentId}, 'Amonestaciones', '/recursos-humanos/acciones/amonestaciones', '', 0, 5)
                `);
                console.log("Amonestaciones added to Opciones.");
            } else {
                console.log("Amonestaciones already exists in Opciones.");
            }
        } else {
            console.log("Parent folder 'Acciones' not found!");
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

executeDBScript();
