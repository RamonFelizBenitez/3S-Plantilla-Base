const { sql, connectDB } = require('../../config/db');

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
        SELECT o.*, a.Descripcion as ActividadNombre
        FROM RHOtros o
        LEFT JOIN RHActividades a ON o.ActividadID = a.ActividadID AND o.EmpresaID = a.EmpresaID
        WHERE o.SolicitudID = @solicitudId AND o.EmpresaID = @empresaId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { 
      EmpresaID, SolicitudID, ActividadID, Descripcion, CreadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('SolicitudID', sql.Int, parseInt(SolicitudID))
      .input('ActividadID', sql.Int, parseInt(ActividadID))
      .input('Descripcion', sql.VarChar, Descripcion || '')
      .input('CreadoPor', sql.Int, CreadoPor || null)
      .query(`
        INSERT INTO RHOtros (
          EmpresaID, SolicitudID, ActividadID, Descripcion, CreadoPor
        ) VALUES (
          @EmpresaID, @SolicitudID, @ActividadID, @Descripcion, @CreadoPor
        )
      `);
      
    res.status(201).json({ message: 'Actividad agregada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      EmpresaID, ActividadID, Descripcion, ModificadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('ActividadID', sql.Int, parseInt(ActividadID))
      .input('Descripcion', sql.VarChar, Descripcion || '')
      .input('ModificadoPor', sql.Int, ModificadoPor || null)
      .query(`
        UPDATE RHOtros SET 
          ActividadID = @ActividadID,
          Descripcion = @Descripcion,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE OtrosID = @ID AND EmpresaID = @EmpresaID
      `);
      
    res.json({ message: 'Actividad actualizada exitosamente' });
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
      .query(`DELETE FROM RHOtros WHERE OtrosID = @ID AND EmpresaID = @EmpresaID`);
      
    res.json({ message: 'Actividad eliminada exitosamente' });
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
