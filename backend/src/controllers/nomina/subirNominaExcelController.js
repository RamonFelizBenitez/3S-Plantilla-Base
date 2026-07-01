const { connectDB, sql } = require('../../config/db');

exports.procesarNominaExcel = async (req, res) => {
  try {
    const { empresaId, tipoIdentificador, nominaAbierta, filasExcel } = req.body;

    if (!empresaId || !tipoIdentificador || !nominaAbierta || !filasExcel || filasExcel.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos para procesar la nómina.' });
    }

    const { TipoNominaId, CodigoPeriodo, NominaNumero, Secuencia } = nominaAbierta;
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

    // 2. Obtener empleados en NMEMPLEADOSNOM para esta nómina
    const empleadosNomResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .input('TipoNominaID', sql.VarChar, TipoNominaId)
      .query(`
        SELECT EmpleadoID 
        FROM NMEMPLEADOSNOM 
        WHERE Empresaid = @EmpresaID AND TipoNominaId = @TipoNominaID
      `);
    const empleadosNomValidos = new Set(empleadosNomResult.recordset.map(e => e.EmpleadoID));

    // 3. Obtener transacciones válidas
    const transaccionesResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .query(`
        SELECT TipoTransId, Tipo 
        FROM NMTIPOSTRANSACCIONES 
        WHERE EmpresaId = @EmpresaID
      `);
    const mapTransacciones = new Map();
    transaccionesResult.recordset.forEach(t => mapTransacciones.set(t.TipoTransId, t.Tipo));

    // 4. Validar filas del Excel
    const errores = [];
    const datosValidados = [];

    // Map para rápido acceso a empleados
    const mapEmpleados = {};
    if (tipoIdentificador === 'Codigo') {
      empleadosValidos.forEach(e => { mapEmpleados[e.EmpleadoID] = e.EmpleadoID; });
    } else {
      empleadosValidos.forEach(e => { 
        // Remover guiones si vienen en la cedula
        const cedClean = e.Cedula ? e.Cedula.replace(/-/g, '') : '';
        mapEmpleados[cedClean] = e.EmpleadoID; 
        mapEmpleados[e.Cedula] = e.EmpleadoID; // Guardar también con guiones por si acaso
      });
    }

    for (let i = 0; i < filasExcel.length; i++) {
      const fila = filasExcel[i];
      let identificador = fila['Cedula / Codigo']?.toString().trim();
      const transaccion = fila['Transaccion']?.toString().trim();
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
        errores.push(`Fila ${i + 2}: El empleado '${empleadoID}' no pertenece al Tipo de Nómina '${TipoNominaId}' en NMEMPLEADOSNOM.`);
        continue;
      }

      if (!mapTransacciones.has(transaccion)) {
        errores.push(`Fila ${i + 2}: La transacción '${transaccion}' no existe en NMTIPOSTRANSACCIONES.`);
        continue;
      }

      const monto = parseFloat(montoRaw);
      if (isNaN(monto) || monto < 0) {
        errores.push(`Fila ${i + 2}: Monto inválido '${montoRaw}'. Debe ser numérico.`);
        continue;
      }

      const tipoT = mapTransacciones.get(transaccion);
      datosValidados.push({ EmpleadoID: empleadoID, Transaccion: transaccion, Monto: monto, Tipo: tipoT });
    }

    if (errores.length > 0) {
      return res.status(400).json({ message: 'Errores de validación en el archivo Excel', errores });
    }

    // 5. INICIO DE TRANSACCIÓN PARA BORRADO E INSERCIÓN
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);

      // Limpiar nómina actual
      await request
        .input('TipoNominaID', sql.VarChar, TipoNominaId)
        .input('CodigoPeriodo', sql.Int, parseInt(CodigoPeriodo))
        .input('NominaNumero', sql.Int, parseInt(NominaNumero))
        .input('Secuencia', sql.Int, parseInt(Secuencia))
        .input('EmpresaID', sql.VarChar, empresaId)
        .query(`
          DELETE FROM NMNOMINALINEAS 
          WHERE EmpresaId = @EmpresaID AND TipoNominaId = @TipoNominaID AND CodigoPeriodo = @CodigoPeriodo AND NominaNumero = @NominaNumero AND Secuencia = @Secuencia;
          
          DELETE FROM NMSUELDOEMPLEADO 
          WHERE EmpresaId = @EmpresaID AND TipoNominaID = @TipoNominaID AND CodigoPeriodo = @CodigoPeriodo AND NominaNumero = @NominaNumero;
        `);

      // Diccionarios para evitar procesar el mismo salario varias veces si un empleado tiene múltiples transacciones en el Excel
      const empleadosProcesados = new Set();
      const mapSalarios = new Map();
      let contadorLineasNMNominal = 1;

      for (const fila of datosValidados) {
        const reqFila = new sql.Request(transaction);
        let salario = 0;
        
        // Solo insertamos salario una vez por empleado en NMSUELDOEMPLEADO
        if (!empleadosProcesados.has(fila.EmpleadoID)) {
          empleadosProcesados.add(fila.EmpleadoID);
          
          // Buscar salario en RHpercep
          const salarioResult = await reqFila
            .input('EmpleadoID_Percep', sql.VarChar, fila.EmpleadoID)
            .input('EmpresaID_Percep', sql.VarChar, empresaId)
            .query(`
              SELECT TOP 1 Valor 
              FROM RHpercep 
              WHERE EmpresaID = @EmpresaID_Percep AND EmpleadoID = @EmpleadoID_Percep AND SueldoActivo = 1
            `);
          
          if (salarioResult.recordset.length > 0) {
            salario = salarioResult.recordset[0].Valor || 0;
          }
          mapSalarios.set(fila.EmpleadoID, salario);

          await reqFila
            .input('EmpresaId', sql.VarChar, empresaId)
            .input('EmpleadoID', sql.VarChar, fila.EmpleadoID)
            .input('NominaNumero', sql.Int, parseInt(NominaNumero))
            .input('TipoNominaID', sql.VarChar, TipoNominaId)
            .input('CodigoPeriodo', sql.Int, parseInt(CodigoPeriodo))
            .input('Salario', sql.Decimal(18,2), salario)
            .query(`
              INSERT INTO NMSUELDOEMPLEADO 
              (EmpleadoID, EmpresaId, NominaNumero, TipoNominaID, CodigoPeriodo, Salario, CreadoPor, FechaCreado, ModificadoPor, FechaModificado)
              VALUES 
              (@EmpleadoID, @EmpresaId, @NominaNumero, @TipoNominaID, @CodigoPeriodo, @Salario, 'EXCEL', GETDATE(), 'EXCEL', GETDATE())
            `);
        } else {
           salario = mapSalarios.get(fila.EmpleadoID) || 0;
        }

        // Insertar en NMNOMINALINEAS
        await reqFila
          .input('EmpresaId_Lin', sql.VarChar, empresaId)
          .input('EmpleadoID_Lin', sql.VarChar, fila.EmpleadoID)
          .input('CodigoPeriodo_Lin', sql.Int, parseInt(CodigoPeriodo))
          .input('NominaNumero_Lin', sql.Int, parseInt(NominaNumero))
          .input('Secuencia_Lin', sql.Int, parseInt(Secuencia))
          .input('TipoNominaId_Lin', sql.VarChar, TipoNominaId)
          .input('LineaNumero_Lin', sql.Int, contadorLineasNMNominal++)
          .input('TipoTransId_Lin', sql.VarChar, fila.Transaccion)
          .input('Tipo_Lin', sql.VarChar, (fila.Tipo || '1').toString())
          .input('Monto_Lin', sql.Decimal(18,4), fila.Monto)
          .input('MonedaID', sql.VarChar, 'DOP')
          .input('TipoPago', sql.Int, nominaAbierta.TipoPago || 2)
          .input('SalarioMensual', sql.Decimal(18,2), salario)
          .input('Posteado', sql.Bit, 0)
          .input('Texto', sql.VarChar, 'CARGA EXCEL')
          .input('FechaRetencion', sql.DateTime, new Date())
          .query(`
            INSERT INTO NMNOMINALINEAS
            (Empresaid, EmpleadoID, CodigoPeriodo, NominaNumero, Secuencia, TipoNominaId, LineaNumero, TipoTransId, Monto, Tipo, MonedaID, TipoPago, SalarioMensual, Posteado, Texto, FechaRetencion, CreadoPor, FechaCreado, ModificadoPor, FechaModificado)
            VALUES
            (@EmpresaId_Lin, @EmpleadoID_Lin, @CodigoPeriodo_Lin, @NominaNumero_Lin, @Secuencia_Lin, @TipoNominaId_Lin, @LineaNumero_Lin, @TipoTransId_Lin, @Monto_Lin, @Tipo_Lin, @MonedaID, @TipoPago, @SalarioMensual, @Posteado, @Texto, @FechaRetencion, 'EXCEL', GETDATE(), 'EXCEL', GETDATE())
          `);
      }

      await transaction.commit();
      res.json({ message: 'Nómina procesada y guardada exitosamente.', totalEmpleados: empleadosProcesados.size, totalLineas: datosValidados.length });

    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

  } catch (error) {
    console.error('Error al procesar nómina Excel:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar el Excel.', details: error.message });
  }
};
