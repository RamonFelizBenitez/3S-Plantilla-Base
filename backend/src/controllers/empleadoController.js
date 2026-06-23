const { sql, connectDB } = require('../config/db');

exports.getEmpleados = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        SELECT 
          CAST(e.EmpleadoID AS VARCHAR) as EmpleadoID, 
          e.Nombres, 
          e.Apellido1, 
          e.Apellido2,
          e.Cedula, 
          e.EstadoCivil, 
          e.Sexo, 
          e.Telefono1, 
          e.Celular, 
          e.Email,
          e.FechaIngreso,
          e.FechaSalida,
          e.Estatus,
          e.Nomina,
          e.CuentaBanco,
          e.FormaPago,
          e.DireccionID,
          e.DependenciaID,
          e.TipoNominaID,
          e.ISR,
          e.AFP,
          e.ARS,
          e.EnCarrera,
          c.Descripcion as CargoDesc,
          dir.Descripcion as DireccionDesc,
          dep.Descripcion as DependenciaDesc,
          t.Descripcion as TurnoDesc,
          tn.Descripcion as TipoNominaDesc
        FROM NMEMPLEADOS e
        LEFT JOIN NMCargos c ON CAST(e.CargoId AS VARCHAR) = CAST(c.CargoID AS VARCHAR) AND CAST(e.EmpresaId AS VARCHAR) = CAST(c.EmpresaID AS VARCHAR)
        LEFT JOIN NMDirecciones dir ON CAST(e.DireccionID AS VARCHAR) = CAST(dir.DireccionID AS VARCHAR) AND CAST(e.EmpresaId AS VARCHAR) = CAST(dir.EmpresaID AS VARCHAR)
        LEFT JOIN NMDependencias dep ON CAST(e.DependenciaID AS VARCHAR) = CAST(dep.DependenciaID AS VARCHAR) AND CAST(e.EmpresaId AS VARCHAR) = CAST(dep.EmpresaID AS VARCHAR)
        LEFT JOIN RHTURNOS t ON CAST(e.TurnoId AS VARCHAR) = CAST(t.TurnoID AS VARCHAR) AND CAST(e.EmpresaId AS VARCHAR) = CAST(t.EmpresaID AS VARCHAR)
        LEFT JOIN NMTIPOSNOMINAS tn ON CAST(e.TipoNominaID AS VARCHAR) = CAST(tn.TipoNominaID AS VARCHAR) AND CAST(e.EmpresaId AS VARCHAR) = CAST(tn.EmpresaID AS VARCHAR)
        WHERE CAST(e.EmpresaId AS VARCHAR) = CAST(@empresaId AS VARCHAR)
        ORDER BY e.EmpleadoID DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    require('fs').writeFileSync('error_log.txt', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getSalarioMensual = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.Int, empresaId)
      .input('empleadoId', sql.VarChar, id)
      .query(`
        SELECT 
          DevengoID,
          FechaInicio,
          FechaFin,
          SueldoActivo,
          Valor,
          NombreDevengo
        FROM RHpercep
        WHERE EmpresaID = @empresaId AND EmpleadoID = @empleadoId
        ORDER BY FechaInicio DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAcciones = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, id)
      .query(`
        SELECT 
          'Designación' as TipoAccion,
          D.DesignacionID as Numero,
          D.FechaNombramiento as FechaEfectivo,
          D.Sueldo,
          C.Descripcion as CargoAsignado,
          DEP.Descripcion as DependenciaAsignada
        FROM RHDESIGNACION D
        LEFT JOIN NMCARGOS C ON D.CargoID = C.CargoID AND D.EmpresaID = C.EmpresaID
        LEFT JOIN NMDEPENDENCIAS DEP ON D.DependenciaID = DEP.DependenciaID AND D.EmpresaID = DEP.EmpresaID
        WHERE CAST(D.EmpresaID AS VARCHAR) = CAST(@empresaId AS VARCHAR) 
          AND CAST(D.EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
        ORDER BY D.FechaNombramiento DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDatosEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    const { Nomina, ISR, AFP, ARS, EnCarrera, Estatus, TipoNominaID, DireccionID, DependenciaID, FormaPago } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('empresaId', sql.Int, empresaId)
      .input('empleadoId', sql.VarChar, id)
      .input('nomina', sql.Bit, Nomina ? 1 : 0)
      .input('isr', sql.Bit, ISR ? 1 : 0)
      .input('afp', sql.Bit, AFP ? 1 : 0)
      .input('ars', sql.Bit, ARS ? 1 : 0)
      .input('enCarrera', sql.Bit, EnCarrera ? 1 : 0)
      .input('estatus', sql.Int, Estatus)
      .input('tipoNominaId', sql.VarChar, TipoNominaID || null)
      .input('direccionId', sql.VarChar, DireccionID || null)
      .input('dependenciaId', sql.VarChar, DependenciaID || null)
      .input('formaPago', sql.Int, FormaPago)
      .query(`
        UPDATE NMEMPLEADOS
        SET 
          Nomina = @nomina,
          ISR = @isr,
          AFP = @afp,
          ARS = @ars,
          EnCarrera = @enCarrera,
          Estatus = @estatus,
          TipoNominaID = @tipoNominaId,
          DireccionID = @direccionId,
          DependenciaID = @dependenciaId,
          FormaPago = @formaPago,
          FechaModificado = GETDATE()
        WHERE EmpresaID = @empresaId AND EmpleadoID = @empleadoId
      `);
      
    res.json({ message: 'Datos actualizados correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
