const { sql, connectDB } = require('./src/config/db');

async function run() {
  try {
    const pool = await connectDB();
    const empresaId = 1;
    const result = await pool.request()
      .input('empresaId', sql.Int, empresaId)
      .query(`
        SELECT top 10
          e.EmpleadoID, e.EmpresaId, e.Nombres, e.Nombre1, e.Nombre2, e.Apellido1, e.Apellido2,
          e.Cedula, e.EstadoCivil, e.Sexo, e.Direccion, e.Telefono1, e.Celular, e.Email,
          e.CiudadID, e.FechaNacimiento, e.FechaIngreso,
          e.CargoId, c.Descripcion as CargoDesc,
          e.DireccionID, dir.Descripcion as DireccionDesc,
          e.DependenciaID, dep.Descripcion as DependenciaDesc,
          e.TurnoId, t.Descripcion as TurnoDesc,
          e.TipoNominaID, tn.Descripcion as TipoNominaDesc,
          e.Estatus
        FROM NMEMPLEADOS e
        LEFT JOIN NMCargos c ON e.CargoId = c.CargoID AND e.EmpresaId = c.EmpresaId
        LEFT JOIN NMDirecciones dir ON e.DireccionID = dir.DireccionID AND e.EmpresaId = dir.EmpresaId
        LEFT JOIN NMDependencias dep ON e.DependenciaID = dep.DependenciaID AND e.EmpresaId = dep.EmpresaId
        LEFT JOIN RHTURNOS t ON e.TurnoId = t.TurnoID AND e.EmpresaId = t.EmpresaId
        LEFT JOIN NMTIPOSNOMINAS tn ON e.TipoNominaID = tn.TipoNominaID AND e.EmpresaId = tn.EmpresaId
        WHERE e.EmpresaId = @empresaId
      `);
    console.log(result.recordset);
  } catch(err) {
    console.error("SQL ERROR:", err.message);
  }
  process.exit();
}
run();
