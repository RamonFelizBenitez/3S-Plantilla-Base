const { connectDB, sql } = require('./src/config/db');

async function testInsert() {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const reqFila = new sql.Request(transaction);

    await reqFila
      .input('EmpresaId', sql.VarChar, '1')
      .input('EmpleadoID', sql.VarChar, '0000001')
      .input('NominaNumero', sql.Int, 1)
      .input('TipoNominaID', sql.VarChar, 'F')
      .input('CodigoPeriodo', sql.Int, 2026)
      .input('Salario', sql.Decimal(18,2), 50000)
      .query(`
        INSERT INTO NMSUELDOEMPLEADO 
        (EmpleadoID, EmpresaId, NominaNumero, TipoNominaID, CodigoPeriodo, Salario, CreadoPor, FechaCreado, ModificadoPor, FechaModificado)
        VALUES 
        (@EmpleadoID, @EmpresaId, @NominaNumero, @TipoNominaID, @CodigoPeriodo, @Salario, 'EXCEL', GETDATE(), 'EXCEL', GETDATE())
      `);

    console.log("Insert SUELDO successful");
    await transaction.rollback();
  } catch (err) {
    console.error("Insert SUELDO failed:", err.message);
    await transaction.rollback();
  }
  process.exit(0);
}

testInsert();
