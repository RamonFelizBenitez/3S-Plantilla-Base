const { sql, connectDB } = require('../../config/db');

// Obtener nóminas (Abiertas o Cerradas)
const getNominas = async (req, res) => {
  try {
    const { EmpresaID, posteado } = req.query;
    
    if (!EmpresaID) {
      return res.status(400).json({ message: 'Se requiere EmpresaID' });
    }

    // Default to 'false' (0) if not provided
    const isPosteado = (posteado === 'true' || posteado === '1') ? 1 : 0;

    const pool = await connectDB();
    const result = await pool.request()
      .input('Empresaid', sql.VarChar, EmpresaID)
      .input('Posteado', sql.Bit, isPosteado)
      .query(`
        SELECT 
          Linea, CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, 
          NominaNumero, Descripcion, TipoPago, FechaInicial, FechaFinal, 
          FechaGeneracion, FechaCierre, Posteado, Voucher
        FROM NMNOMINA
        WHERE Empresaid = @Empresaid
          AND Posteado = @Posteado
        ORDER BY FechaGeneracion DESC, CodigoPeriodo DESC, Secuencia DESC
      `);
    
    res.json({ data: result.recordset });
  } catch (error) {
    console.error('Error al obtener nóminas en generarNominaController:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener nóminas' });
  }
};

