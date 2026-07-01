const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT * FROM NMTIPOSTRANSACCIONES WHERE TipoTransId = 'CAF'");
  console.dir(r.recordset, { depth: null });
  process.exit(0);
}
run();
