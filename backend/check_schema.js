const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const tableName = process.argv[2];
    if (!tableName) {
      console.error("Usage: node check_schema.js <TableName>");
      process.exit(1);
    }
    const pool = await connectDB();
    const res = await pool.request()
      .input('TableName', sql.VarChar, tableName)
      .query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @TableName`);
    console.log(res.recordset);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
