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
        SELECT d.*, p.Descripcion as ParentescoNombre 
        FROM RHDependienteSolicitante d
        LEFT JOIN RHParentescos p ON d.ParentescoID = p.ParentescoID AND d.EmpresaID = p.EmpresaID
        WHERE d.SolicitudID = @solicitudId AND d.EmpresaID = @empresaId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { 
      EmpresaID, SolicitudID, NombreDependiente, Cedula, 
      ParentescoID, Sexo, FechaNacimiento, AplicaSeguroMedico, CreadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('SolicitudID', sql.Int, parseInt(SolicitudID))
      .input('NombreDependiente', sql.VarChar, NombreDependiente)
      .input('Cedula', sql.VarChar, Cedula || '')
      .input('ParentescoID', sql.Int, parseInt(ParentescoID))
      .input('Sexo', sql.Int, parseInt(Sexo))
      .input('FechaNacimiento', sql.DateTime, new Date(FechaNacimiento))
      .input('AplicaSeguroMedico', sql.Bit, AplicaSeguroMedico ? 1 : 0)
      .input('CreadoPor', sql.Int, CreadoPor || null)
      .query(`
        INSERT INTO RHDependienteSolicitante (
          EmpresaID, SolicitudID, NombreDependiente, Cedula, 
          ParentescoID, Sexo, FechaNacimiento, AplicaSeguroMedico, CreadoPor
        ) VALUES (
          @EmpresaID, @SolicitudID, @NombreDependiente, @Cedula,
          @ParentescoID, @Sexo, @FechaNacimiento, @AplicaSeguroMedico, @CreadoPor
        )
      `);
      
    res.status(201).json({ message: 'Dependiente agregado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      EmpresaID, NombreDependiente, Cedula, 
      ParentescoID, Sexo, FechaNacimiento, AplicaSeguroMedico, ModificadoPor 
    } = req.body;
    
    const pool = await connectDB();

    await pool.request()
      .input('ID', sql.Int, parseInt(id))
      .input('EmpresaID', sql.Int, parseInt(EmpresaID))
      .input('NombreDependiente', sql.VarChar, NombreDependiente)
      .input('Cedula', sql.VarChar, Cedula || '')
      .input('ParentescoID', sql.Int, parseInt(ParentescoID))
      .input('Sexo', sql.Int, parseInt(Sexo))
      .input('FechaNacimiento', sql.DateTime, new Date(FechaNacimiento))
      .input('AplicaSeguroMedico', sql.Bit, AplicaSeguroMedico ? 1 : 0)
      .input('ModificadoPor', sql.Int, ModificadoPor || null)
      .query(`
        UPDATE RHDependienteSolicitante SET 
          NombreDependiente = @NombreDependiente,
          Cedula = @Cedula,
          ParentescoID = @ParentescoID,
          Sexo = @Sexo,
          FechaNacimiento = @FechaNacimiento,
          AplicaSeguroMedico = @AplicaSeguroMedico,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE DependienteSolicitanteID = @ID AND EmpresaID = @EmpresaID
      `);
      
    res.json({ message: 'Dependiente actualizado exitosamente' });
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
      .query(`DELETE FROM RHDependienteSolicitante WHERE DependienteSolicitanteID = @ID AND EmpresaID = @EmpresaID`);
      
    res.json({ message: 'Dependiente eliminado exitosamente' });
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
