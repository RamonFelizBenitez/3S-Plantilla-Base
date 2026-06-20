const { sql, connectDB } = require('../config/db');

const getBySolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const { empresaId } = req.query;
    if (!solicitudId || !empresaId) return res.status(400).json({ message: 'SolicitudID y EmpresaID son requeridos' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('solicitudId', sql.Int, parseInt(solicitudId))
      .input('empresaId', sql.Int, parseInt(empresaId))
      .query(`
        SELECT i.*, c.Descripcion as IdiomaNombre 
        FROM RHIdiomaSolicitante i
        LEFT JOIN RHIdiomas c ON i.IdiomaID = c.IdiomaID AND i.EmpresaID = c.EmpresaID
        WHERE i.SolicitudID = @solicitudId AND i.EmpresaID = @empresaId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { 
      EmpresaID, SolicitudID, IdiomaID, 
      HablaBien, HablaRegular, LeeBien, LeeRegular, 
      EscribeBien, EscribeRegular, TraduceBien, TraduceRegular, 
      CreadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('SolicitudID', sql.Int, parseInt(SolicitudID))
      .input('IdiomaID', sql.Int, parseInt(IdiomaID))
      .input('HablaBien', sql.Bit, HablaBien ? 1 : 0)
      .input('HablaRegular', sql.Bit, HablaRegular ? 1 : 0)
      .input('LeeBien', sql.Bit, LeeBien ? 1 : 0)
      .input('LeeRegular', sql.Bit, LeeRegular ? 1 : 0)
      .input('EscribeBien', sql.Bit, EscribeBien ? 1 : 0)
      .input('EscribeRegular', sql.Bit, EscribeRegular ? 1 : 0)
      .input('TraduceBien', sql.Bit, TraduceBien ? 1 : 0)
      .input('TraduceRegular', sql.Bit, TraduceRegular ? 1 : 0)
      .input('CreadoPor', sql.Int, CreadoPor || null)
      .query(`
        INSERT INTO RHIdiomaSolicitante (
          EmpresaID, SolicitudID, IdiomaID, 
          HablaBien, HablaRegular, LeeBien, LeeRegular, 
          EscribeBien, EscribeRegular, TraduceBien, TraduceRegular, 
          CreadoPor
        ) VALUES (
          @EmpresaID, @SolicitudID, @IdiomaID, 
          @HablaBien, @HablaRegular, @LeeBien, @LeeRegular, 
          @EscribeBien, @EscribeRegular, @TraduceBien, @TraduceRegular, 
          @CreadoPor
        )
      `);
      
    res.status(201).json({ message: 'Idioma agregado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      EmpresaID, IdiomaID, 
      HablaBien, HablaRegular, LeeBien, LeeRegular, 
      EscribeBien, EscribeRegular, TraduceBien, TraduceRegular, 
      ModificadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('IdiomaID', sql.Int, parseInt(IdiomaID))
      .input('HablaBien', sql.Bit, HablaBien ? 1 : 0)
      .input('HablaRegular', sql.Bit, HablaRegular ? 1 : 0)
      .input('LeeBien', sql.Bit, LeeBien ? 1 : 0)
      .input('LeeRegular', sql.Bit, LeeRegular ? 1 : 0)
      .input('EscribeBien', sql.Bit, EscribeBien ? 1 : 0)
      .input('EscribeRegular', sql.Bit, EscribeRegular ? 1 : 0)
      .input('TraduceBien', sql.Bit, TraduceBien ? 1 : 0)
      .input('TraduceRegular', sql.Bit, TraduceRegular ? 1 : 0)
      .input('ModificadoPor', sql.Int, ModificadoPor || null)
      .query(`
        UPDATE RHIdiomaSolicitante SET 
          IdiomaID = @IdiomaID,
          HablaBien = @HablaBien,
          HablaRegular = @HablaRegular,
          LeeBien = @LeeBien,
          LeeRegular = @LeeRegular,
          EscribeBien = @EscribeBien,
          EscribeRegular = @EscribeRegular,
          TraduceBien = @TraduceBien,
          TraduceRegular = @TraduceRegular,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE IdiomaSolicitanteID = @ID AND EmpresaID = @EmpresaID
      `);
      
    res.json({ message: 'Idioma actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const { empresaId } = req.query;
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(empresaId))
      .query(`DELETE FROM RHIdiomaSolicitante WHERE IdiomaSolicitanteID = @ID AND EmpresaID = @EmpresaID`);
      
    res.json({ message: 'Idioma eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getBySolicitud,
  create,
  update,
  remove
};