// Procesar Nómina (Paso 1: Validación de Periodos)
const procesarNomina = async (req, res) => {
  try {
    const { EmpresaID, CodigoPeriodo, NominaNumero, TipoNominaId } = req.body;

    if (!EmpresaID || !CodigoPeriodo) {
      return res.status(400).json({ message: 'Se requiere EmpresaID y CodigoPeriodo' });
    }

    const pool = await connectDB();

    // 1. Validar que el período actual existe y no esté cerrado ni detenido
    const periodoActualResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID) // Asumiendo que EmpresaID en MGPERIODOS es varchar o compatible con int
      .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
      .query(`
        SELECT Estado, FecInicioPeriodo 
        FROM MGPERIODOS 
        WHERE EmpresaID = @EmpresaID AND CodigoPeriodo = @CodigoPeriodo
      `);

    if (periodoActualResult.recordset.length === 0) {
      return res.status(400).json({ message: 'El período contable seleccionado no existe en la tabla MGPERIODOS.' });
    }

    const periodoActual = periodoActualResult.recordset[0];

    // Asumimos que los estados posibles incluyen 'Cerrado', 'Detenido', 'Abierto', etc.
    if (periodoActual.Estado === 'Cerrado' || periodoActual.Estado === 'Detenido') {
      return res.status(400).json({ message: `El período contable actual (${CodigoPeriodo}) se encuentra en estado '${periodoActual.Estado}'. No se puede procesar.` });
    }

    // 2. Validar que los períodos anteriores estén cerrados
    const periodosAnterioresResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('FecInicio', sql.DateTime, periodoActual.FecInicioPeriodo)
      .query(`
        SELECT CodigoPeriodo, Estado, FecInicioPeriodo 
        FROM MGPERIODOS 
        WHERE EmpresaID = @EmpresaID 
          AND FecInicioPeriodo < @FecInicio 
          AND Estado != 'Cerrado'
      `);

    if (periodosAnterioresResult.recordset.length > 0) {
      const periodosAbiertos = periodosAnterioresResult.recordset.map(p => p.CodigoPeriodo).join(', ');
      return res.status(400).json({ 
        message: `Existen períodos contables anteriores a este que no están cerrados (Códigos: ${periodosAbiertos}). Debe cerrarlos antes de continuar.` 
      });
    }

    // ===== PASO 1.1: Limpiar Nómina si está abierta =====
    const nominaQuery = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('NominaNumero', sql.Int, NominaNumero)
      .query(`SELECT Posteado, FechaInicial, FechaFinal FROM NMNOMINA WHERE Empresaid = @EmpresaID AND NominaNumero = @NominaNumero`);
      
    if (nominaQuery.recordset.length === 0) {
      return res.status(400).json({ message: 'No se encontró la nómina en la tabla NMNOMINA.' });
    }
    
    const nominaActual = nominaQuery.recordset[0];
    if (!nominaActual.Posteado) {
      // Borrar registros para recalcular
      await pool.request()
        .input('NominaNumero', sql.Int, NominaNumero)
        .query(`DELETE FROM NMNOMINALINEAS WHERE NominaNumero = @NominaNumero`);
      
      await pool.request()
        .input('NominaNumero', sql.Int, NominaNumero)
        .query(`DELETE FROM NMSUELDOEMPLEADO WHERE NominaNumero = @NominaNumero`);
    }

    // ===== PASO 1.2: Validar Transacciones de Salario, AFP, ARS, Dependiente =====
    const transaccionesResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .query(`SELECT TipoTransId, Salario, AFP, ARS, Dependiente, ISR, EsIncentivo FROM NMTIPOSTRANSACCIONES WHERE EmpresaId = @EmpresaID`);
      
    let hasSalario = false, hasAFP = false, hasARS = false, hasDependiente = false, hasISR = false;
    let tipoTransSalario = null;
    let tipoTransAFP = null;
    let tipoTransARS = null;
    let tipoTransISR = null;
    const incentivosMap = {};

    transaccionesResult.recordset.forEach(t => {
      if (t.Salario) {
        hasSalario = true;
        tipoTransSalario = t.TipoTransId;
      }
      if (t.AFP) {
        hasAFP = true;
        tipoTransAFP = t.TipoTransId;
      }
      if (t.ARS) {
        hasARS = true;
        tipoTransARS = t.TipoTransId;
      }
      if (t.Dependiente) hasDependiente = true;
      if (t.ISR) {
        hasISR = true;
        tipoTransISR = t.TipoTransId;
      }
      if (t.EsIncentivo) {
        incentivosMap[t.TipoTransId] = true;
      }
    });

    if (!hasSalario || !hasAFP || !hasARS || !hasDependiente) {
      return res.status(400).json({ message: 'Faltan configurar transacciones base (Salario, AFP, ARS o Dependiente) en NMTIPOSTRANSACCIONES.' });
    }

    // ===== PASO 2: Leer Parámetros NMAFPARS =====
    const paramResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .query(`SELECT TOP 1 * FROM NMAFPARS WHERE EmpresaId = @EmpresaID`);
    const parametrosAFP_ARS = paramResult.recordset[0] || {};

    // ===== PASO 3: Leer Datos de NMTIPOSNOMINAS =====
    const tipoNominaResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('TipoNominaID', sql.VarChar, TipoNominaId)
      .query(`SELECT * FROM NMTIPOSNOMINAS WHERE EmpresaId = @EmpresaID AND TipoNominaID = @TipoNominaID`);
    const tipoNominaInfo = tipoNominaResult.recordset[0];

    if (!tipoNominaInfo) {
      return res.status(400).json({ message: 'No se encontró la configuración del tipo de nómina.' });
    }

    // ===== PASO 3.1: Obtener la Secuencia (quincena) actual =====
    const periodoNominaResult = await pool.request()
      .input('EmpresaID', sql.VarChar, String(EmpresaID))
      .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
      .input('SecuenciaReg', sql.Int, NominaNumero)
      .query(`SELECT TOP 1 Secuencia FROM NMPERIODOSNOMINAS WHERE EmpresaId = @EmpresaID AND CodigoPeriodo = @CodigoPeriodo AND SecuenciaReg = @SecuenciaReg`);
    const secuenciaActual = periodoNominaResult.recordset.length > 0 ? periodoNominaResult.recordset[0].Secuencia : 1;

    // ===== PASO 7: Validar Monto Dependiente =====
    const periodoDependienteConfig = parseInt(tipoNominaInfo.PeriodoDependiente) || 1;
    let aplicarDependienteValidacion = false;
    if (periodoDependienteConfig === 1) aplicarDependienteValidacion = true; // 1 = Siempre
    else if (periodoDependienteConfig === 2 && secuenciaActual === 1) aplicarDependienteValidacion = true; // 2 = 1ra Quincena
    else if (periodoDependienteConfig === 3 && secuenciaActual === 2) aplicarDependienteValidacion = true; // 3 = 2da Quincena

    if (aplicarDependienteValidacion) {
      const dependientesActivosResult = await pool.request()
        .input('EmpresaID', sql.VarChar, String(EmpresaID))
        .input('TipoNominaID', sql.VarChar, TipoNominaId)
        .query(`
          SELECT TOP 1 1 
          FROM NMDependiente d
          INNER JOIN NMEMPLEADOSNOM en ON d.EmpleadoID = en.EmpleadoID AND d.EmpresaID = en.Empresaid
          WHERE d.EmpresaID = @EmpresaID AND en.TipoNominaId = @TipoNominaID AND d.Cobrar = 1
        `);
        
      if (dependientesActivosResult.recordset.length > 0) {
        if (!tipoNominaInfo.MontoDependiente || parseFloat(tipoNominaInfo.MontoDependiente) <= 0) {
          return res.status(400).json({ 
            message: 'Error de validación: Existen empleados con dependientes activos en esta nómina, pero el tipo de nómina no tiene configurado un Monto para Dependientes.'
          });
        }
      }
    }

    // ===== PASO 4: Seleccionar Empleados =====
    // Estatus = 0 (Activo), Nomina = 1 (Paga nomina)
    const empleadosResult = await pool.request()
      .input('EmpresaID', sql.Int, EmpresaID) // Asumimos int segun esquema
      .input('TipoNominaID', sql.VarChar, TipoNominaId)
      .query(`
        SELECT e.EmpleadoID, e.FechaIngreso, e.AFP, e.ARS 
        FROM NMEMPLEADOS e
        INNER JOIN NMEMPLEADOSNOM n ON e.EmpleadoID = n.EmpleadoID 
          AND CONVERT(varchar, e.EmpresaId) = n.Empresaid
        WHERE e.EmpresaId = @EmpresaID 
          AND e.Estatus = 0 
          AND e.Nomina = 1 
          AND n.TipoNominaId = @TipoNominaID
      `);

    const empleados = empleadosResult.recordset;

    // ===== PASO 5 y 6: Recorrer empleados y calcular salario =====
    let procesados = 0;
    let excluidos = 0;
    let totalSalarios = 0;
    let warnings = []; // Para almacenar avisos importantes

    // ===== INICIO DEL STREAM DE RESPUESTA =====
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.flushHeaders(); // Enviar headers inmediatamente

    for (const emp of empleados) {
      const fechaIngreso = new Date(emp.FechaIngreso);
      const fechaPeriodo = new Date(nominaActual.FechaFinal); // o FecFinPeriodo

      // Validar si la fecha ingreso es mayor al periodo
      if (fechaIngreso > fechaPeriodo) {
        excluidos++;
        const displayDate = emp.FechaIngreso ? new Date(emp.FechaIngreso).toISOString().split('T')[0] : 'N/A';
        warnings.push(`Empleado ${emp.EmpleadoID} excluido: Fecha de ingreso (${displayDate}) es mayor al periodo.`);
        continue;
      }

      // Buscar Sueldo en RHPERCEP
      const sueldoResult = await pool.request()
        .input('EmpresaID', sql.Int, EmpresaID)
        .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
        .input('FechaFinPeriodo', sql.DateTime, nominaActual.FechaFinal)
        .query(`
          SELECT TOP 1 Valor 
          FROM RHPERCEP 
          WHERE EmpresaID = @EmpresaID 
            AND EmpleadoID = @EmpleadoID 
            AND SueldoActivo = 1 
            AND (FechaFin IS NULL OR FechaFin >= @FechaFinPeriodo OR FechaFin <= '1999-12-31')
          ORDER BY FechaInicio DESC
      `);

      let salarioBrutoOriginal = 0;

      if (sueldoResult.recordset.length > 0) {
        salarioBrutoOriginal = parseFloat(sueldoResult.recordset[0].Valor) || 0;
      }
      
      let salarioMensual = salarioBrutoOriginal;

      // === Variables para ISR ===
      let totalDependientesMensual = 0;
      let totalIncentivosMensuales = 0;

      if (salarioMensual === 0) {
        warnings.push(`Atención: El empleado ${emp.EmpleadoID} cumple las condiciones para nómina pero su salario base en RHPERCEP es 0 (o no tiene registro activo). Cobrará 0.`);
      }

      // Paso 6: Calcular proporción si entró después de que inició la nómina
      const fechaInicioNomina = new Date(nominaActual.FechaInicial);
      if (fechaIngreso > fechaInicioNomina && salarioMensual > 0) {
        const diffTime = Math.abs(fechaPeriodo - fechaIngreso);
        const diasTrabajados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        salarioMensual = (salarioMensual / 30) * diasTrabajados;
      }

      procesados++;
      totalSalarios += salarioMensual;
      
      // ===== PROCESO 1: Insertar en NMSUELDOEMPLEADO =====
      await pool.request()
        .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
        .input('EmpresaId', sql.VarChar, String(EmpresaID))
        .input('NominaNumero', sql.Int, NominaNumero)
        .input('TipoNominaID', sql.VarChar, TipoNominaId)
        .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
        .input('Salario', sql.Money, salarioBrutoOriginal)
        .input('CreadoPor', sql.VarChar, 'SYSTEM')
        .input('ModificadoPor', sql.VarChar, 'SYSTEM')
        .query(`
          INSERT INTO NMSUELDOEMPLEADO 
            (EmpleadoID, EmpresaId, NominaNumero, TipoNominaID, CodigoPeriodo, Salario, CreadoPor, FechaCreado, ModificadoPor, FechaModificado)
          VALUES 
            (@EmpleadoID, @EmpresaId, @NominaNumero, @TipoNominaID, @CodigoPeriodo, @Salario, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE())
        `);

      // ===== PROCESO 3: Insertar Salario (NMNOMINALINEAS) =====
      let montoSalarioNomina = salarioMensual; // Base calculada (proporcional al mes)
      if (tipoNominaInfo.TipoPago === 2) { // 2 = Quincenal
         montoSalarioNomina = montoSalarioNomina / 2;
      }

      let lineaContador = 1;
      let salarioNetoActual = montoSalarioNomina; // El neto base para esta nómina (quincena o mes)

      await pool.request()
        .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
        .input('Empresaid', sql.VarChar, String(EmpresaID))
        .input('TipoNominaId', sql.VarChar, TipoNominaId)
        .input('Secuencia', sql.Int, secuenciaActual)
        .input('NominaNumero', sql.Int, NominaNumero)
        .input('LineaNumero', sql.VarChar, String(lineaContador).padStart(4, '0'))
        .input('MonedaID', sql.VarChar, tipoNominaInfo.MonedaID || 'DOP')
        .input('TipoPago', sql.Int, tipoNominaInfo.TipoPago || 1)
        .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
        .input('TipoTransId', sql.VarChar, tipoTransSalario)
        .input('Tipo', sql.Int, 1) // 1 = Ingreso
        .input('Monto', sql.Money, montoSalarioNomina)
        .input('SalarioMensual', sql.Money, salarioBrutoOriginal)
        .input('Posteado', sql.Bit, 0)
        .input('Texto', sql.VarChar, 'Salario Ordinario')
        .input('CreadoPor', sql.VarChar, 'SYSTEM')
        .input('ModificadoPor', sql.VarChar, 'SYSTEM')
        .input('FechaRetencion', sql.DateTime, new Date())
        .query(`
          INSERT INTO NMNOMINALINEAS 
            (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
          VALUES
            (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
        `);

      // ===== PROCESO 2: Insertar Dependientes =====
      const periodoDependiente = parseInt(tipoNominaInfo.PeriodoDependiente) || 1;
      let aplicarDependiente = false;
      if (periodoDependiente === 1) aplicarDependiente = true; // Siempre
      else if (periodoDependiente === 2 && secuenciaActual === 1) aplicarDependiente = true; // 1ra Quincena
      else if (periodoDependiente === 3 && secuenciaActual === 2) aplicarDependiente = true; // 2da Quincena

      if (aplicarDependiente) {
        const dependientesEmp = await pool.request()
          .input('EmpresaID', sql.VarChar, String(EmpresaID))
          .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
          .query(`
            SELECT d.TransaccionID, t.Tipo 
            FROM NMDependiente d
            LEFT JOIN NMTIPOSTRANSACCIONES t ON d.TransaccionID = t.TipoTransId AND d.EmpresaID = t.EmpresaId
            WHERE d.EmpresaID = @EmpresaID AND d.EmpleadoID = @EmpleadoID AND d.Cobrar = 1
          `);
          
        let montoDependiente = parseFloat(tipoNominaInfo.MontoDependiente) || 0;
        totalDependientesMensual = dependientesEmp.recordset.length * montoDependiente;
        
        // Si el periodo es "Siempre" (1) y la nómina es Quincenal (TipoPago = 2), se divide entre 2.
        if (periodoDependiente === 1 && tipoNominaInfo.TipoPago === 2) {
          montoDependiente = montoDependiente / 2;
        }

        for (const dep of dependientesEmp.recordset) {
          lineaContador++;
          const tipoTrans = dep.TransaccionID;
          const tipoNaturaleza = dep.Tipo || 2; // Default a 2 (Descuento)
          
          await pool.request()
            .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
            .input('Empresaid', sql.VarChar, String(EmpresaID))
            .input('TipoNominaId', sql.VarChar, TipoNominaId)
            .input('Secuencia', sql.Int, secuenciaActual)
            .input('NominaNumero', sql.Int, NominaNumero)
            .input('LineaNumero', sql.VarChar, String(lineaContador).padStart(4, '0'))
            .input('MonedaID', sql.VarChar, tipoNominaInfo.MonedaID || 'DOP')
            .input('TipoPago', sql.Int, tipoNominaInfo.TipoPago || 1)
            .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
            .input('TipoTransId', sql.VarChar, tipoTrans)
            .input('Tipo', sql.Int, tipoNaturaleza)
            .input('Monto', sql.Money, montoDependiente)
            .input('SalarioMensual', sql.Money, salarioBrutoOriginal)
            .input('Posteado', sql.Bit, 0)
            .input('Texto', sql.VarChar, 'Descuento Dependiente')
            .input('CreadoPor', sql.VarChar, 'SYSTEM')
            .input('ModificadoPor', sql.VarChar, 'SYSTEM')
            .input('FechaRetencion', sql.DateTime, new Date())
            .query(`
              INSERT INTO NMNOMINALINEAS 
                (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
              VALUES
                (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
            `);
            
            if (tipoNaturaleza === 1) salarioNetoActual += montoDependiente;
            else salarioNetoActual -= montoDependiente;
        }
      }

      // ===== PROCESO 4: Insertar Fijas, Ocasionales y Recurrentes =====
      const transaccionesEmp = await pool.request()
        .input('EmpresaID', sql.VarChar, String(EmpresaID))
        .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
        .query(`
          SELECT tr.TipoTransId, tr.TipoNovedad, tr.Abono, tr.Intervalo, tr.Fecha, t.Tipo, t.Descripcion
          FROM NMTRANSACCIONES tr
          INNER JOIN NMTIPOSTRANSACCIONES t ON tr.TipoTransId = t.TipoTransId AND tr.EmpresaId = t.EmpresaId
          WHERE tr.EmpresaId = @EmpresaID 
            AND tr.EmpleadoID = @EmpleadoID 
            AND ISNULL(tr.Inactiva, 0) = 0
            AND ISNULL(t.Salario, 0) = 0 
            AND ISNULL(t.AFP, 0) = 0 
            AND ISNULL(t.ARS, 0) = 0 
            AND ISNULL(t.Dependiente, 0) = 0 
            AND ISNULL(t.ISR, 0) = 0
        `);

      for (const tr of transaccionesEmp.recordset) {
        let aplicarTransaccion = false;
        let montoTransaccion = parseFloat(tr.Abono) || 0;
        const tipoNovedad = parseInt(tr.TipoNovedad) || 0;
        
        if (tipoNovedad === 0) {
          // Fijas: Siempre procesar
          aplicarTransaccion = true;
        } 
        else if (tipoNovedad === 1) {
          // Ocasional: Fecha dentro de la nómina y respetar Intervalo
          if (tr.Fecha) {
            const fTransStr = new Date(tr.Fecha).toISOString().substring(0, 10);
            const fInicioStr = new Date(nominaActual.FechaInicial).toISOString().substring(0, 10);
            const fFinStr = new Date(nominaActual.FechaFinal).toISOString().substring(0, 10);
            
            if (fTransStr >= fInicioStr && fTransStr <= fFinStr) {
              const intervalo = parseInt(tr.Intervalo) || 0;
              if (intervalo === 0) aplicarTransaccion = true;
              else if (intervalo === 1 && secuenciaActual === 1) aplicarTransaccion = true;
              else if (intervalo === 2 && secuenciaActual === 2) aplicarTransaccion = true;
            }
          }
        }
        else if (tipoNovedad === 2) {
          // Recurrente: Respetar Intervalo
          const intervalo = parseInt(tr.Intervalo) || 0;
          if (intervalo === 0) aplicarTransaccion = true;
          else if (intervalo === 1 && secuenciaActual === 1) aplicarTransaccion = true;
          else if (intervalo === 2 && secuenciaActual === 2) aplicarTransaccion = true;
        }

        if (aplicarTransaccion && montoTransaccion > 0) {
          lineaContador++;
          const tipoNaturaleza = tr.Tipo || 2;
          
          await pool.request()
            .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
            .input('Empresaid', sql.VarChar, String(EmpresaID))
            .input('TipoNominaId', sql.VarChar, TipoNominaId)
            .input('Secuencia', sql.Int, secuenciaActual)
            .input('NominaNumero', sql.Int, NominaNumero)
            .input('LineaNumero', sql.VarChar, String(lineaContador).padStart(4, '0'))
            .input('MonedaID', sql.VarChar, tipoNominaInfo.MonedaID || 'DOP')
            .input('TipoPago', sql.Int, tipoNominaInfo.TipoPago || 1)
            .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
            .input('TipoTransId', sql.VarChar, tr.TipoTransId)
            .input('Tipo', sql.Int, tipoNaturaleza)
            .input('Monto', sql.Money, montoTransaccion)
            .input('SalarioMensual', sql.Money, salarioBrutoOriginal)
            .input('Posteado', sql.Bit, 0)
            .input('Texto', sql.VarChar, tr.Descripcion || 'Transaccion ' + tr.TipoTransId)
            .input('CreadoPor', sql.VarChar, 'SYSTEM')
            .input('ModificadoPor', sql.VarChar, 'SYSTEM')
            .input('FechaRetencion', sql.DateTime, new Date())
            .query(`
              INSERT INTO NMNOMINALINEAS 
                (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
              VALUES
                (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
            `);
            
          if (tipoNaturaleza === 1) salarioNetoActual += montoTransaccion;
          else salarioNetoActual -= montoTransaccion;
          
          if (incentivosMap[tr.TipoTransId]) {
             // Ya NO se multiplica por 2 en la primera quincena. Se toma solo el monto aplicado.
             totalIncentivosMensuales += montoTransaccion;
          }
        }
      }

      // ===== PROCESO 5: Insertar AFP =====
      if (emp.AFP && tipoNominaInfo.CalcularAFP) {
        const periodoAFP = parseInt(tipoNominaInfo.PeriodoAFP) || 1;
        let aplicarAFP = false;
        if (periodoAFP === 1) aplicarAFP = true; // Siempre
        else if (periodoAFP === 2 && secuenciaActual === 1) aplicarAFP = true; // 1ra
        else if (periodoAFP === 3 && secuenciaActual === 2) aplicarAFP = true; // 2da
        
        if (aplicarAFP) {
          let montoAFP = (salarioMensual * (parseFloat(parametrosAFP_ARS.AportePension) || 0)) / 100;
          const topeAFP = parseFloat(parametrosAFP_ARS.TOPEAFP) || 0;
          
          if (topeAFP > 0 && montoAFP > topeAFP) {
            montoAFP = topeAFP;
          }
          
          // Dividir entre 2 si es quincenal y la regla es Siempre
          if (periodoAFP === 1 && tipoNominaInfo.TipoPago === 2) {
             montoAFP = montoAFP / 2;
          }
          
          if (montoAFP > 0) {
            lineaContador++;
            await pool.request()
              .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
              .input('Empresaid', sql.VarChar, String(EmpresaID))
              .input('TipoNominaId', sql.VarChar, TipoNominaId)
              .input('Secuencia', sql.Int, secuenciaActual)
              .input('NominaNumero', sql.Int, NominaNumero)
              .input('LineaNumero', sql.VarChar, String(lineaContador).padStart(4, '0'))
              .input('MonedaID', sql.VarChar, tipoNominaInfo.MonedaID || 'DOP')
              .input('TipoPago', sql.Int, tipoNominaInfo.TipoPago || 1)
              .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
              .input('TipoTransId', sql.VarChar, tipoTransAFP)
              .input('Tipo', sql.Int, 2) // 2 = Descuento
              .input('Monto', sql.Money, montoAFP)
              .input('SalarioMensual', sql.Money, salarioBrutoOriginal)
              .input('Posteado', sql.Bit, 0)
              .input('Texto', sql.VarChar, 'Deduccion AFP')
              .input('CreadoPor', sql.VarChar, 'SYSTEM')
              .input('ModificadoPor', sql.VarChar, 'SYSTEM')
              .input('FechaRetencion', sql.DateTime, new Date())
              .query(`
                INSERT INTO NMNOMINALINEAS 
                  (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
                VALUES
                  (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
              `);
              
            salarioNetoActual -= montoAFP;
          }
        }
      }

      // ===== PROCESO 6: Insertar ARS =====
      if (emp.ARS && tipoNominaInfo.CalcularARS) {
        const periodoARS = parseInt(tipoNominaInfo.PeriodoARS) || 1;
        let aplicarARS = false;
        if (periodoARS === 1) aplicarARS = true; // Siempre
        else if (periodoARS === 2 && secuenciaActual === 1) aplicarARS = true; // 1ra
        else if (periodoARS === 3 && secuenciaActual === 2) aplicarARS = true; // 2da
        
        if (aplicarARS) {
          let montoARS = (salarioMensual * (parseFloat(parametrosAFP_ARS.AporteSalud) || 0)) / 100;
          const topeARS = parseFloat(parametrosAFP_ARS.TOPEARS) || 0;
          
          if (topeARS > 0 && montoARS > topeARS) {
            montoARS = topeARS;
          }
          
          // Dividir entre 2 si es quincenal y la regla es Siempre
          if (periodoARS === 1 && tipoNominaInfo.TipoPago === 2) {
             montoARS = montoARS / 2;
          }
          
          if (montoARS > 0) {
            lineaContador++;
            await pool.request()
              .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
              .input('Empresaid', sql.VarChar, String(EmpresaID))
              .input('TipoNominaId', sql.VarChar, TipoNominaId)
              .input('Secuencia', sql.Int, secuenciaActual)
              .input('NominaNumero', sql.Int, NominaNumero)
              .input('LineaNumero', sql.VarChar, String(lineaContador).padStart(4, '0'))
              .input('MonedaID', sql.VarChar, tipoNominaInfo.MonedaID || 'DOP')
              .input('TipoPago', sql.Int, tipoNominaInfo.TipoPago || 1)
              .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
              .input('TipoTransId', sql.VarChar, tipoTransARS)
              .input('Tipo', sql.Int, 2) // 2 = Descuento
              .input('Monto', sql.Money, montoARS)
              .input('SalarioMensual', sql.Money, salarioBrutoOriginal)
              .input('Posteado', sql.Bit, 0)
              .input('Texto', sql.VarChar, 'Deduccion ARS')
              .input('CreadoPor', sql.VarChar, 'SYSTEM')
              .input('ModificadoPor', sql.VarChar, 'SYSTEM')
              .input('FechaRetencion', sql.DateTime, new Date())
              .query(`
                INSERT INTO NMNOMINALINEAS 
                  (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
                VALUES
                  (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
              `);
              
            salarioNetoActual -= montoARS;
          }
        }
      }

      // ===== PROCESO 7: Insertar ISR =====
      if (tipoNominaInfo.CalcularISR && hasISR) {
        const periodoISR = parseInt(tipoNominaInfo.PeriodoISR) || 1;
        let aplicarISR = false;
        if (periodoISR === 1) aplicarISR = true; // Siempre
        else if (periodoISR === 2 && secuenciaActual === 1) aplicarISR = true; // 1ra
        else if (periodoISR === 3 && secuenciaActual === 2) aplicarISR = true; // 2da
        
        if (aplicarISR) {
          // 1. Calcular valores completos mensuales para deducciones legales
          let afpMensual = 0;
          if (emp.AFP) {
            afpMensual = (salarioMensual * (parseFloat(parametrosAFP_ARS.AportePension) || 0)) / 100;
            const topeAFP = parseFloat(parametrosAFP_ARS.TOPEAFP) || 0;
            if (topeAFP > 0 && afpMensual > topeAFP) afpMensual = topeAFP;
          }
          
          let arsMensual = 0;
          if (emp.ARS) {
            arsMensual = (salarioMensual * (parseFloat(parametrosAFP_ARS.AporteSalud) || 0)) / 100;
            const topeARS = parseFloat(parametrosAFP_ARS.TOPEARS) || 0;
            if (topeARS > 0 && arsMensual > topeARS) arsMensual = topeARS;
          }
          
          // 1.5. Si estamos en la 2da quincena, sumar los incentivos de la 1ra quincena a la base
          if (secuenciaActual === 2 && tipoNominaInfo.TipoPago === 2) {
              const incentivosQ1Result = await pool.request()
                 .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
                 .input('Empresaid', sql.VarChar, String(EmpresaID))
                 .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
                 .input('TipoNominaId', sql.VarChar, TipoNominaId)
                 .query(`
                   SELECT SUM(nl.Monto) as IncentivosQ1 
                   FROM NMNOMINALINEAS nl
                   INNER JOIN NMTIPOSTRANSACCIONES t ON nl.TipoTransId = t.TipoTransId AND nl.Empresaid = t.EmpresaId
                   WHERE nl.CodigoPeriodo = @CodigoPeriodo 
                     AND nl.Empresaid = @Empresaid
                     AND nl.EmpleadoID = @EmpleadoID
                     AND nl.TipoNominaId = @TipoNominaId
                     AND nl.Secuencia = 1
                     AND t.EsIncentivo = 1
                 `);
              const incentivosQ1 = parseFloat(incentivosQ1Result.recordset[0]?.IncentivosQ1) || 0;
              totalIncentivosMensuales += incentivosQ1;
          }

          // 2. Base ISR Mensual
          let baseISR = salarioMensual + totalIncentivosMensuales - afpMensual - arsMensual - totalDependientesMensual;
          
          if (baseISR > 0) {
            // 3. Consultar tabla NMISR
            const isrResult = await pool.request()
              .input('Ano', sql.Int, new Date(nominaActual.FechaInicial).getFullYear())
              .input('BaseISR', sql.Decimal(18,2), baseISR)
              .query(`
                SELECT TOP 1 Base, Valor, SueldoInicial 
                FROM NMISR 
                WHERE YEAR(FechaInicial) <= @Ano 
                  AND @BaseISR >= SueldoInicial 
                  AND (SueldoFinal IS NULL OR @BaseISR <= SueldoFinal)
                ORDER BY SueldoInicial DESC
              `);
              
            if (isrResult.recordset.length > 0) {
              const isrRow = isrResult.recordset[0];
              const valorPct = parseFloat(isrRow.Valor) || 0;
              const baseFija = parseFloat(isrRow.Base) || 0;
              const sueldoInicialISR = parseFloat(isrRow.SueldoInicial) || 0;
              
              // 4. Calcular impuesto mensual
              let impuestoMensual = baseFija + ((baseISR - sueldoInicialISR) * (valorPct / 100.0));
              
              if (impuestoMensual > 0) {
                let montoADescontar = impuestoMensual;

                // Si es la 1ra quincena y se cobra siempre, retener la mitad proyectada
                if (periodoISR === 1 && tipoNominaInfo.TipoPago === 2 && secuenciaActual === 1) {
                   montoADescontar = impuestoMensual / 2;
                }
                // Si es la 2da quincena, hacer liquidación (true-up)
                else if (periodoISR === 1 && tipoNominaInfo.TipoPago === 2 && secuenciaActual === 2) {
                   // Buscar lo descontado en la 1ra quincena para este empleado
                   const retencionQ1Result = await pool.request()
                     .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
                     .input('Empresaid', sql.VarChar, String(EmpresaID))
                     .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
                     .input('TipoNominaId', sql.VarChar, TipoNominaId)
                     .input('TipoTransISR', sql.VarChar, tipoTransISR)
                     .query(`
                       SELECT SUM(Monto) as RetenidoQ1 
                       FROM NMNOMINALINEAS 
                       WHERE CodigoPeriodo = @CodigoPeriodo 
                         AND Empresaid = @Empresaid
                         AND EmpleadoID = @EmpleadoID
                         AND TipoNominaId = @TipoNominaId
                         AND Secuencia = 1
                         AND TipoTransId = @TipoTransISR
                     `);
                     
                   const retenidoQ1 = parseFloat(retencionQ1Result.recordset[0]?.RetenidoQ1) || 0;
                   montoADescontar = impuestoMensual - retenidoQ1;
                   if (montoADescontar < 0) montoADescontar = 0; // No generar saldo a favor automático por ahora
                }
                
                if (montoADescontar > 0) {
                  lineaContador++;
                  await pool.request()
                    .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
                    .input('Empresaid', sql.VarChar, String(EmpresaID))
                    .input('TipoNominaId', sql.VarChar, TipoNominaId)
                    .input('Secuencia', sql.Int, secuenciaActual)
                    .input('NominaNumero', sql.Int, NominaNumero)
                    .input('LineaNumero', sql.VarChar, String(lineaContador).padStart(4, '0'))
                    .input('MonedaID', sql.VarChar, tipoNominaInfo.MonedaID || 'DOP')
                    .input('TipoPago', sql.Int, tipoNominaInfo.TipoPago || 1)
                    .input('EmpleadoID', sql.VarChar, emp.EmpleadoID)
                    .input('TipoTransId', sql.VarChar, tipoTransISR)
                    .input('Tipo', sql.Int, 2) // Descuento
                    .input('Monto', sql.Money, montoADescontar)
                    .input('SalarioMensual', sql.Money, salarioBrutoOriginal)
                    .input('Posteado', sql.Bit, 0)
                    .input('Texto', sql.VarChar, 'Deduccion ISR')
                    .input('CreadoPor', sql.VarChar, 'SYSTEM')
                    .input('ModificadoPor', sql.VarChar, 'SYSTEM')
                    .input('FechaRetencion', sql.DateTime, new Date())
                    .query(`
                      INSERT INTO NMNOMINALINEAS 
                        (CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, LineaNumero, MonedaID, TipoPago, EmpleadoID, TipoTransId, Tipo, Monto, SalarioMensual, Posteado, Texto, CreadoPor, FechaCreado, ModificadoPor, FechaModificado, FechaRetencion)
                      VALUES
                        (@CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero, @LineaNumero, @MonedaID, @TipoPago, @EmpleadoID, @TipoTransId, @Tipo, @Monto, @SalarioMensual, @Posteado, @Texto, @CreadoPor, GETDATE(), @ModificadoPor, GETDATE(), @FechaRetencion)
                    `);
                    
                  salarioNetoActual -= montoADescontar;
                }
              }
            }
          }
        }
      }

      // Reportar progreso al frontend
      res.write(JSON.stringify({ 
        type: 'progress', 
        procesados: procesados + excluidos, 
        total: empleados.length, 
        currentEmp: emp.EmpleadoID 
      }) + '\n');
    }

    // Respuesta final de éxito
    res.write(JSON.stringify({ 
      type: 'done',
      message: `Proceso completado. Empleados procesados: ${procesados}. Excluidos: ${excluidos}. Suma bruta proporcional: ${totalSalarios.toFixed(2)}`,
      warnings: warnings
    }) + '\n');
    res.end();

  } catch (error) {
    console.error('Error en procesarNomina:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error interno del servidor al procesar la nómina.' });
    } else {
      res.write(JSON.stringify({ type: 'error', message: 'Error interno del servidor al procesar la nómina.' }) + '\n');
      res.end();
    }
  }
};

module.exports = {
  getNominas,
  procesarNomina
};
