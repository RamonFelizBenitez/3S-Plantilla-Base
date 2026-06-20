const { sql, connectDB } = require('../config/db');

exports.getTiposNominas = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query('SELECT * FROM NMTIPOSNOMINAS WHERE EmpresaId = @empresaId ORDER BY TipoNominaID ASC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTipoNomina = async (req, res) => {
  try {
    const pool = await connectDB();
    const body = req.body;
    
    // Check if exists
    const check = await pool.request()
      .input('TipoNominaID', sql.VarChar, body.TipoNominaID)
      .input('EmpresaId', sql.VarChar, body.EmpresaId)
      .query('SELECT 1 FROM NMTIPOSNOMINAS WHERE TipoNominaID = @TipoNominaID AND EmpresaId = @EmpresaId');
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ message: 'Este código de Tipo de Nómina ya existe' });
    }

    const request = pool.request();
    // Bind all inputs
    Object.keys(body).forEach(key => {
      let type = sql.VarChar;
      if (typeof body[key] === 'boolean') type = sql.Bit;
      else if (['TipoPago', 'MinimoHoras', 'PeriodoAFP', 'PeriodoARS', 'PeriodoISR', 'PeriodoDependiente', 'PromedioHorasMes', 'CalcBaseHoraProm', 'HorasenDia'].includes(key)) type = sql.Int;
      else if (key === 'PromedioDiasMes') type = sql.Float;
      else if (key.includes('HoraEntrada')) type = sql.DateTime;
      
      request.input(key, type, body[key] !== undefined ? body[key] : null);
    });

    const columns = Object.keys(body).join(', ');
    const values = Object.keys(body).map(k => `@${k}`).join(', ');

    await request.query(`
      INSERT INTO NMTIPOSNOMINAS (${columns}, FechaCreado, FechaModificado) 
      VALUES (${values}, GETDATE(), GETDATE())
    `);
      
    res.status(201).json({ message: 'Tipo de Nómina creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateTipoNomina = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    const pool = await connectDB();
    const request = pool.request();
    
    request.input('id', sql.VarChar, id);
    request.input('EmpresaId', sql.VarChar, body.EmpresaId || body.EmpresaID || '1');
    
    let updateFields = [];
    Object.keys(body).forEach(key => {
      // Don't update PKs and automatically managed dates
      if (key !== 'TipoNominaID' && key !== 'EmpresaId' && key !== 'RecordId' && key !== 'FechaCreado' && key !== 'FechaModificado') {
        let type = sql.VarChar;
        if (typeof body[key] === 'boolean') type = sql.Bit;
        else if (['TipoPago', 'MinimoHoras', 'PeriodoAFP', 'PeriodoARS', 'PeriodoISR', 'PeriodoDependiente', 'PromedioHorasMes', 'CalcBaseHoraProm', 'HorasenDia'].includes(key)) type = sql.Int;
        else if (key === 'PromedioDiasMes') type = sql.Float;
        else if (key.includes('HoraEntrada')) type = sql.DateTime;

        request.input(key, type, body[key] !== undefined ? body[key] : null);
        updateFields.push(`${key} = @${key}`);
      }
    });

    updateFields.push("FechaModificado = GETDATE()");

    const result = await request.query(`
      UPDATE NMTIPOSNOMINAS 
      SET ${updateFields.join(', ')}
      WHERE TipoNominaID = @id AND EmpresaId = @EmpresaId
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json({ message: 'Actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTipoNomina = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    
    const pool = await connectDB();
    const result = await pool.request()
      .input('TipoNominaID', sql.VarChar, id)
      .input('EmpresaId', sql.VarChar, empresaId)
      .query('DELETE FROM NMTIPOSNOMINAS WHERE TipoNominaID = @TipoNominaID AND EmpresaId = @EmpresaId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
      
    res.json({ message: 'Eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
