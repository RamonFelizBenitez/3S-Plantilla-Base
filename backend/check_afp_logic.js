const { connectDB, sql } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const EmpresaID = '1';
  
  // 1. Get Params
  const paramResult = await pool.request()
    .input('EmpresaID', sql.VarChar, EmpresaID)
    .query(`SELECT TOP 1 * FROM NMAFPARS WHERE EmpresaId = @EmpresaID`);
  const parametrosAFP_ARS = paramResult.recordset[0] || {};
  console.log('Params:', parametrosAFP_ARS);

  // 2. Get Tipo Nomina
  const tipoNominaResult = await pool.request()
    .input('EmpresaID', sql.VarChar, EmpresaID)
    .input('TipoNominaID', sql.VarChar, 'F')
    .query(`SELECT * FROM NMTIPOSNOMINAS WHERE EmpresaId = @EmpresaID AND TipoNominaID = @TipoNominaID`);
  const tipoNominaInfo = tipoNominaResult.recordset[0];
  console.log('Tipo Nomina:', tipoNominaInfo.CalcularAFP, tipoNominaInfo.PeriodoAFP);

  // 3. Get Emp
  const empResult = await pool.request()
    .query(`SELECT TOP 1 e.EmpleadoID, e.FechaIngreso, e.AFP FROM NMEMPLEADOS e WHERE e.EmpleadoID = '0000001'`);
  const emp = empResult.recordset[0];
  console.log('Emp:', emp);
  
  // 4. Test logic
  console.log('Cond 1:', emp.AFP && tipoNominaInfo.CalcularAFP);
  
  process.exit(0);
}
run();
