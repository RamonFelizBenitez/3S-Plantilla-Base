const { connectDB } = require('./src/config/db');

async function testQuery() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
        SELECT 
          'Designación' as TipoAccion,
          D.DesignacionID as Numero,
          D.FechaNombramiento as FechaEfectivo,
          D.Sueldo,
          C.Descripcion as CargoAsignado,
          DEP.Descripcion as DependenciaAsignada,
          D.FechaNombramiento as OrdenFecha
        FROM RHDESIGNACION D
        LEFT JOIN NMCARGOS C ON D.CargoID = C.CargoID AND CAST(D.EmpresaID AS VARCHAR) = CAST(C.EmpresaID AS VARCHAR)
        LEFT JOIN NMDEPENDENCIAS DEP ON D.DependenciaID = DEP.DependenciaID AND CAST(D.EmpresaID AS VARCHAR) = CAST(DEP.EmpresaID AS VARCHAR)
        WHERE CAST(D.EmpresaID AS VARCHAR) = '1' 
          AND CAST(D.EmpleadoID AS VARCHAR) = '1'
          
        UNION ALL
        
        SELECT 
          ISNULL('Cambio - ' + TA.Descripcion, 'Cambio') as TipoAccion,
          CH.CambiosID as Numero,
          CH.FechaNombramiento as FechaEfectivo,
          CH.Sueldo,
          C.Descripcion as CargoAsignado,
          DEP.Descripcion as DependenciaAsignada,
          CH.FechaRegistro as OrdenFecha
        FROM RHCAMBIOS CH
        LEFT JOIN NMCARGOS C ON CH.CargoID = C.CargoID AND CAST(CH.EmpresaID AS VARCHAR) = CAST(C.EmpresaID AS VARCHAR)
        LEFT JOIN NMDEPENDENCIAS DEP ON CH.DependenciaID = DEP.DependenciaID AND CAST(CH.EmpresaID AS VARCHAR) = CAST(DEP.EmpresaID AS VARCHAR)
        LEFT JOIN RHTIPOACCION TA ON CH.TipoAccionID = TA.TipoAccionID
        WHERE CAST(CH.EmpresaID AS VARCHAR) = '1' 
          AND CAST(CH.EmpleadoID AS VARCHAR) = '1'
          AND CH.Procesado = 1
          
        ORDER BY OrdenFecha DESC
    `);
    console.log("Success");
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
testQuery();
