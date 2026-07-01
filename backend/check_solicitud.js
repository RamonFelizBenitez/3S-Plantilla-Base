const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT * FROM RHSolicitud");
  console.log('RHSolicitud:', r.recordset);
  
  const r2 = await pool.request().query("SELECT * FROM RHDependienteSolicitante");
  console.log('RHDependienteSolicitante:', r2.recordset);
  process.exit(0);
}
run();
