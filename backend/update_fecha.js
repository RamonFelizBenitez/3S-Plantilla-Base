const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  await pool.request().query("UPDATE NMEMPLEADOS SET FechaIngreso = '2026-01-01' WHERE EmpleadoID = '0000001'");
  console.log('Updated');
  process.exit(0);
}
run();
