const { connectDB } = require('./src/config/db');

async function test() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES");
  const nomTables = r.recordset.map(x => x.TABLE_NAME).filter(n => n.includes("NOM"));
  console.log(nomTables);
  process.exit(0);
}

test();
