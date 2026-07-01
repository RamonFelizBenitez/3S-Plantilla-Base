const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'NMTIPOSTRANSACCIONES' AND COLUMN_NAME = 'Salario'
      )
      BEGIN
        ALTER TABLE NMTIPOSTRANSACCIONES ADD Salario bit NOT NULL DEFAULT 0
      END
    `);
    console.log("Column Salario added successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
