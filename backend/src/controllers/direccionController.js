const { sql, connectDB } = require('../config/db');

// Obtener todas las direcciones
exports.getDirecciones = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query(`
        SELECT 
          DireccionID, 
          EmpresaID, 
          Descripcion, 
          CreadoPor,
          ModificadoPor,
          FechaCreado,
          FechaModificado
        FROM NMDIRECCIONES
        ORDER BY DireccionID ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener direcciones:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear una direccion
exports.createDireccion = async (req, res) => {
  const { DireccionID, EmpresaID, Descripcion, CreadoPor } = req.body;
  try {
    if (!DireccionID) {
      return res.status(400).json({ message: 'El ID de Dirección es requerido' });
    }

    const pool = await connectDB();
    
    // Verificar si ya existe
    const checkResult = await pool.request()
      .input('DireccionID', sql.VarChar, DireccionID)
      .query('SELECT 1 FROM NMDIRECCIONES WHERE DireccionID = @DireccionID');
      
    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Este código de Dirección ya existe' });
    }

    const result = await pool.request()
      .input('DireccionID', sql.VarChar, DireccionID)
      .input('EmpresaID', sql.Int, EmpresaID || 1)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('CreadoPor', sql.Int, CreadoPor || 1)
      .query(`
        INSERT INTO NMDIRECCIONES (DireccionID, EmpresaID, Descripcion, CreadoPor, FechaCreado, FechaModificado)
        OUTPUT inserted.*
        VALUES (@DireccionID, @EmpresaID, @Descripcion, @CreadoPor, GETDATE(), GETDATE())
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear direccion:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar una direccion
exports.updateDireccion = async (req, res) => {
  const { id } = req.params;
  const { Descripcion, ModificadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.VarChar, id)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('ModificadoPor', sql.Int, ModificadoPor || 1)
      .query(`
        UPDATE NMDIRECCIONES
        SET Descripcion = @Descripcion,
            ModificadoPor = @ModificadoPor,
            FechaModificado = GETDATE()
        OUTPUT inserted.*
        WHERE DireccionID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al actualizar direccion:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar una direccion
exports.deleteDireccion = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.VarChar, id)
      .query('DELETE FROM NMDIRECCIONES WHERE DireccionID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    res.json({ message: 'Dirección eliminada' });
  } catch (err) {
    console.error('Error al eliminar direccion:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
