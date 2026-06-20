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
        SELECT e.*, 
               n.Descripcion as NivelAcademicoNombre,
               t.Descripcion as TituloAcademicoNombre
        FROM RHEducacionSolicitante e
        LEFT JOIN RHNivelesAcademicos n ON e.NivelAcademicoID = n.NivelAcademicoID AND e.EmpresaID = n.EmpresaID
        LEFT JOIN RHTitulosAcademicos t ON e.TituloAcademicoID = t.TituloAcademicoID AND e.EmpresaID = t.EmpresaID
        WHERE e.SolicitudID = @solicitudId AND e.EmpresaID = @empresaId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { 
      EmpresaID, SolicitudID, NivelAcademicoID, AnoTitulacion, 
      TituloAcademicoID, InstitucionAcademica, CreadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('SolicitudID', sql.Int, parseInt(SolicitudID))
      .input('NivelAcademicoID', sql.Int, parseInt(NivelAcademicoID))
      .input('AnoTitulacion', sql.Int, parseInt(AnoTitulacion))
      .input('TituloAcademicoID', sql.Int, parseInt(TituloAcademicoID))
      .input('InstitucionAcademica', sql.VarChar, InstitucionAcademica)
      .input('CreadoPor', sql.Int, CreadoPor || null)
      .query(`
        INSERT INTO RHEducacionSolicitante (
          EmpresaID, SolicitudID, NivelAcademicoID, AnoTitulacion, 
          TituloAcademicoID, InstitucionAcademica, CreadoPor
        ) VALUES (
          @EmpresaID, @SolicitudID, @NivelAcademicoID, @AnoTitulacion,
          @TituloAcademicoID, @InstitucionAcademica, @CreadoPor
        )
      `);
      
    res.status(201).json({ message: 'Educación agregada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      EmpresaID, NivelAcademicoID, AnoTitulacion, 
      TituloAcademicoID, InstitucionAcademica, ModificadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('NivelAcademicoID', sql.Int, parseInt(NivelAcademicoID))
      .input('AnoTitulacion', sql.Int, parseInt(AnoTitulacion))
      .input('TituloAcademicoID', sql.Int, parseInt(TituloAcademicoID))
      .input('InstitucionAcademica', sql.VarChar, InstitucionAcademica)
      .input('ModificadoPor', sql.Int, ModificadoPor || null)
      .query(`
        UPDATE RHEducacionSolicitante SET 
          NivelAcademicoID = @NivelAcademicoID,
          AnoTitulacion = @AnoTitulacion,
          TituloAcademicoID = @TituloAcademicoID,
          InstitucionAcademica = @InstitucionAcademica,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE EducacionSolicitanteID = @ID AND EmpresaID = @EmpresaID
      `);
      
    res.json({ message: 'Educación actualizada exitosamente' });
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
      .query(`DELETE FROM RHEducacionSolicitante WHERE EducacionSolicitanteID = @ID AND EmpresaID = @EmpresaID`);
      
    res.json({ message: 'Educación eliminada exitosamente' });
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
