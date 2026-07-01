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
            s.CiudadID, s.FechaNacimiento, s.PaisID, s.ProvinciaID, s.MunicipioID
          FROM RHDESIGNACION d
          LEFT JOIN RHSolicitud s ON d.SolicitudID = s.SolicitudID
          WHERE d.DesignacionID = @DesignacionID AND d.EmpresaID = @EmpresaID
        `);
        
      if (desigResult.recordset.length === 0) {
        throw new Error('Designación no encontrada');
      }
      
      const row = desigResult.recordset[0];
      
      if (row.Procesado) {
        throw new Error('Esta designación ya fue procesada');
      }
      
      const empleadoID = row.Cedula || `EMP-${id}`; // Usar cédula como EmpleadoID o un genérico
      
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
        
      // 4. Actualizar RHDESIGNACION a Procesado = 1
      const updReq = new sql.Request(transaction);
      await updReq
        .input('DesignacionID', sql.Int, id)
        .input('EmpresaID', sql.VarChar, EmpresaID || '1')
        .input('NumeroNombramiento', sql.Int, parseInt(numeroNombramiento) || 0)
        .query(`
          UPDATE RHDESIGNACION 
          SET Procesado = 1, NumeroNombramiento = @NumeroNombramiento
          WHERE DesignacionID = @DesignacionID AND EmpresaID = @EmpresaID
        `);
        
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
