const { sql, connectDB } = require('../../config/db');

// Obtener tipos de nominas
const getTiposNominas = async (req, res) => {
  try {
    const { EmpresaID } = req.query;
    if (!EmpresaID) {
      return res.status(400).json({ message: 'Se requiere EmpresaID' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaID)
      .query(`
        SELECT TipoNominaID, Descripcion, TipoPago
        FROM NMTIPOSNOMINAS
        WHERE EmpresaId = @EmpresaId
        ORDER BY Descripcion ASC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener Tipos de Nominas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener periodos disponibles por TipoPago
const getPeriodosDisponibles = async (req, res) => {
  try {
    const { EmpresaID } = req.query;
    const { tipoPago, tipoNominaId } = req.params;
    
    if (!EmpresaID || tipoPago === undefined || !tipoNominaId) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos (EmpresaID, tipoPago, tipoNominaId)' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('Empresaid', sql.VarChar, EmpresaID)
      .input('TipoPago', sql.Int, tipoPago)
      .input('TipoNominaID', sql.VarChar, tipoNominaId)
      .query(`
        SELECT CodigoPeriodo, Secuencia, Intervalo, FechaInicio, FechaFinal
        FROM NMPERIODOSNOMINAS P
        WHERE Empresaid = @Empresaid
          AND TipoPago = @TipoPago
          AND Posteado = 0
          AND NOT EXISTS (
            SELECT 1 FROM NMNOMINA N 
            WHERE N.EmpresaID = P.EmpresaID 
              AND N.CodigoPeriodo = P.CodigoPeriodo 
              AND N.Secuencia = P.Secuencia
              AND N.TipoNominaId = @TipoNominaID
          )
        ORDER BY CodigoPeriodo DESC, Secuencia ASC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener Periodos Disponibles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Abrir nómina (Insert en NMNOMINA)
const abrirNominaAction = async (req, res) => {
  try {
    const { EmpresaID, TipoNominaID, CodigoPeriodo, Secuencia, FechaPago } = req.body;
    
    if (!EmpresaID || !TipoNominaID || !CodigoPeriodo || !Secuencia || !FechaPago) {
      return res.status(400).json({ message: 'Faltan datos requeridos para abrir la nómina' });
    }

    const pool = await connectDB();

    // 1. Obtener detalles de la nómina y el periodo
    const tipoResult = await pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaID)
      .input('TipoNominaID', sql.VarChar, TipoNominaID)
      .query('SELECT Descripcion, TipoPago FROM NMTIPOSNOMINAS WHERE EmpresaId = @EmpresaId AND TipoNominaID = @TipoNominaID');
    
    if (tipoResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Tipo de nómina no encontrado' });
    }
    const tipoData = tipoResult.recordset[0];

    const periodoResult = await pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaID)
      .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
      .input('Secuencia', sql.Int, Secuencia)
      .input('TipoPago', sql.Int, tipoData.TipoPago)
      .query('SELECT FechaInicio, FechaFinal FROM NMPERIODOSNOMINAS WHERE Empresaid = @EmpresaId AND CodigoPeriodo = @CodigoPeriodo AND Secuencia = @Secuencia AND TipoPago = @TipoPago');

    if (periodoResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Periodo no encontrado' });
    }
    const periodoData = periodoResult.recordset[0];

    // 2. Validar que NO haya sido generada ya
    const checkResult = await pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaID)
      .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
      .input('TipoNominaID', sql.VarChar, TipoNominaID)
      .input('Secuencia', sql.Int, Secuencia)
      .query('SELECT TOP 1 1 FROM NMNOMINA WHERE Empresaid = @EmpresaId AND CodigoPeriodo = @CodigoPeriodo AND TipoNominaId = @TipoNominaID AND Secuencia = @Secuencia');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Esta nómina y secuencia ya han sido abiertas o generadas previamente' });
    }

    // 3. Obtener el siguiente NominaNumero para la empresa
    const numeroResult = await pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaID)
      .query('SELECT ISNULL(MAX(NominaNumero), 0) + 1 AS SiguienteNumero FROM NMNOMINA WHERE Empresaid = @EmpresaId');
    
    const nominaNumero = numeroResult.recordset[0].SiguienteNumero;

    // 4. Insertar en NMNOMINA
    await pool.request()
      .input('CodigoPeriodo', sql.Int, CodigoPeriodo)
      .input('Empresaid', sql.VarChar, EmpresaID)
      .input('TipoNominaId', sql.VarChar, TipoNominaID)
      .input('Secuencia', sql.Int, Secuencia)
      .input('NominaNumero', sql.Int, nominaNumero)
      .input('Descripcion', sql.VarChar, tipoData.Descripcion)
      .input('TipoPago', sql.Int, tipoData.TipoPago)
      .input('FechaInicial', sql.DateTime, periodoData.FechaInicio)
      .input('FechaFinal', sql.DateTime, periodoData.FechaFinal)
      .input('FechaGeneracion', sql.DateTime, new Date(FechaPago))
      .input('CreadoPor', sql.VarChar, 'SYSTEM')
      .query(`
        INSERT INTO NMNOMINA (
          CodigoPeriodo, Empresaid, TipoNominaId, Secuencia, NominaNumero, 
          Descripcion, TipoPago, FechaInicial, FechaFinal, FechaGeneracion, CreadoPor
        ) VALUES (
          @CodigoPeriodo, @Empresaid, @TipoNominaId, @Secuencia, @NominaNumero,
          @Descripcion, @TipoPago, @FechaInicial, @FechaFinal, @FechaGeneracion, @CreadoPor
        )
      `);

    res.status(201).json({ message: 'Nómina abierta exitosamente', NominaNumero: nominaNumero });

  } catch (error) {
    console.error('Error al abrir nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor al abrir nómina' });
  }
};

module.exports = {
  getTiposNominas,
  getPeriodosDisponibles,
  abrirNominaAction
};
