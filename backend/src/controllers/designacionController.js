const { sql, connectDB } = require('../config/db');

exports.getDesignaciones = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        SELECT D.*, 
               T.Descripcion as TipoAccionDesc,
               C.Descripcion as CargoDesc,
               DIR.Descripcion as DireccionDesc,
               DEP.Descripcion as DependenciaDesc,
               TU.Descripcion as TurnoDesc,
               TN.Descripcion as NominaDesc
        FROM RHDESIGNACION D
        LEFT JOIN RHTIPOACCIONES T ON D.TipoAcionID = T.TipoAccionID AND D.EmpresaID = T.EmpresaID
        LEFT JOIN NMCARGOS C ON D.CargoID = C.CargoID AND D.EmpresaID = C.EmpresaID
        LEFT JOIN NMDIRECCIONES DIR ON D.DireccionID = DIR.DireccionID AND D.EmpresaID = DIR.EmpresaID
        LEFT JOIN NMDEPENDENCIAS DEP ON D.DependenciaID = DEP.DependenciaID AND D.EmpresaID = DEP.EmpresaID
        LEFT JOIN RHTURNOS TU ON D.TurnoID = TU.TurnoID AND D.EmpresaID = TU.EmpresaID
        LEFT JOIN NMTIPOSNOMINAS TN ON D.TipoNominaID = TN.TipoNominaID AND D.EmpresaID = TN.EmpresaID
        WHERE D.EmpresaID = @empresaId 
        ORDER BY D.DesignacionID DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDesignacion = async (req, res) => {
  try {
    const pool = await connectDB();
    const body = req.body;
    
    const request = pool.request();
    
    // Bind parameters manually for safety
    request.input('EmpresaID', sql.VarChar, body.EmpresaId || '1');
    request.input('SolicitudID', sql.Int, body.SolicitudID || 0);
    request.input('TipoAcionID', sql.Int, body.TipoAcionID);
    request.input('CargoID', sql.VarChar, body.CargoID);
    request.input('DireccionID', sql.VarChar, body.DireccionID);
    request.input('DependenciaID', sql.VarChar, body.DependenciaID || null);
    request.input('Sueldo', sql.Decimal(10,2), body.Sueldo || 0);
    request.input('TurnoID', sql.VarChar, body.TurnoID);
    request.input('TipoNominaID', sql.VarChar, body.TipoNominaID);
    request.input('EmpleadoID', sql.VarChar, body.EmpleadoID || '');
    request.input('Observacion', sql.VarChar, body.Observacion || '');
    request.input('NumeroNombramiento', sql.Int, body.NumeroNombramiento || 0);
    request.input('FechaRegistro', sql.DateTime, body.FechaRegistro || new Date());
    request.input('FechaNombramiento', sql.DateTime, body.FechaNombramiento || new Date());
    request.input('CreadoPor', sql.VarChar, body.CreadoPor || 'SYSTEM');

    await request.query(`
      INSERT INTO RHDESIGNACION (
        EmpresaID, SolicitudID, TipoAcionID, CargoID, DireccionID, DependenciaID,
        Sueldo, TurnoID, TipoNominaID, EmpleadoID, Observacion, NumeroNombramiento,
        FechaRegistro, FechaNombramiento, CreadoPor
      ) VALUES (
        @EmpresaID, @SolicitudID, @TipoAcionID, @CargoID, @DireccionID, @DependenciaID,
        @Sueldo, @TurnoID, @TipoNominaID, @EmpleadoID, @Observacion, @NumeroNombramiento,
        @FechaRegistro, @FechaNombramiento, @CreadoPor
      )
    `);
      
    res.status(201).json({ message: 'Designación creada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDesignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    const pool = await connectDB();
    const request = pool.request();
    
    request.input('DesignacionID', sql.Int, id);
    request.input('EmpresaID', sql.VarChar, body.EmpresaId || '1');
    request.input('SolicitudID', sql.Int, body.SolicitudID || 0);
    request.input('TipoAcionID', sql.Int, body.TipoAcionID);
    request.input('CargoID', sql.VarChar, body.CargoID);
    request.input('DireccionID', sql.VarChar, body.DireccionID);
    request.input('DependenciaID', sql.VarChar, body.DependenciaID || null);
    request.input('Sueldo', sql.Decimal(10,2), body.Sueldo || 0);
    request.input('TurnoID', sql.VarChar, body.TurnoID);
    request.input('TipoNominaID', sql.VarChar, body.TipoNominaID);
    request.input('EmpleadoID', sql.VarChar, body.EmpleadoID || '');
    request.input('Observacion', sql.VarChar, body.Observacion || '');
    request.input('NumeroNombramiento', sql.Int, body.NumeroNombramiento || 0);
    request.input('FechaNombramiento', sql.DateTime, body.FechaNombramiento || new Date());
    request.input('ModificadoPor', sql.VarChar, body.ModificadoPor || 'SYSTEM');

    const result = await request.query(`
      UPDATE RHDESIGNACION 
      SET 
        SolicitudID = @SolicitudID,
        TipoAcionID = @TipoAcionID,
        CargoID = @CargoID,
        DireccionID = @DireccionID,
        DependenciaID = @DependenciaID,
        Sueldo = @Sueldo,
        TurnoID = @TurnoID,
        TipoNominaID = @TipoNominaID,
        EmpleadoID = @EmpleadoID,
        Observacion = @Observacion,
        NumeroNombramiento = @NumeroNombramiento,
        FechaNombramiento = @FechaNombramiento,
        ModificadoPor = @ModificadoPor,
        FechaModificado = GETDATE()
      WHERE DesignacionID = @DesignacionID AND EmpresaID = @EmpresaID
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json({ message: 'Actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDesignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    
    const pool = await connectDB();
    const result = await pool.request()
      .input('DesignacionID', sql.Int, id)
      .input('EmpresaId', sql.VarChar, empresaId)
      .query('DELETE FROM RHDESIGNACION WHERE DesignacionID = @DesignacionID AND EmpresaId = @EmpresaId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
      
    res.json({ message: 'Eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.aprobarDesignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    const pool = await connectDB();
    await pool.request()
      .input('DesignacionID', sql.Int, id)
      .input('UsuarioAprobado', sql.VarChar, body.UsuarioAprobado || 'SYSTEM')
      .input('FechaAprobacion', sql.DateTime, new Date())
      .query(`
        UPDATE RHDESIGNACION 
        SET Aprobado = 1, 
            UsuarioAprobado = @UsuarioAprobado,
            FechaRegistro = @FechaAprobacion
        WHERE DesignacionID = @DesignacionID
      `);
      
    res.json({ message: 'Designación aprobada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.desaprobarDesignacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await connectDB();
    await pool.request()
      .input('DesignacionID', sql.Int, id)
      .input('FechaActual', sql.DateTime, new Date())
      .query(`
        UPDATE RHDESIGNACION 
        SET Aprobado = 0, 
            UsuarioAprobado = '',
            FechaRegistro = @FechaActual
        WHERE DesignacionID = @DesignacionID
      `);
      
    res.json({ message: 'Designación desaprobada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDesignacionForPrint = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('DesignacionID', sql.Int, id)
      .query(`
        SELECT 
          d.DesignacionID as AccionNumero,
          d.FechaRegistro as Fecha,
          d.FechaNombramiento as Efectividad,
          d.Sueldo,
          d.Observacion as Motivo,
          d.TipoAcionID,
          d.TurnoID,
          
          -- Solicitud Info
          s.Nombre as Nombres,
          s.Apellido1 as Apellidos,
          s.Cedula,
          s.Empleadoid as Codigo,
          s.EstadoCivil,
          s.FechaNacimiento,
          'DOMINICANA' as Nacionalidad,
          s.Sexo,
          s.Direccion,
          s.Telefono,
          s.Celular,
          s.FechaSolicitud as FechaIngreso,
          
          -- Catalogs
          dep.Descripcion as AreaFuncional,
          c.Descripcion as Cargo,
          t.Descripcion as Horario
        FROM RHDESIGNACION d
        LEFT JOIN RHSolicitud s ON d.SolicitudID = s.SolicitudID
        LEFT JOIN NMDependencias dep ON d.DependenciaID = dep.DependenciaID
        LEFT JOIN NMCargos c ON d.CargoID = c.CargoID AND c.EmpresaID = d.EmpresaId
        LEFT JOIN RHTURNOS t ON d.TurnoID = t.TurnoID AND t.EmpresaId = d.EmpresaId
        WHERE d.DesignacionID = @DesignacionID
      `);
      
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Designación no encontrada para imprimir' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
exports.tomaPosesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaIngreso, numeroNombramiento, CreadoPor, EmpresaID } = req.body;
    
    if (!fechaIngreso) return res.status(400).json({ message: 'Fecha de ingreso es requerida' });
    
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();
    
    try {
      // 1. Obtener la designación y la solicitud
      const designacionReq = new sql.Request(transaction);
      const desigResult = await designacionReq
        .input('DesignacionID', sql.Int, id)
        .input('EmpresaID', sql.VarChar, EmpresaID || '1')
        .query(`
          SELECT 
            d.EmpresaID, d.CargoID, d.DireccionID, d.DependenciaID, 
            d.TurnoID, d.TipoNominaID, d.Sueldo, d.SolicitudID, d.Procesado,
            s.Cedula, s.Nombre, s.Nombre1, s.Nombre2, s.Apellido1, s.Apellido2,
            s.EstadoCivil, s.Sexo, s.Direccion, s.Telefono, s.Celular, s.Email,
            s.FechaNacimiento, s.PaisID, s.ProvinciaID, s.MunicipioID,
            TN.SecComprobante
          FROM RHDESIGNACION d
          LEFT JOIN RHSolicitud s ON d.SolicitudID = s.SolicitudID
          LEFT JOIN NMTIPOSNOMINAS TN ON d.TipoNominaID = TN.TipoNominaID AND d.EmpresaID = TN.EmpresaId
          WHERE d.DesignacionID = @DesignacionID AND d.EmpresaID = @EmpresaID
        `);
        
      if (desigResult.recordset.length === 0) {
        throw new Error('Designación no encontrada');
      }
      
      const row = desigResult.recordset[0];
      
      if (row.Procesado) {
        throw new Error('Esta designación ya fue procesada');
      }
      
      if (!row.SecComprobante || row.SecComprobante.trim() === '') {
        throw new Error('La secuencia de comprobante está en blanco en el Tipo de Nómina. Proceso detenido.');
      }
      
      // Obtener secuencia de SecuenciasNum
      const secReq = new sql.Request(transaction);
      const secResult = await secReq
        .input('SecID', sql.VarChar, row.SecComprobante)
        .input('EmpresaID', sql.Int, parseInt(row.EmpresaID))
        .query('SELECT SecuenciaNumID, Siguiente, Plantilla, CeroIzq FROM SecuenciasNum WHERE SecID = @SecID AND EmpresaID = @EmpresaID');
        
      if (secResult.recordset.length === 0) {
        throw new Error(`No se encontró la secuencia numérica '${row.SecComprobante}' en SecuenciasNum.`);
      }
      
      const secRow = secResult.recordset[0];
      let empleadoIDStr = secRow.Siguiente.toString();
      
      // Tratamiento según parámetros
      if (secRow.CeroIzq) {
        empleadoIDStr = empleadoIDStr.padStart(6, '0'); // Asumiendo 6 dígitos por defecto para padding
      }
      const empleadoID = secRow.Plantilla && secRow.Plantilla.trim() !== '' 
        ? `${secRow.Plantilla.trim()}${empleadoIDStr}` 
        : empleadoIDStr;
        
      // Validar que el EmpleadoID no exista ya en NMEMPLEADOS
      const checkEmpReq = new sql.Request(transaction);
      const checkResult = await checkEmpReq
        .input('EmpleadoID', sql.VarChar, empleadoID)
        .input('EmpresaId', sql.Int, parseInt(row.EmpresaID))
        .query('SELECT 1 FROM NMEMPLEADOS WHERE EmpleadoID = @EmpleadoID AND EmpresaId = @EmpresaId');
        
      if (checkResult.recordset.length > 0) {
        throw new Error(`El número de empleado generado (${empleadoID}) ya existe en el sistema. Por favor verifique la secuencia numérica.`);
      }

      // Actualizar la secuencia
      await secReq.query(`UPDATE SecuenciasNum SET Siguiente = Siguiente + 1 WHERE SecuenciaNumID = ${secRow.SecuenciaNumID}`);
      
      // 2. Insertar en NMEMPLEADOS
      const empReq = new sql.Request(transaction);
      await empReq
        .input('EmpleadoID', sql.VarChar, empleadoID)
        .input('EmpresaId', sql.Int, parseInt(row.EmpresaID))
        .input('Nombres', sql.VarChar, row.Nombre)
        .input('Nombre1', sql.VarChar, row.Nombre1)
        .input('Nombre2', sql.VarChar, row.Nombre2)
        .input('Apellido1', sql.VarChar, row.Apellido1)
        .input('Apellido2', sql.VarChar, row.Apellido2)
        .input('Cedula', sql.VarChar, row.Cedula)
        .input('EstadoCivil', sql.Int, row.EstadoCivil || 1)
        .input('Sexo', sql.Int, row.Sexo || 1)
        .input('Direccion', sql.VarChar, row.Direccion)
        .input('Telefono1', sql.VarChar, row.Telefono)
        .input('Celular', sql.VarChar, row.Celular)
        .input('Email', sql.VarChar, row.Email)
        .input('CiudadID', sql.VarChar, row.CiudadID)
        .input('FechaNacimiento', sql.DateTime, row.FechaNacimiento)
        .input('PaisID', sql.VarChar, row.PaisID)
        .input('ProvinciaID', sql.VarChar, row.ProvinciaID)
        .input('MunicipioID', sql.VarChar, row.MunicipioID)
        .input('CargoId', sql.VarChar, row.CargoID)
        .input('DireccionID', sql.VarChar, row.DireccionID)
        .input('DependenciaID', sql.VarChar, row.DependenciaID)
        .input('TurnoId', sql.Int, row.TurnoID ? parseInt(row.TurnoID) : null)
        .input('TipoNominaID', sql.VarChar, row.TipoNominaID)
        .input('FechaIngreso', sql.DateTime, fechaIngreso)
        .input('Resolucion', sql.VarChar, numeroNombramiento ? numeroNombramiento.toString() : '')
        .input('CreadoPor', sql.Int, CreadoPor ? parseInt(CreadoPor) : 1)
        .query(`
          INSERT INTO NMEMPLEADOS (
            EmpleadoID, EmpresaId, Nombres, Nombre1, Nombre2, Apellido1, Apellido2,
            Cedula, EstadoCivil, Sexo, Direccion, Telefono1, Celular, Email,
            CiudadID, FechaNacimiento, PaisID, ProvinciaID, MunicipioID,
            CargoId, DireccionID, DependenciaID, TurnoId, TipoNominaID,
            FechaIngreso, Resolucion, CreadoPor
          ) VALUES (
            @EmpleadoID, @EmpresaId, @Nombres, @Nombre1, @Nombre2, @Apellido1, @Apellido2,
            @Cedula, @EstadoCivil, @Sexo, @Direccion, @Telefono1, @Celular, @Email,
            @CiudadID, @FechaNacimiento, @PaisID, @ProvinciaID, @MunicipioID,
            @CargoId, @DireccionID, @DependenciaID, @TurnoId, @TipoNominaID,
            @FechaIngreso, @Resolucion, @CreadoPor
          )
        `);
        
      // 3. Insertar en RHpercep
      const percReq = new sql.Request(transaction);
      await percReq
        .input('EmpresaID', sql.Int, parseInt(row.EmpresaID))
        .input('EmpleadoID', sql.VarChar, empleadoID)
        .input('FechaInicio', sql.DateTime, fechaIngreso)
        .input('FechaFin', sql.DateTime, '1999-01-01')
        .input('Valor', sql.Decimal(12,2), row.Sueldo || 0)
        .input('NombreDevengo', sql.VarChar, 'SALARIO BASE')
        .input('CreadoPor', sql.Int, CreadoPor ? parseInt(CreadoPor) : 1)
        .query(`
          INSERT INTO RHpercep (
            EmpresaID, EmpleadoID, FechaInicio, FechaFin, SueldoActivo, Valor, NombreDevengo, CreadoPor
          ) VALUES (
            @EmpresaID, @EmpleadoID, @FechaInicio, @FechaFin, 1, @Valor, @NombreDevengo, @CreadoPor
          )
        `);
        
      // 4. Actualizar RHDESIGNACION a Procesado = 1 y asociar EmpleadoID
      const updReq = new sql.Request(transaction);
      await updReq
        .input('DesignacionID', sql.Int, id)
        .input('EmpresaID', sql.VarChar, EmpresaID || '1')
        .input('EmpleadoID', sql.VarChar, empleadoID)
        .input('NumeroNombramiento', sql.Int, parseInt(numeroNombramiento) || 0)
        .query(`
          UPDATE RHDESIGNACION 
          SET Procesado = 1, NumeroNombramiento = @NumeroNombramiento, EmpleadoID = @EmpleadoID
          WHERE DesignacionID = @DesignacionID AND EmpresaID = @EmpresaID
        `);
        
      // 5. Actualizar RHSolicitud con el EmpleadoID
      if (row.SolicitudID) {
        const solReq = new sql.Request(transaction);
        await solReq
          .input('SolicitudID', sql.Int, row.SolicitudID)
          .input('EmpleadoID', sql.VarChar, empleadoID)
          .query(`
            UPDATE RHSolicitud 
            SET Empleadoid = @EmpleadoID
            WHERE SolicitudID = @SolicitudID
          `);
      }

        
      await transaction.commit();
      res.json({ message: 'Toma de Posesión completada exitosamente' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

