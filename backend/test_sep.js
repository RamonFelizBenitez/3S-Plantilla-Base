const { connectDB } = require('./src/config/db');

async function check() {
  try {
    const pool = await connectDB();
    const res = await pool.request().query(`
      SELECT * FROM sysobjects WHERE name='RHSEPARACIONSERVICIO' and xtype='U'
    `);
    console.log("Table exists?", res.recordset.length > 0);
  } catch(e) {
    console.log(e.message);
  }
  process.exit();
}
check();
