const { connectDB, sql } = require('./src/config/db');

async function testSubirNomina() {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = new sql.Request(transaction);

    // Mock payload
    const empresaId = '1';
    const TipoNominaId = 'B';
    const CodigoPeriodo = 2026;
    const NominaNumero = 1;
    const Secuencia = 1;
    const fila = { EmpleadoID: '0000001', Transaccion: '01', Monto: 500, Tipo: '1' };

    await request
      .input('TipoNominaID', sql.VarChar, TipoNominaId)
      .input('CodigoPeriodo', sql.Int, parseInt(CodigoPeriodo))
      .input('NominaNumero', sql.Int, parseInt(NominaNumero))
      .input('Secuencia', sql.Int, parseInt(Secuencia))
      .input('EmpresaID', sql.VarChar, empresaId)
      .query(`
        DELETE FROM NMNOMINALINEAS 
        WHERE EmpresaId = @EmpresaID AND TipoNominaId = @TipoNominaID AND CodigoPeriodo = @CodigoPeriodo AND NominaNumero = @NominaNumero AND Secuencia = @Secuencia;
        
        DELETE FROM NMSUELDOEMPLEADO 
        WHERE EmpresaId = @EmpresaID AND TipoNominaID = @TipoNominaID AND CodigoPeriodo = @CodigoPeriodo AND NominaNumero = @NominaNumero;
      `);

    const reqFila = new sql.Request(transaction);
    await reqFila
      .input('EmpresaId_Sueldo', sql.VarChar, empresaId)
      .input('EmpleadoID_Sueldo', sql.VarChar, fila.EmpleadoID)
      .input('NominaNumero_Sueldo', sql.Int, parseInt(NominaNumero))
      .input('TipoNominaID_Sueldo', sql.VarChar, TipoNominaId)
      .input('CodigoPeriodo_Sueldo', sql.Int, parseInt(CodigoPeriodo))
      .input('Salario_Sueldo', sql.Decimal(18,2), 50000)
      .query(`
        INSERT INTO NMSUELDOEMPLEADO 
        (EmpleadoID, EmpresaId, NominaNumero, TipoNominaID, CodigoPeriodo, Salario, CreadoPor, FechaCreado, ModificadoPor, FechaModificado)
        VALUES 
        (@EmpleadoID_Sueldo, @EmpresaId_Sueldo, @NominaNumero_Sueldo, @TipoNominaID_Sueldo, @CodigoPeriodo_Sueldo, @Salario_Sueldo, 'EXCEL', GETDATE(), 'EXCEL', GETDATE())
      `);

    await reqFila
      .input('EmpresaId_Lin', sql.VarChar, empresaId)
      .input('EmpleadoID_Lin', sql.VarChar, fila.EmpleadoID)
      .input('CodigoPeriodo_Lin', sql.Int, parseInt(CodigoPeriodo))
      .input('NominaNumero_Lin', sql.Int, parseInt(NominaNumero))
      .input('Secuencia_Lin', sql.Int, parseInt(Secuencia))
      .input('TipoNominaId_Lin', sql.VarChar, TipoNominaId)
      .input('LineaNumero_Lin', sql.Int, 1)
      .input('TipoTransId_Lin', sql.VarChar, fila.Transaccion)
      .input('Tipo_Lin', sql.VarChar, fila.Tipo || '1')
      .input('Monto_Lin', sql.Decimal(18,4), fila.Monto)
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

    console.log("Transaction SUCCEEDED");
    await transaction.rollback();
  } catch (err) {
    console.error("Transaction FAILED:", err.message);
    await transaction.rollback();
  }
  process.exit(0);
}

testSubirNomina();
