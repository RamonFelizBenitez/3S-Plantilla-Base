const { connectDB } = require('./src/config/db');
async function check() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT * FROM NMSUELDOEMPLEADO");
  console.log("NMSUELDOEMPLEADO: ", r.recordset);
  const r2 = await pool.request().query("SELECT * FROM NMNOMINALINEAS");
  console.log("NMNOMINALINEAS: ", r2.recordset);
  process.exit(0);
}
check();
