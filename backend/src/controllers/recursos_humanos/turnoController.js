const { sql, connectDB } = require('../../config/db');

// Obtener todos los turnos
exports.getTurnos = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query(`
        SELECT 
          TurnoID, 
          EmpresaID, 
          Descripcion, 
          CreadoPor,
          ModificadoPor,
          FechaCreado,
          FechaModificado
        FROM RHTURNOS
        ORDER BY Descripcion ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener turnos:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear un turno
exports.createTurno = async (req, res) => {
  const { EmpresaID, Descripcion, CreadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaID', sql.Int, EmpresaID || 1)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('CreadoPor', sql.Int, CreadoPor || 1)
      .query(`
        INSERT INTO RHTURNOS (EmpresaID, Descripcion, CreadoPor, FechaCreado, FechaModificado)
        OUTPUT inserted.*
        VALUES (@EmpresaID, @Descripcion, @CreadoPor, GETDATE(), GETDATE())
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear turno:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar un turno
exports.updateTurno = async (req, res) => {
  const { id } = req.params;
  const { Descripcion, ModificadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('ModificadoPor', sql.Int, ModificadoPor || 1)
      .query(`
        UPDATE RHTURNOS
        SET Descripcion = @Descripcion,
            ModificadoPor = @ModificadoPor,
            FechaModificado = GETDATE()
        OUTPUT inserted.*
        WHERE TurnoID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al actualizar turno:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un turno
exports.deleteTurno = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM RHTURNOS WHERE TurnoID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    res.json({ message: 'Turno eliminado' });
  } catch (err) {
    console.error('Error al eliminar turno:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
