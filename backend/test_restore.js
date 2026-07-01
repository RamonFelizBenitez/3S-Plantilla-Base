const { connectDB, sql } = require('./src/config/db');

async function restore() {
  const pool = await connectDB();
  try {
    await pool.request().query(`
      INSERT INTO NMSUELDOEMPLEADO 
      (EmpleadoID, EmpresaId, NominaNumero, TipoNominaID, CodigoPeriodo, Salario, CreadoPor, FechaCreado, ModificadoPor, FechaModificado) 
      VALUES 
      ('0000001', '1', 1, 'F', 2026, 50000, 'SYSTEM', GETDATE(), 'SYSTEM', GETDATE()), 
      ('0000002', '1', 1, 'F', 2026, 78000, 'SYSTEM', GETDATE(), 'SYSTEM', GETDATE())
    `);
    console.log("Restored");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
restore();
