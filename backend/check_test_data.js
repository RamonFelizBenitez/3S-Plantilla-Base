const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    
    console.log('--- EMPLEADOS ---');
    const emps = await pool.request().query('SELECT EmpleadoID, Nombres, Apellido1 FROM NMEMPLEADOS');
    console.log(emps.recordset);
    
    console.log('--- SOLICITUDES ---');
    const sols = await pool.request().query('SELECT SolicitudID, Empleadoid, Nombre, Apellido1 FROM RHSolicitud');
    console.log(sols.recordset);

    console.log('--- DEPENDIENTES SOLICITANTES ---');
    const deps = await pool.request().query('SELECT DependienteSolicitanteID, SolicitudID, NombreDependiente FROM RHDependienteSolicitante');
    console.log(deps.recordset);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
