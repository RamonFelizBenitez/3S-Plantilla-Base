const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT is_identity FROM sys.columns WHERE object_id = object_id('NMSUELDOEMPLEADO') AND name = 'RecordId'");
  console.log(r.recordset);
  process.exit(0);
}
run();
