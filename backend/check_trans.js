const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT * FROM NMTRANSACCIONES WHERE EmpleadoID = '0000001'");
  console.dir(r.recordset, { depth: null });
  process.exit(0);
}
run();
