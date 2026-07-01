const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT EmpleadoID, FechaIngreso FROM NMEMPLEADOS WHERE EmpleadoID = '0000001'");
  console.log(r.recordset);
  process.exit(0);
}
run();
