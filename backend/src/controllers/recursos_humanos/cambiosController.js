const { sql, connectDB } = require('../../config/db');

exports.getCambios = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        SELECT C.*, 
               E.Nombres,
               E.Apellido1,
               T.Descripcion as TipoAccionDesc,
               CA.Descripcion as CargoDesc,
               DIR.Descripcion as DireccionDesc,
               DEP.Descripcion as DependenciaDesc,
               CA_ACT.Descripcion as CargoActDesc,
               DIR_ACT.Descripcion as DireccionActDesc,
               DEP_ACT.Descripcion as DependenciaActDesc
        FROM RHCAMBIOS C
        LEFT JOIN NMEMPLEADOS E ON C.EmpleadoID = E.EmpleadoID AND C.EmpresaID = E.EmpresaId
        LEFT JOIN RHTIPOACCIONES T ON C.TipoAccionID = T.TipoAccionID AND C.EmpresaID = T.EmpresaID
        LEFT JOIN NMCARGOS CA ON C.CargoID = CA.CargoID AND C.EmpresaID = CA.EmpresaID
        LEFT JOIN NMDIRECCIONES DIR ON C.DireccionID = DIR.DireccionID AND C.EmpresaID = DIR.EmpresaID
        LEFT JOIN NMDEPENDENCIAS DEP ON C.DependenciaID = DEP.DependenciaID AND C.EmpresaID = DEP.EmpresaID
        LEFT JOIN NMCARGOS CA_ACT ON C.CargoIDAct = CA_ACT.CargoID AND C.EmpresaID = CA_ACT.EmpresaID
        LEFT JOIN NMDIRECCIONES DIR_ACT ON C.DireccionIDAct = DIR_ACT.DireccionID AND C.EmpresaID = DIR_ACT.EmpresaID
        LEFT JOIN NMDEPENDENCIAS DEP_ACT ON C.DependenciaIDAct = DEP_ACT.DependenciaID AND C.EmpresaID = DEP_ACT.EmpresaID
        WHERE C.EmpresaID = @empresaId 
        ORDER BY C.CambiosID DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCambio = async (req, res) => {
  try {
    const body = req.body;
    const pool = await connectDB();
    
    // Generar CambiosID
    const idResult = await pool.request()
      .input('EmpresaID', sql.VarChar, body.EmpresaId || '1')
      .query('SELECT ISNULL(MAX(CambiosID), 0) + 1 AS SiguienteID FROM RHCAMBIOS WHERE EmpresaID = @EmpresaID');
    const nuevoCambiosID = idResult.recordset[0].SiguienteID;

    const request = pool.request();
    request.input('CambiosID', sql.Int, nuevoCambiosID);
    request.input('EmpresaID', sql.VarChar, body.EmpresaId || '1');
    request.input('EmpleadoID', sql.VarChar, body.EmpleadoID);
    request.input('TipoAccionID', sql.Int, body.TipoAccionID);
    
    // Datos actuales
    request.input('SueldoAct', sql.Float, body.SueldoAct || 0);
    request.input('CargoIDAct', sql.VarChar, body.CargoIDAct || '');
    request.input('DireccionIDAct', sql.VarChar, body.DireccionIDAct || '');
    request.input('DependenciaIDAct', sql.VarChar, body.DependenciaIDAct || '');
    
    // Datos nuevos
    request.input('Sueldo', sql.Decimal(10,2), body.Sueldo || body.SueldoAct || 0);
    request.input('CargoID', sql.VarChar, body.CargoID || body.CargoIDAct || '');
    request.input('DireccionID', sql.VarChar, body.DireccionID || body.DireccionIDAct || '');
    request.input('DependenciaID', sql.VarChar, body.DependenciaID || body.DependenciaIDAct || '');
    
    request.input('Observacion', sql.VarChar, body.Observacion || '');
    request.input('Procesado', sql.Bit, 0);
    request.input('Aprobado', sql.Bit, 0);
    request.input('Anulado', sql.Bit, 0);
    
    request.input('NumeroNombramiento', sql.Int, body.NumeroNombramiento || 0);
    request.input('FechaRegistro', sql.DateTime, body.FechaRegistro || new Date());
    request.input('FechaNombramiento', sql.DateTime, body.FechaNombramiento || new Date());
    
    request.input('CreadoPor', sql.VarChar, body.CreadoPor || 'SYSTEM');
    request.input('ModificadoPor', sql.VarChar, body.CreadoPor || 'SYSTEM');
    request.input('FechaCreado', sql.DateTime, new Date());
    request.input('FechaModificado', sql.DateTime, new Date());

    await request.query(`
      INSERT INTO RHCAMBIOS (
        CambiosID, EmpresaID, EmpleadoID, TipoAccionID,
        SueldoAct, CargoIDAct, DireccionIDAct, DependenciaIDAct,
        Sueldo, CargoID, DireccionID, DependenciaID,
        Observacion, Procesado, Aprobado, Anulado,
        NumeroNombramiento, FechaRegistro, FechaNombramiento,
        CreadoPor, ModificadoPor, FechaCreado, FechaModificado
      ) VALUES (
        @CambiosID, @EmpresaID, @EmpleadoID, @TipoAccionID,
        @SueldoAct, @CargoIDAct, @DireccionIDAct, @DependenciaIDAct,
        @Sueldo, @CargoID, @DireccionID, @DependenciaID,
        @Observacion, @Procesado, @Aprobado, @Anulado,
        @NumeroNombramiento, @FechaRegistro, @FechaNombramiento,
        @CreadoPor, @ModificadoPor, @FechaCreado, @FechaModificado
      )
    `);
      
    res.status(201).json({ message: 'Cambio registrado exitosamente', CambiosID: nuevoCambiosID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    const pool = await connectDB();
    const request = pool.request();
    
    request.input('CambiosID', sql.Int, id);
    request.input('EmpresaID', sql.VarChar, body.EmpresaId || '1');
    request.input('TipoAccionID', sql.Int, body.TipoAccionID);
    
    // Datos nuevos (solo estos deben ser modificables normalmente)
    request.input('Sueldo', sql.Decimal(10,2), body.Sueldo || 0);
    request.input('CargoID', sql.VarChar, body.CargoID || '');
    request.input('DireccionID', sql.VarChar, body.DireccionID || '');
    request.input('DependenciaID', sql.VarChar, body.DependenciaID || '');
    
    request.input('Observacion', sql.VarChar, body.Observacion || '');
    request.input('NumeroNombramiento', sql.Int, body.NumeroNombramiento || 0);
    request.input('FechaNombramiento', sql.DateTime, body.FechaNombramiento || new Date());
    request.input('ModificadoPor', sql.VarChar, body.ModificadoPor || 'SYSTEM');

    const result = await request.query(`
      UPDATE RHCAMBIOS 
      SET 
        TipoAccionID = @TipoAccionID,
        CargoID = @CargoID,
        DireccionID = @DireccionID,
        DependenciaID = @DependenciaID,
        Sueldo = @Sueldo,
        Observacion = @Observacion,
        NumeroNombramiento = @NumeroNombramiento,
        FechaNombramiento = @FechaNombramiento,
        ModificadoPor = @ModificadoPor,
        FechaModificado = GETDATE()
      WHERE CambiosID = @CambiosID AND EmpresaID = @EmpresaID AND Procesado = 0
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro no encontrado o ya fue procesado' });
    }

    res.json({ message: 'Cambio actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    
    const pool = await connectDB();
    const result = await pool.request()
      .input('CambiosID', sql.Int, id)
      .input('EmpresaId', sql.VarChar, empresaId)
      .query('DELETE FROM RHCAMBIOS WHERE CambiosID = @CambiosID AND EmpresaId = @EmpresaId AND Procesado = 0');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro no encontrado o ya procesado' });
    }
      
    res.json({ message: 'Eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.aprobarCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    await pool.request()
      .input('CambiosID', sql.Int, id)
      .query(`
        UPDATE RHCAMBIOS 
        SET Aprobado = 1, FechaRegistro = GETDATE()
        WHERE CambiosID = @CambiosID AND Procesado = 0
      `);
      
    res.json({ message: 'Cambio aprobado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.desaprobarCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    await pool.request()
      .input('CambiosID', sql.Int, id)
      .query(`
        UPDATE RHCAMBIOS 
        SET Aprobado = 0 
        WHERE CambiosID = @CambiosID AND Procesado = 0
      `);
      
    res.json({ message: 'Cambio desaprobado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.procesarCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const { EmpresaID, CreadoPor, FechaAplicacion, NumeroNombramiento } = req.body;
    
    if (!FechaAplicacion || !NumeroNombramiento) {
      return res.status(400).json({ message: 'Fecha de Aplicación y Número de Nombramiento son requeridos' });
    }
    
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();
    
    try {
      // 1. Obtener el registro de cambio
      const reqCambio = new sql.Request(transaction);
      const resCambio = await reqCambio
        .input('CambiosID', sql.Int, id)
        .input('EmpresaID', sql.VarChar, EmpresaID || '1')
        .query(`SELECT * FROM RHCAMBIOS WHERE CambiosID = @CambiosID AND EmpresaID = @EmpresaID`);
        
      if (resCambio.recordset.length === 0) throw new Error('Cambio no encontrado');
      
      const cambio = resCambio.recordset[0];
      
      if (cambio.Procesado) throw new Error('El cambio ya fue procesado');
      if (!cambio.Aprobado) throw new Error('El cambio debe ser aprobado antes de procesar');

      // 2. Actualizar NMEMPLEADOS con los nuevos datos
      let empSetClauses = [];
      const reqEmp = new sql.Request(transaction);
      
      reqEmp.input('EmpleadoID', sql.VarChar, cambio.EmpleadoID);
      reqEmp.input('EmpresaId', sql.Int, parseInt(cambio.EmpresaID));
      
      if (cambio.CargoID && cambio.CargoID.trim() !== '') {
        reqEmp.input('CargoId', sql.VarChar, cambio.CargoID);
        empSetClauses.push('CargoId = @CargoId');
      }
      if (cambio.DireccionID && cambio.DireccionID.trim() !== '') {
        reqEmp.input('DireccionID', sql.VarChar, cambio.DireccionID);
        empSetClauses.push('DireccionID = @DireccionID');
      }
      if (cambio.DependenciaID && cambio.DependenciaID.trim() !== '') {
        reqEmp.input('DependenciaID', sql.VarChar, cambio.DependenciaID);
        empSetClauses.push('DependenciaID = @DependenciaID');
      }
      
      if (empSetClauses.length > 0) {
        empSetClauses.push('FechaModificado = GETDATE()');
        await reqEmp.query(`
          UPDATE NMEMPLEADOS 
          SET ${empSetClauses.join(', ')}
          WHERE EmpleadoID = @EmpleadoID AND EmpresaId = @EmpresaId
        `);
      }
        
      // 3. Actualizar Salario en RHpercep
      if (cambio.Sueldo && Number(cambio.Sueldo) > 0) {
        const percReq = new sql.Request(transaction);
        
        // Cerrar sueldo activo actual
        await percReq
          .input('EmpleadoID', sql.VarChar, cambio.EmpleadoID)
          .input('EmpresaID', sql.Int, parseInt(cambio.EmpresaID))
          .input('FechaAplicacion', sql.DateTime, FechaAplicacion)
          .query(`
            UPDATE RHpercep 
            SET SueldoActivo = 0, FechaFin = @FechaAplicacion 
            WHERE EmpleadoID = @EmpleadoID AND EmpresaID = @EmpresaID AND SueldoActivo = 1
          `);
          
        // Insertar nuevo sueldo
        await percReq
          .input('EmpleadoID_Ins', sql.VarChar, cambio.EmpleadoID)
          .input('EmpresaID_Ins', sql.Int, parseInt(cambio.EmpresaID))
          .input('FechaInicio', sql.DateTime, FechaAplicacion)
          .input('FechaFin', sql.DateTime, '1999-01-01')
          .input('Valor', sql.Decimal(12,2), cambio.Sueldo)
          .input('NombreDevengo', sql.VarChar, 'SALARIO BASE')
          .input('CreadoPor', sql.Int, CreadoPor ? parseInt(CreadoPor) : 1)
          .query(`
            INSERT INTO RHpercep (
              EmpresaID, EmpleadoID, FechaInicio, FechaFin, SueldoActivo, Valor, NombreDevengo, CreadoPor
            ) VALUES (
              @EmpresaID_Ins, @EmpleadoID_Ins, @FechaInicio, @FechaFin, 1, @Valor, @NombreDevengo, @CreadoPor
            )
          `);
      }

      // 4. Marcar RHCAMBIOS como procesado
      const updReq = new sql.Request(transaction);
      await updReq
        .input('CambiosID', sql.Int, id)
        .input('EmpresaID', sql.VarChar, EmpresaID || '1')
        .input('FechaAplicacion', sql.DateTime, FechaAplicacion)
        .input('NumeroNombramiento', sql.Int, NumeroNombramiento)
        .query(`
          UPDATE RHCAMBIOS 
          SET Procesado = 1, ModificadoPor = 'SYSTEM', FechaModificado = GETDATE(),
              FechaNombramiento = @FechaAplicacion, NumeroNombramiento = @NumeroNombramiento
          WHERE CambiosID = @CambiosID AND EmpresaID = @EmpresaID
        `);
        
      await transaction.commit();
      res.json({ message: 'Cambio procesado y aplicado exitosamente' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCambioForPrint = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('CambiosID', sql.Int, id)
      .query(`
        SELECT 
          d.CambiosID as AccionNumero,
          d.FechaRegistro as Fecha,
          d.FechaNombramiento as Efectividad,
          d.Sueldo,
          d.Observacion as Motivo,
          d.TipoAccionID as TipoAcionID,
          NULL as TurnoID,
          
          -- Empleado Info
          e.Nombres as Nombres,
          RTRIM(LTRIM(ISNULL(e.Apellido1, '') + ' ' + ISNULL(e.Apellido2, ''))) as Apellidos,
          e.Cedula,
          e.EmpleadoID as Codigo,
          e.EstadoCivil,
          e.FechaNacimiento,
          'DOMINICANA' as Nacionalidad,
          e.Sexo,
          e.Direccion,
          e.Telefono1 as Telefono,
          e.Celular,
          e.FechaIngreso,
          
          -- Catalogs (If new is null, fallback to old or employee current)
          ISNULL(dep.Descripcion, ISNULL(depAct.Descripcion, eDep.Descripcion)) as AreaFuncional,
          ISNULL(c.Descripcion, ISNULL(cAct.Descripcion, eC.Descripcion)) as Cargo
        FROM RHCAMBIOS d
        LEFT JOIN NMEMPLEADOS e ON d.EmpleadoID = e.EmpleadoID AND d.EmpresaID = CAST(e.EmpresaId AS VARCHAR)
        
        -- New Roles
        LEFT JOIN NMDEPENDENCIAS dep ON d.DependenciaID = dep.DependenciaID AND d.EmpresaID = CAST(dep.EmpresaId AS VARCHAR)
        LEFT JOIN NMCARGOS c ON d.CargoID = c.CargoID AND d.EmpresaID = CAST(c.EmpresaId AS VARCHAR)
        
        -- Old Roles
        LEFT JOIN NMDEPENDENCIAS depAct ON d.DependenciaIDAct = depAct.DependenciaID AND d.EmpresaID = CAST(depAct.EmpresaId AS VARCHAR)
        LEFT JOIN NMCARGOS cAct ON d.CargoIDAct = cAct.CargoID AND d.EmpresaID = CAST(cAct.EmpresaId AS VARCHAR)
        
        -- Current Employee Roles fallback
        LEFT JOIN NMDEPENDENCIAS eDep ON e.DependenciaID = eDep.DependenciaID AND e.EmpresaID = eDep.EmpresaId
        LEFT JOIN NMCARGOS eC ON e.CargoId = eC.CargoID AND e.EmpresaID = eC.EmpresaId

        WHERE d.CambiosID = @CambiosID
      `);
      
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cambio no encontrado para imprimir' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
