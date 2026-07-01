const { sql, connectDB } = require('./src/config/db');

async function executeDBScript() {
    try {
        const pool = await connectDB();
        
        // 1. Drop old table if exists
        await pool.request().query(`
            IF OBJECT_ID('RHMOTIVO', 'U') IS NOT NULL
                DROP TABLE RHMOTIVO;
        `);
        console.log("RHMOTIVO dropped if it existed.");

        // 2. Create new table
        await pool.request().query(`
            IF OBJECT_ID('RHCLASIFICACION', 'U') IS NULL
            BEGIN
                CREATE TABLE RHCLASIFICACION (
                    ClasificacionID INT IDENTITY(1,1) PRIMARY KEY,
                    EmpresaID VARCHAR(3) NOT NULL,
                    Descripcion VARCHAR(150) NOT NULL,
                    Estatus INT DEFAULT 1,
                    CreadoPor VARCHAR(15) NULL,
                    FechaCreado DATETIME DEFAULT GETDATE(),
                    ModificadoPor VARCHAR(15) NULL,
                    FechaModificado DATETIME NULL
                );
            END
        `);
        console.log("RHCLASIFICACION created.");

        // 3. Update Opciones menu
        await pool.request().query(`
            UPDATE Opciones
            SET Nombre = 'Clasificación', Ruta = '/configuracion/clasificaciones'
            WHERE Nombre = 'Motivos de Separación' OR Ruta = '/configuracion/motivos-separacion'
        `);
        console.log("Opciones updated.");

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

executeDBScript();
