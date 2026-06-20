const { sql, connectDB } = require('./src/config/db');
async function checkDB() {
  try {
    const pool = await connectDB();
    const res = await pool.request().query('SELECT * FROM RHSolicitudDocumentos');
    console.log(JSON.stringify(res.recordset, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkDB();
