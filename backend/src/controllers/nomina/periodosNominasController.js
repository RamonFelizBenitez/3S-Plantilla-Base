const { sql, connectDB } = require('../../config/db');

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateToLocalString(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const getPeriodos = async (req, res) => {
  try {
    const { Empresaid } = req.query;
    if (!Empresaid) {
      return res.status(400).json({ message: 'Falta Empresaid' });
    }
    const pool = await connectDB();
    const result = await pool.request()
      .input('Empresaid', sql.VarChar, Empresaid)
      .query(`
        SELECT CodigoPeriodo, TipoPago, Empresaid, Secuencia, SecuenciaReg, Intervalo, Posteado, FechaInicio, FechaFinal
        FROM NMPERIODOSNOMINAS
        WHERE Empresaid = @Empresaid
        ORDER BY CodigoPeriodo DESC, TipoPago ASC, Secuencia ASC
      `);
    res.json({ data: result.recordset });
  } catch (error) {
    console.error('Error al obtener periodos de nominas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const generarPeriodos = async (req, res) => {
  try {
    const { Empresaid, FechaInicioStr, TipoPago } = req.body;
    
    if (!Empresaid || !FechaInicioStr || TipoPago === undefined) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Parse manually to avoid UTC offset issues
    const parts = FechaInicioStr.split('-');
    const year = parseInt(parts[0], 10);
    const monthBase = parseInt(parts[1], 10) - 1;
    const dayBase = parseInt(parts[2], 10);
    
    const fechaBase = new Date(year, monthBase, dayBase);
    const codigoPeriodo = year; // El año exacto seleccionado

    const pool = await connectDB();

    // Validar que no exista ya para este año y tipo
    const checkResult = await pool.request()
      .input('Empresaid', sql.VarChar, Empresaid)
      .input('CodigoPeriodo', sql.Int, codigoPeriodo)
      .input('TipoPago', sql.Int, TipoPago)
      .query('SELECT TOP 1 1 FROM NMPERIODOSNOMINAS WHERE Empresaid = @Empresaid AND CodigoPeriodo = @CodigoPeriodo AND TipoPago = @TipoPago');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ error: `Ya existen periodos generados para el año ${codigoPeriodo} y Tipo de Nómina ${TipoPago}.` });
    }

    const periodosAGenerar = [];
    let secuencia = 1;

    // 0 = Semanal, 1 = Bisemanal, 2 = Quincenal, 3 = Mensual
    if (TipoPago === 0 || TipoPago === 1) {
      const daysToAdd = TipoPago === 0 ? 6 : 13;
      let currentStart = new Date(fechaBase);
      
      while (currentStart.getFullYear() === year) {
        let currentEnd = addDays(currentStart, daysToAdd);
        periodosAGenerar.push({
          Secuencia: secuencia,
          FechaInicio: new Date(currentStart),
          FechaFinal: new Date(currentEnd),
          Intervalo: `${formatDateToLocalString(currentStart)} Al ${formatDateToLocalString(currentEnd)}`
        });
        secuencia++;
        currentStart = addDays(currentEnd, 1);
      }
    } 
    else if (TipoPago === 2) {
      // Quincenal: Generar 24 periodos (2 por mes) para el año especificado
      for (let month = 0; month < 12; month++) {
        // Q1: del 1 al 15
        const q1Start = new Date(year, month, 1);
        const q1End = new Date(year, month, 15);
        periodosAGenerar.push({
          Secuencia: secuencia++,
          FechaInicio: q1Start,
          FechaFinal: q1End,
          Intervalo: `${formatDateToLocalString(q1Start)} Al ${formatDateToLocalString(q1End)}`
        });

        // Q2: del 16 al fin de mes
        const q2Start = new Date(year, month, 16);
        const q2End = new Date(year, month + 1, 0); // Ultimo dia del mes
        periodosAGenerar.push({
          Secuencia: secuencia++,
          FechaInicio: q2Start,
          FechaFinal: q2End,
          Intervalo: `${formatDateToLocalString(q2Start)} Al ${formatDateToLocalString(q2End)}`
        });
      }
    }
    else if (TipoPago === 3) {
      // Mensual: Generar 12 periodos
      for (let month = 0; month < 12; month++) {
        const mStart = new Date(year, month, 1);
        const mEnd = new Date(year, month + 1, 0);
        periodosAGenerar.push({
          Secuencia: secuencia++,
          FechaInicio: mStart,
          FechaFinal: mEnd,
          Intervalo: `${formatDateToLocalString(mStart)} Al ${formatDateToLocalString(mEnd)}`
        });
      }
    } else {
      return res.status(400).json({ error: 'TipoPago inválido' });
    }

    // Iniciar Transaccion para Insertar todos los periodos
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      let inserted = 0;

      for (const p of periodosAGenerar) {
        await request
          .input('CodigoPeriodo', sql.Int, codigoPeriodo)
          .input('TipoPago', sql.Int, TipoPago)
          .input('Empresaid', sql.VarChar, Empresaid)
          .input('SecuenciaReg', sql.Int, p.Secuencia)
          .input('Secuencia', sql.Int, p.Secuencia)
          .input('Intervalo', sql.VarChar, p.Intervalo)
          .input('Posteado', sql.Bit, 0)
          .input('FechaInicio', sql.DateTime, p.FechaInicio)
          .input('FechaFinal', sql.DateTime, p.FechaFinal)
          .input('TipoEmp', sql.VarChar, 'TODOS')
          .query(`
            INSERT INTO NMPERIODOSNOMINAS (
              CodigoPeriodo, TipoPago, Empresaid, SecuenciaReg, Secuencia, 
              Intervalo, Posteado, Fecha, FechaInicio, FechaFinal, TipoEmp
            ) VALUES (
              @CodigoPeriodo, @TipoPago, @Empresaid, @SecuenciaReg, @Secuencia, 
              @Intervalo, @Posteado, GETDATE(), @FechaInicio, @FechaFinal, @TipoEmp
            )
          `);
        inserted++;
        // Limpiamos los parámetros para la próxima iteración del ciclo
        request.parameters = {};
      }
      
      await transaction.commit();
      res.status(201).json({ message: 'Periodos generados correctamente', totalGenerados: inserted });
    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }

  } catch (error) {
    console.error('Error al generar periodos:', error);
    res.status(500).json({ error: 'Error interno al generar periodos' });
  }
};

