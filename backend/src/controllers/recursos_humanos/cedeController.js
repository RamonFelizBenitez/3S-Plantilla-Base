const { sql, connectDB } = require('../../config/db');

// Obtener todas las sedes (RHCEDES)
exports.getCedes = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query(`
        SELECT 
          CedeID, 
          EmpresaID, 
          Descripcion, 
          CreadoPor,
          ModificadoPor,
          FechaCreado,
          FechaModificado
        FROM RHCEDES
        ORDER BY Descripcion ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener sedes:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear una sede
exports.createCede = async (req, res) => {
  const { EmpresaID, Descripcion, CreadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaID', sql.Int, EmpresaID || 1)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('CreadoPor', sql.Int, CreadoPor || 1)
      .query(`
        INSERT INTO RHCEDES (EmpresaID, Descripcion, CreadoPor, FechaCreado, FechaModificado)
        OUTPUT inserted.*
        VALUES (@EmpresaID, @Descripcion, @CreadoPor, GETDATE(), GETDATE())
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear sede:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar una sede
exports.updateCede = async (req, res) => {
  const { id } = req.params;
  const { Descripcion, ModificadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('ModificadoPor', sql.Int, ModificadoPor || 1)
      .query(`
        UPDATE RHCEDES
        SET Descripcion = @Descripcion,
            ModificadoPor = @ModificadoPor,
            FechaModificado = GETDATE()
        OUTPUT inserted.*
        WHERE CedeID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al actualizar sede:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar una sede
exports.deleteCede = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM RHCEDES WHERE CedeID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }

    res.json({ message: 'Sede eliminada' });
  } catch (err) {
    console.error('Error al eliminar sede:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
