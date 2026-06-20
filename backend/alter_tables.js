const { connectDB } = require('./src/config/db');

async function alterTables() {
  try {
    const pool = await connectDB();
    console.log('Connected to DB. Altering tables to varchar(80)...');
    
    await pool.request().query(`
      ALTER TABLE NMCargos ALTER COLUMN CreadoPor varchar(80) NOT NULL;
      ALTER TABLE NMCargos ALTER COLUMN ModificadoPor varchar(80) NOT NULL;
      
      ALTER TABLE RHSolicitud ALTER COLUMN CreadoPor varchar(80) NOT NULL;
      ALTER TABLE RHSolicitud ALTER COLUMN ModificadoPor varchar(80) NOT NULL;
    `);
    
    console.log('ALTER TABLES 80 SUCCESS!');
  } catch (err) {
    console.error('SQL ERROR:', err);
  } finally {
    process.exit(0);
  }
}

alterTables();