const eliminarLotePeriodos = async (req, res) => {
  try {
    const { codigoPeriodo, tipoPago } = req.params;
    const { Empresaid } = req.query;

    if (!Empresaid || !codigoPeriodo || tipoPago === undefined) {
      return res.status(400).json({ error: 'Datos insuficientes para eliminar' });
    }

    const pool = await connectDB();

    // Validar que no esten posteados
    const checkPosteado = await pool.request()
      .input('Empresaid', sql.VarChar, Empresaid)
      .input('CodigoPeriodo', sql.Int, codigoPeriodo)
      .input('TipoPago', sql.Int, tipoPago)
      .query('SELECT TOP 1 1 FROM NMPERIODOSNOMINAS WHERE Empresaid = @Empresaid AND CodigoPeriodo = @CodigoPeriodo AND TipoPago = @TipoPago AND Posteado = 1');
    
    if (checkPosteado.recordset.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar porque hay periodos posteados.' });
    }

    const deleteResult = await pool.request()
      .input('Empresaid', sql.VarChar, Empresaid)
      .input('CodigoPeriodo', sql.Int, codigoPeriodo)
      .input('TipoPago', sql.Int, tipoPago)
      .query(`
        DELETE FROM NMPERIODOSNOMINAS
        WHERE Empresaid = @Empresaid AND CodigoPeriodo = @CodigoPeriodo AND TipoPago = @TipoPago
      `);

    res.json({ message: `Lote eliminado correctamente (${deleteResult.rowsAffected[0]} registros)` });
  } catch (error) {
    console.error('Error al eliminar periodos:', error);
    res.status(500).json({ error: 'Error al eliminar periodos' });
  }
};

module.exports = {
  getPeriodos,
  generarPeriodos,
  eliminarLotePeriodos
};
