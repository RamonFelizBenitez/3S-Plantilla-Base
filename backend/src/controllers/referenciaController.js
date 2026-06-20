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
        SELECT *
        FROM RHReferenciaSolicitud
        WHERE SolicitudID = @solicitudId AND EmpresaID = @empresaId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { 
      EmpresaID, SolicitudID, Nombre, Direccion, Telefono, Anios, CreadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('SolicitudID', sql.Int, parseInt(SolicitudID))
      .input('Nombre', sql.VarChar, Nombre)
      .input('Direccion', sql.VarChar, Direccion || '')
      .input('Telefono', sql.VarChar, Telefono || '')
      .input('Anios', sql.Int, parseInt(Anios) || 0)
      .input('CreadoPor', sql.Int, CreadoPor || null)
      .query(`
        INSERT INTO RHReferenciaSolicitud (
          EmpresaID, SolicitudID, Nombre, Direccion, Telefono, Anios, CreadoPor
        ) VALUES (
          @EmpresaID, @SolicitudID, @Nombre, @Direccion, @Telefono, @Anios, @CreadoPor
        )
      `);
      
    res.status(201).json({ message: 'Referencia agregada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      EmpresaID, Nombre, Direccion, Telefono, Anios, ModificadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('Nombre', sql.VarChar, Nombre)
      .input('Direccion', sql.VarChar, Direccion || '')
      .input('Telefono', sql.VarChar, Telefono || '')
      .input('Anios', sql.Int, parseInt(Anios) || 0)
      .input('ModificadoPor', sql.Int, ModificadoPor || null)
      .query(`
        UPDATE RHReferenciaSolicitud SET 
          Nombre = @Nombre,
          Direccion = @Direccion,
          Telefono = @Telefono,
          Anios = @Anios,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE ReferenciaID = @ID AND EmpresaID = @EmpresaID
      `);
      
    res.json({ message: 'Referencia actualizada exitosamente' });
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
      .query(`DELETE FROM RHReferenciaSolicitud WHERE ReferenciaID = @ID AND EmpresaID = @EmpresaID`);
      
    res.json({ message: 'Referencia eliminada exitosamente' });
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
