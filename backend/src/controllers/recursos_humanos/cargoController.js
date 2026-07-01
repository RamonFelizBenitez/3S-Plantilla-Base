const { sql, connectDB } = require('../../config/db');

exports.getCargos = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query('SELECT * FROM NMCargos WHERE EmpresaID = @empresaId');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCargo = async (req, res) => {
  try {
    const { CargoID, EmpresaID, Descripcion, CreadoPor } = req.body;
    const pool = await connectDB();
    
    // Check if exists
    const check = await pool.request()
      .input('CargoID', sql.VarChar, CargoID)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .query('SELECT 1 FROM NMCargos WHERE CargoID = @CargoID AND EmpresaID = @EmpresaID');
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ message: 'Este código de Cargo ya existe' });
    }

    await pool.request()
      .input('CargoID', sql.VarChar, CargoID)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('CreadoPor', sql.VarChar, CreadoPor || '')
      .input('ModificadoPor', sql.VarChar, CreadoPor || '')
      .query(`
        INSERT INTO NMCargos (CargoID, EmpresaID, Descripcion, CreadoPor, ModificadoPor) 
        VALUES (@CargoID, @EmpresaID, @Descripcion, @CreadoPor, @ModificadoPor)
      `);
      
    res.status(201).json({ message: 'Cargo creado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const { EmpresaID, Descripcion, ModificadoPor } = req.body;
    
    const pool = await connectDB();
    const result = await pool.request()
      .input('CargoID', sql.VarChar, id)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('ModificadoPor', sql.VarChar, ModificadoPor || '')
      .query(`
        UPDATE NMCargos 
        SET Descripcion = @Descripcion, 
            ModificadoPor = @ModificadoPor, 
            FechaModificado = GETDATE() 
        WHERE CargoID = @CargoID AND EmpresaID = @EmpresaID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    res.json({ message: 'Cargo actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;

    const pool = await connectDB();
    
    // Aquí podrías agregar validaciones para que no se borre si ya hay RHSolicitudes con este CargoID
    const check = await pool.request()
      .input('CargoID', sql.VarChar, id)
      .input('EmpresaID', sql.VarChar, empresaId)
      .query('SELECT TOP 1 1 FROM RHSolicitud WHERE CargoID = @CargoID AND EmpresaID = @EmpresaID');
      
    if (check.recordset.length > 0) {
      return res.status(400).json({ message: 'No se puede eliminar el Cargo porque está siendo utilizado en Solicitudes de Empleo' });
    }

    const result = await pool.request()
      .input('CargoID', sql.VarChar, id)
      .input('EmpresaID', sql.VarChar, empresaId)
      .query('DELETE FROM NMCargos WHERE CargoID = @CargoID AND EmpresaID = @EmpresaID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    res.json({ message: 'Cargo eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
