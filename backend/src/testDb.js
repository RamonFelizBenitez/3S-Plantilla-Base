const { sql, connectDB } = require('./config/db');

async function test() {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Opciones WHERE ModuloID IN (2, 3)');
    console.log("Opciones para Modulo 2 y 3:", result.recordset);
    process.exit(0);
}
test();
