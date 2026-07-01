const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT * FROM NMNOMINALINEAS");
  console.log(r.recordset);
  process.exit(0);
}
run();
