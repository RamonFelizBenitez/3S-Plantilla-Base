const { sql, connectDB } = require('./src/config/db');

async function testControllerDirectly() {
  try {
    const pool = await connectDB();
    console.log('Connected to DB. Attempting to insert...');
    
    const check = await pool.request()
      .input('CargoID', sql.VarChar, 'TEST_DIRECT')
      .input('EmpresaID', sql.VarChar, '1')
      .query('SELECT 1 FROM NMCargos WHERE CargoID = @CargoID AND EmpresaID = @EmpresaID');
      
    if (check.recordset.length > 0) {
      console.log('Exists');
    } else {
      await pool.request()
        .input('CargoID', sql.VarChar, 'TEST_DIRECT')
        .input('EmpresaID', sql.VarChar, '1')
        .input('Descripcion', sql.VarChar, 'Test Description')
        .input('CreadoPor', sql.VarChar, 'admin')
        .input('ModificadoPor', sql.VarChar, 'admin')
        .query(`
          INSERT INTO NMCargos (CargoID, EmpresaID, Descripcion, CreadoPor, ModificadoPor) 
          VALUES (@CargoID, @EmpresaID, @Descripcion, @CreadoPor, @ModificadoPor)
        `);
      console.log('Insert Success!');
    }
  } catch (err) {
    console.error('SQL ERROR DETAILS:', err);
  } finally {
    process.exit(0);
  }
}

testControllerDirectly();
