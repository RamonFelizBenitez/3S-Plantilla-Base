const { connectDB, sql } = require('../../config/db');

exports.procesarDescuentosExcel = async (req, res) => {
  try {
    const { empresaId, tipoIdentificador, tipoNominaId, tipoTransId, fechaAplicacion, filasExcel } = req.body;

    if (!empresaId || !tipoIdentificador || !tipoNominaId || !tipoTransId || !fechaAplicacion || !filasExcel || filasExcel.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos para procesar los descuentos.' });
    }

    const pool = await connectDB();

    // 1. Obtener empleados activos en nómina
    const empleadosResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .query(`
        SELECT EmpleadoID, Cedula 
        FROM NMEMPLEADOS 
        WHERE EmpresaID = @EmpresaID AND Estatus = 0 AND Nomina = 1
      `);
    const empleadosValidos = empleadosResult.recordset;

    // 2. Obtener empleados en NMEMPLEADOSNOM para el tipo de nómina seleccionado
    const empleadosNomResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .input('TipoNominaID', sql.VarChar, tipoNominaId)
      .query(`
        SELECT EmpleadoID 
        FROM NMEMPLEADOSNOM 
        WHERE Empresaid = @EmpresaID AND TipoNominaId = @TipoNominaID
      `);
    const empleadosNomValidos = new Set(empleadosNomResult.recordset.map(e => e.EmpleadoID));

    // 4. Validar filas del Excel
    const errores = [];
    const datosValidados = [];

    // Map para rápido acceso a empleados
    const mapEmpleados = {};
    if (tipoIdentificador === 'Codigo') {
      empleadosValidos.forEach(e => { mapEmpleados[e.EmpleadoID] = e.EmpleadoID; });
    } else {
      empleadosValidos.forEach(e => { 
        const cedClean = e.Cedula ? e.Cedula.replace(/-/g, '') : '';
        mapEmpleados[cedClean] = e.EmpleadoID; 
        mapEmpleados[e.Cedula] = e.EmpleadoID; 
      });
    }

    for (let i = 0; i < filasExcel.length; i++) {
      const fila = filasExcel[i];
      let identificador = fila['Cedula / Codigo']?.toString().trim();
      const montoRaw = fila['Monto'];

      // Limpiar guiones si es cédula
      if (tipoIdentificador === 'Cedula' && identificador) {
        identificador = identificador.replace(/-/g, '');
      }

      const empleadoID = mapEmpleados[identificador];
      
      if (!empleadoID) {
        errores.push(`Fila ${i + 2}: El empleado con ${tipoIdentificador} '${identificador}' no existe, está inactivo o no tiene la marca de Nómina activa.`);
        continue;
      }

      if (!empleadosNomValidos.has(empleadoID)) {
        errores.push(`Fila ${i + 2}: El empleado '${empleadoID}' no pertenece al Tipo de Nómina '${tipoNominaId}' en NMEMPLEADOSNOM.`);
        continue;
      }

      const monto = parseFloat(montoRaw);
      if (isNaN(monto) || monto < 0) {
        errores.push(`Fila ${i + 2}: Monto inválido '${montoRaw}'. Debe ser numérico y positivo.`);
        continue;
      }

      datosValidados.push({ EmpleadoID: empleadoID, Monto: monto });
    }

    if (errores.length > 0) {
      return res.status(400).json({ message: 'Errores de validación en el archivo Excel', errores });
    }

    // 5. INICIO DE TRANSACCIÓN PARA BORRADO E INSERCIÓN
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);

      // El requerimiento dice: "si el tipo de transaccion existe para el empleado la misma debe ser borrada sin importar la fecha antes de su insert"
      for (const fila of datosValidados) {
        const reqDel = new sql.Request(transaction);
        await reqDel
          .input('EmpresaID_Del', sql.VarChar, empresaId)
          .input('EmpleadoID_Del', sql.VarChar, fila.EmpleadoID)
          .input('TipoTransId_Del', sql.VarChar, tipoTransId)
          .query(`
            DELETE FROM NMTRANSACCIONES 
            WHERE EmpresaId = @EmpresaID_Del 
              AND EmpleadoID = @EmpleadoID_Del 
              AND TipoTransId = @TipoTransId_Del
          `);
      }

      // Insertar las nuevas transacciones
      let insertados = 0;
      for (const fila of datosValidados) {
        const reqFila = new sql.Request(transaction);
        
        await reqFila
          .input('EmpresaId', sql.VarChar, empresaId)
          .input('EmpleadoID', sql.VarChar, fila.EmpleadoID)
          .input('TipoNominaID', sql.VarChar, tipoNominaId)
          .input('TipoTransId', sql.VarChar, tipoTransId)
          .input('Fecha', sql.DateTime, new Date(fechaAplicacion))
          .input('Monto', sql.Decimal(18,4), fila.Monto)
          .input('TipoNovedad', sql.Int, 1) // 1 = Ocasional
          .input('Intervalo', sql.Int, 0)
          .query(`
            INSERT INTO NMTRANSACCIONES
            (EmpresaId, EmpleadoID, TipoTransId, Fecha, TipoNovedad, Intervalo, Monto, Abono, TipoNominaID)
            VALUES
            (@EmpresaId, @EmpleadoID, @TipoTransId, @Fecha, @TipoNovedad, @Intervalo, @Monto, @Monto, @TipoNominaID)
          `);
        insertados++;
      }

      await transaction.commit();
      res.json({ message: 'Descuentos externos procesados exitosamente.', totalLineas: insertados });

    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

  } catch (error) {
    console.error('Error al procesar descuentos Excel:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar el Excel.', details: error.message });
  }
};
