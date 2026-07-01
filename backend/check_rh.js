const { connectDB, sql } = require('./src/config/db');

async function test() {
  const pool = await connectDB();
  const cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'RHpercep'");
  console.log("RHpercep COLUMNS:", cols.recordset.map(x => x.COLUMN_NAME));
  process.exit(0);
}

test();
