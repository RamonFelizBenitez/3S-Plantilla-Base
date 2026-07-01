const { connectDB, sql } = require('./src/config/db');

async function testInsert() {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const reqFila = new sql.Request(transaction);

    await reqFila
      .input('EmpresaId_Lin', sql.VarChar, '1')
      .input('EmpleadoID_Lin', sql.VarChar, '0000001')
      .input('CodigoPeriodo_Lin', sql.Int, 2026)
      .input('NominaNumero_Lin', sql.Int, 1)
      .input('Secuencia_Lin', sql.Int, 1)
      .input('TipoNominaId_Lin', sql.VarChar, 'F')
      .input('LineaNumero_Lin', sql.Int, 999)
      .input('TipoTransId_Lin', sql.VarChar, '1')
      .input('Tipo_Lin', sql.VarChar, '1')
      .input('Monto_Lin', sql.Decimal(18,4), 100)
      .input('MonedaID', sql.VarChar, 'DOP')
      .input('TipoPago', sql.Int, 2)
      .input('SalarioMensual', sql.Decimal(18,2), 50000)
      .input('Posteado', sql.Bit, 0)
      .input('Texto', sql.VarChar, 'CARGA EXCEL')
      .input('FechaRetencion', sql.DateTime, new Date())
      .query(`
        INSERT INTO NMNOMINALINEAS
        (Empresaid, EmpleadoID, CodigoPeriodo, NominaNumero, Secuencia, TipoNominaId, LineaNumero, TipoTransId, Monto, Tipo, MonedaID, TipoPago, SalarioMensual, Posteado, Texto, FechaRetencion, CreadoPor, FechaCreado, ModificadoPor, FechaModificado)
        VALUES
        (@EmpresaId_Lin, @EmpleadoID_Lin, @CodigoPeriodo_Lin, @NominaNumero_Lin, @Secuencia_Lin, @TipoNominaId_Lin, @LineaNumero_Lin, @TipoTransId_Lin, @Monto_Lin, @Tipo_Lin, @MonedaID, @TipoPago, @SalarioMensual, @Posteado, @Texto, @FechaRetencion, 'EXCEL', GETDATE(), 'EXCEL', GETDATE())
      `);

    console.log("Insert successful");
    await transaction.rollback(); // Rollback so we don't mess up data
  } catch (err) {
    console.error("Insert failed:", err.message);
    await transaction.rollback();
  }
  process.exit(0);
}

testInsert();
