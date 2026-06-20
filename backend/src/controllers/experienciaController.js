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
        FROM RHExperienciaLaboralSolicitante
        WHERE SolicitudID = @solicitudId AND EmpresaID = @empresaId
        ORDER BY FechaFinal DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { 
      EmpresaID, SolicitudID, InstitucionLabor, Direccion, 
      Telefono, UltimoSueldo, FechaInicial, FechaFinal, 
      CreadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('SolicitudID', sql.Int, parseInt(SolicitudID))
      .input('InstitucionLabor', sql.VarChar, InstitucionLabor)
      .input('Direccion', sql.VarChar, Direccion || '')
      .input('Telefono', sql.VarChar, Telefono || '')
      .input('UltimoSueldo', sql.Decimal(18,2), parseFloat(UltimoSueldo) || 0)
      .input('FechaInicial', sql.DateTime, new Date(FechaInicial))
      .input('FechaFinal', sql.DateTime, new Date(FechaFinal))
      .input('CreadoPor', sql.Int, CreadoPor || null)
      .query(`
        INSERT INTO RHExperienciaLaboralSolicitante (
          EmpresaID, SolicitudID, InstitucionLabor, Direccion, 
          Telefono, UltimoSueldo, FechaInicial, FechaFinal, CreadoPor
        ) VALUES (
          @EmpresaID, @SolicitudID, @InstitucionLabor, @Direccion,
          @Telefono, @UltimoSueldo, @FechaInicial, @FechaFinal, @CreadoPor
        )
      `);
      
    res.status(201).json({ message: 'Experiencia laboral agregada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      EmpresaID, InstitucionLabor, Direccion, 
      Telefono, UltimoSueldo, FechaInicial, FechaFinal, 
      ModificadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('InstitucionLabor', sql.VarChar, InstitucionLabor)
      .input('Direccion', sql.VarChar, Direccion || '')
      .input('Telefono', sql.VarChar, Telefono || '')
      .input('UltimoSueldo', sql.Decimal(18,2), parseFloat(UltimoSueldo) || 0)
      .input('FechaInicial', sql.DateTime, new Date(FechaInicial))
      .input('FechaFinal', sql.DateTime, new Date(FechaFinal))
      .input('ModificadoPor', sql.Int, ModificadoPor || null)
      .query(`
        UPDATE RHExperienciaLaboralSolicitante SET 
          InstitucionLabor = @InstitucionLabor,
          Direccion = @Direccion,
          Telefono = @Telefono,
          UltimoSueldo = @UltimoSueldo,
          FechaInicial = @FechaInicial,
          FechaFinal = @FechaFinal,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE ExperienciaLaboralSolicitudID = @ID AND EmpresaID = @EmpresaID
      `);
      
    res.json({ message: 'Experiencia laboral actualizada exitosamente' });
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
      .query(`DELETE FROM RHExperienciaLaboralSolicitante WHERE ExperienciaLaboralSolicitudID = @ID AND EmpresaID = @EmpresaID`);
      
    res.json({ message: 'Experiencia laboral eliminada exitosamente' });
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
