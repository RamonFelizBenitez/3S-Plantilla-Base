const { sql, connectDB } = require('../../config/db');

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
          e.CargoId,
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
          DEP.Descripcion as DependenciaAsignada,
          D.FechaNombramiento as OrdenFecha
        FROM RHDESIGNACION D
        LEFT JOIN NMCARGOS C ON D.CargoID = C.CargoID AND CAST(D.EmpresaID AS VARCHAR) = CAST(C.EmpresaID AS VARCHAR)
        LEFT JOIN NMDEPENDENCIAS DEP ON D.DependenciaID = DEP.DependenciaID AND CAST(D.EmpresaID AS VARCHAR) = CAST(DEP.EmpresaID AS VARCHAR)
        WHERE CAST(D.EmpresaID AS VARCHAR) = CAST(@empresaId AS VARCHAR) 
          AND CAST(D.EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
          
        UNION ALL
        
        SELECT 
          'Cambio' as TipoAccion,
          CH.CambiosID as Numero,
          CH.FechaNombramiento as FechaEfectivo,
          CH.Sueldo,
          C.Descripcion as CargoAsignado,
          DEP.Descripcion as DependenciaAsignada,
          CH.FechaRegistro as OrdenFecha
        FROM RHCAMBIOS CH
        LEFT JOIN NMCARGOS C ON CH.CargoID = C.CargoID AND CAST(CH.EmpresaID AS VARCHAR) = CAST(C.EmpresaID AS VARCHAR)
        LEFT JOIN NMDEPENDENCIAS DEP ON CH.DependenciaID = DEP.DependenciaID AND CAST(CH.EmpresaID AS VARCHAR) = CAST(DEP.EmpresaID AS VARCHAR)
        WHERE CAST(CH.EmpresaID AS VARCHAR) = CAST(@empresaId AS VARCHAR) 
          AND CAST(CH.EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
          AND CH.Procesado = 1
          
        UNION ALL
        
        SELECT 
          'Separación' as TipoAccion,
          S.SeparacionID as Numero,
          S.FechaSalida as FechaEfectivo,
          ISNULL((SELECT TOP 1 Valor FROM RHpercep P WHERE P.EmpleadoID = S.EmpleadoID AND CAST(P.EmpresaID AS VARCHAR) = CAST(S.EmpresaID AS VARCHAR) ORDER BY FechaInicio DESC), 0) as Sueldo,
          TA.Descripcion as CargoAsignado,
          DEP.Descripcion as DependenciaAsignada,
          S.FechaSalida as OrdenFecha
        FROM RHSEPARACIONSERVICIO S
        LEFT JOIN RHTIPOACCIONES TA ON S.TipoAccionID = TA.TipoAccionID AND CAST(S.EmpresaID AS VARCHAR) = CAST(TA.EmpresaID AS VARCHAR)
        LEFT JOIN NMEMPLEADOS E ON S.EmpleadoID = E.EmpleadoID AND CAST(S.EmpresaID AS VARCHAR) = CAST(E.EmpresaID AS VARCHAR)
        LEFT JOIN NMDEPENDENCIAS DEP ON E.DependenciaID = DEP.DependenciaID AND CAST(E.EmpresaId AS VARCHAR) = CAST(DEP.EmpresaID AS VARCHAR)
        WHERE CAST(S.EmpresaID AS VARCHAR) = CAST(@empresaId AS VARCHAR) 
          AND CAST(S.EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
          AND S.Procesado = 1
          
        ORDER BY OrdenFecha DESC
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
    const { Nomina, ISR, AFP, ARS, EnCarrera, Estatus, TipoNominaID, DireccionID, DependenciaID, FormaPago, FechaIngreso } = req.body;

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
      .input('fechaIngreso', sql.DateTime, FechaIngreso ? new Date(FechaIngreso) : null)
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
          FechaIngreso = COALESCE(@fechaIngreso, FechaIngreso),
          FechaModificado = GETDATE()
        WHERE EmpresaID = @empresaId AND EmpleadoID = @empleadoId
      `);
      
    res.json({ message: 'Datos actualizados correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPagosEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId, periodo } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const periodoFiltro = periodo ? parseInt(periodo) : new Date().getFullYear();

    const pool = await connectDB();
    const result = await pool.request()
      .input('Empresa', sql.VarChar, empresaId)
      .input('Empleado', sql.VarChar, id)
      .input('Periodo', sql.Int, periodoFiltro)
      .query(`
        SELECT 
            a.NominaNumero as Secuencia,
            a.CodigoPeriodo,
            a.EmpleadoID,
            a.EmpresaID,
            c.TipoNominaID,
            SUM(CASE WHEN b.Tipo = 0 THEN a.Monto ELSE 0 END) as Ingreso,
            SUM(CASE WHEN b.Tipo = 1 THEN a.Monto ELSE 0 END) as Egreso,
            SUM(CASE WHEN b.Tipo = 1 THEN a.Monto * -1 WHEN b.Tipo = 0 THEN a.Monto ELSE 0 END) as Neto,
            c.FechaInicial,
            c.FechaGeneracion,
            c.FechaFinal
        FROM NMNOMINALINEAS a
        INNER JOIN NMTIPOSTRANSACCIONES b ON a.TipoTransId = b.TipoTransId AND a.Empresaid = b.EmpresaId
        INNER JOIN NMNOMINA c ON a.CodigoPeriodo = c.CodigoPeriodo 
                             AND a.Empresaid = c.EmpresaId 
                             AND a.NominaNumero = c.NominaNumero 
                             AND a.Secuencia = c.Secuencia 
                             AND a.TipoNominaId = c.TipoNominaId
        WHERE a.EmpresaID = @Empresa 
          AND a.EmpleadoID = @Empleado
          AND a.CodigoPeriodo = @Periodo
        GROUP BY 
            a.EmpleadoID, a.NominaNumero, a.CodigoPeriodo, a.EmpresaID, c.TipoNominaID, 
            c.FechaInicial, c.FechaGeneracion, c.FechaFinal
        ORDER BY a.NominaNumero DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPagosEmpleadoDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId, codigoPeriodo, nominaNumero, secuencia, tipoNominaId } = req.query;
    
    if (!empresaId || !codigoPeriodo || !nominaNumero || !secuencia || !tipoNominaId) {
      return res.status(400).json({ message: 'Parámetros incompletos para consultar detalle de pago' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('Empresa', sql.VarChar, empresaId)
      .input('Empleado', sql.VarChar, id)
      .input('CodigoPeriodo', sql.Int, parseInt(codigoPeriodo))
      .input('NominaNumero', sql.Int, parseInt(nominaNumero))
      .input('Secuencia', sql.Int, parseInt(secuencia))
      .input('TipoNominaID', sql.VarChar, tipoNominaId)
      .query(`
        SELECT 
            c.FechaInicial,
            c.FechaFinal,
            a.EmpleadoID,
            b.Descripcion as NombreTransaccion,
            CASE WHEN b.Tipo = 0 THEN '+' ELSE '-' END as Efecto,
            CASE WHEN b.Tipo = 0 THEN a.Monto ELSE 0 END as Ingreso,
            CASE WHEN b.Tipo = 1 THEN a.Monto ELSE 0 END as Deduccion
        FROM NMNOMINALINEAS a
        INNER JOIN NMTIPOSTRANSACCIONES b ON a.TipoTransId = b.TipoTransId AND a.Empresaid = b.EmpresaId
        INNER JOIN NMNOMINA c ON a.CodigoPeriodo = c.CodigoPeriodo 
                             AND a.Empresaid = c.EmpresaId 
                             AND a.NominaNumero = c.NominaNumero 
                             AND a.Secuencia = c.Secuencia 
                             AND a.TipoNominaId = c.TipoNominaId
        WHERE a.EmpresaID = @Empresa 
          AND a.EmpleadoID = @Empleado
          AND a.CodigoPeriodo = @CodigoPeriodo
          AND a.NominaNumero = @NominaNumero
          AND a.Secuencia = @Secuencia
          AND a.TipoNominaId = @TipoNominaID
        ORDER BY b.Tipo ASC, a.LineaNumero ASC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
