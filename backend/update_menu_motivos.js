const { connectDB } = require('./src/config/db');

async function updateMenu() {
    try {
        let pool = await connectDB();
        
        // 1. Encontrar el CarpetaPadreID de 'Configuración' en el Módulo 1
        const resultConf = await pool.request().query(`
            SELECT OpcionID FROM Opciones WHERE Nombre = 'Configuración' AND ModuloID = 1 AND EsCarpeta = 1
        `);
        
        if (resultConf.recordset.length > 0) {
            const fConf = resultConf.recordset[0].OpcionID;

            // Verificar si 'Motivos de Separación' ya existe
            const resultExist = await pool.request().query(`
                SELECT OpcionID FROM Opciones WHERE Nombre = 'Motivos de Separación' AND CarpetaPadreID = ${fConf}
            `);

            if (resultExist.recordset.length === 0) {
                // Insertar Motivos de Separación
                const insertRes = await pool.request().query(`
                    INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) 
                    OUTPUT INSERTED.OpcionID
                    VALUES (1, ${fConf}, 'Motivos de Separación', '/configuracion/motivos-separacion', '', 0, 6)
                `);
                
                const newOpcionID = insertRes.recordset[0].OpcionID;

                // Actualizar orden de Parámetros
                await pool.request().query(`
                    UPDATE Opciones SET Orden = 7 WHERE Nombre = 'Parámetros' AND CarpetaPadreID = ${fConf}
                `);

                // Dar permisos al perfil Administrador (PerfilID = 1)
                await pool.request().query(`
                    INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar) 
                    VALUES (1, ${newOpcionID}, 1, 1, 1, 1)
                `);

                console.log("Menú actualizado con éxito");
            } else {
                console.log("El menú ya existía.");
            }
        } else {
            console.log("No se encontró la carpeta Configuración");
        }
    } catch(err) {
        console.error("Error:", err.message);
    }
    process.exit();
}

updateMenu();
