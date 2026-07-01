const { connectDB } = require('./src/config/db');

async function checkCols() {
  try {
    const pool = await connectDB();
    const res = await pool.request().query(`
      SELECT top 1 * FROM NMEMPLEADOS
    `);
    console.log(Object.keys(res.recordset[0]));
  } catch(e) {
    console.log(e);
  }
  process.exit();
}
checkCols();
