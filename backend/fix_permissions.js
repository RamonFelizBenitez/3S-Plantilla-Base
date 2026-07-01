const { connectDB } = require('./src/config/db');

async function fixPermissions() {
    try {
        let pool = await connectDB();
        
        // Dar permisos totales a todos los usuarios para la OpcionID 103 (Motivos de Separación) 
        // a los cuales ya tienen acceso a la carpeta de Configuración (OpcionID 20)
        
        await pool.request().query(`
            INSERT INTO Permisos_Usuarios (UsuarioID, EmpresaID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar)
            SELECT DISTINCT UsuarioID, EmpresaID, 103, 1, 1, 1, 1
            FROM Permisos_Usuarios
            WHERE OpcionID = 20 AND UsuarioID NOT IN (
                SELECT UsuarioID FROM Permisos_Usuarios WHERE OpcionID = 103
            )
        `);

        // También por si acaso insertamos para todos los perfiles que tienen acceso a Configuración
        await pool.request().query(`
            INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar)
            SELECT DISTINCT PerfilID, 103, 1, 1, 1, 1
            FROM Permisos_Perfiles
            WHERE OpcionID = 20 AND PerfilID NOT IN (
                SELECT PerfilID FROM Permisos_Perfiles WHERE OpcionID = 103
            )
        `);

        console.log("Permisos actualizados para usuarios y perfiles que tienen acceso a Configuración.");
    } catch(err) {
        console.error("Error:", err.message);
    }
    process.exit();
}

fixPermissions();
