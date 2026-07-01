const { connectDB, sql } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    const EmpresaID = '1';
    const EmpleadoID = '0000001';

    const dependientesEmp = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('EmpleadoID', sql.VarChar, EmpleadoID)
      .query(`
        SELECT d.TransaccionID, t.Tipo 
        FROM NMDependiente d
        LEFT JOIN NMTIPOSTRANSACCIONES t ON d.TransaccionID = t.TipoTransId AND d.EmpresaID = t.EmpresaId
        WHERE d.EmpresaID = @EmpresaID AND d.EmpleadoID = @EmpleadoID AND d.Cobrar = 1
      `);
      
    console.log('dependientesEmp:', dependientesEmp.recordset);
    
    // Simulate Insert
    if (dependientesEmp.recordset.length > 0) {
      const dep = dependientesEmp.recordset[0];
      const tipoTrans = dep.TransaccionID;
      const tipoNaturaleza = dep.Tipo || 2;
      const montoDependiente = 1919.78;
      
      console.log('Inserting with type:', tipoNaturaleza, 'trans:', tipoTrans);
      
      const insertResult = await pool.request()
        .input('CodigoPeriodo', sql.Int, 2026)
        .input('Empresaid', sql.VarChar, '1')
        .input('TipoNominaId', sql.VarChar, 'F')
        .input('Secuencia', sql.Int, 1)
        .input('NominaNumero', sql.Int, 1)
        .input('LineaNumero', sql.VarChar, '0001')
        .input('MonedaID', sql.VarChar, 'DOP')
        .input('TipoPago', sql.Int, 1)
        .input('EmpleadoID', sql.VarChar, '0000001')
        .input('TipoTransId', sql.VarChar, tipoTrans)
        .input('Tipo', sql.Int, tipoNaturaleza)
        .input('Monto', sql.Money, montoDependiente)
        .input('SalarioMensual', sql.Money, 50000)
        .input('Posteado', sql.Bit, 0)
        .input('Texto', sql.VarChar, 'Descuento Dependiente')
        .input('CreadoPor', sql.VarChar, 'SYSTEM')
        .input('ModificadoPor', sql.VarChar, 'SYSTEM')
        .input('FechaRetencion', sql.DateTime, new Date())
        .query(`
          INSERT INTO NMNOMINALINEAS 
            (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
          VALUES
            (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
        `);
      console.log('Insert success:', insertResult.rowsAffected);
    }
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}
run();
