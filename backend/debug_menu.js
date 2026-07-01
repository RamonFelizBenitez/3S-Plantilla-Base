const { connectDB } = require('./src/config/db');

async function debugMenu() {
    try {
        let pool = await connectDB();
        
        const result = await pool.request().query(`
            SELECT O.OpcionID, O.Nombre, O.Ruta, O.EsCarpeta, O.ModuloID, O.CarpetaPadreID, PP.PuedeConsultar
            FROM Opciones O
            LEFT JOIN Permisos_Perfiles PP ON O.OpcionID = PP.OpcionID AND PP.PerfilID = 1
            WHERE O.ModuloID = 1
            ORDER BY O.CarpetaPadreID, O.Orden
        `);
        console.table(result.recordset);
    } catch(err) {
        console.error("Error:", err.message);
    }
    process.exit();
}

debugMenu();
