const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'NMTIPOSNOMINAS' AND COLUMN_NAME = 'MontoDependiente'
      )
      BEGIN
        ALTER TABLE NMTIPOSNOMINAS ADD MontoDependiente money NOT NULL DEFAULT 0
      END
    `);
    console.log("Column MontoDependiente added successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
