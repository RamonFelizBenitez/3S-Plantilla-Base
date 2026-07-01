const { connectDB } = require('./src/config/db');
async function run() {
  const pool = await connectDB();
  const r = await pool.request().query("SELECT * FROM NMPERIODOSNOMINAS WHERE EmpresaId='1' AND SecuenciaReg=1");
  console.log(r.recordset);
  const r2 = await pool.request().query("SELECT * FROM NMTIPOSNOMINAS WHERE EmpresaId='1' AND TipoNominaID='F'");
  console.log(r2.recordset);
  const r3 = await pool.request().query("SELECT * FROM NMDependiente WHERE EmpresaId='1' AND EmpleadoID='0000001' AND Cobrar=1");
  console.log(r3.recordset);
  process.exit(0);
}
run();
