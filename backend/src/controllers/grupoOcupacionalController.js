const { sql, connectDB } = require('../config/db');

// Obtener todos los grupos ocupacionales
exports.getGruposOcupacionales = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query(`
        SELECT 
          GrupoOcupacionalID, 
          EmpresaID, 
          Descripcion, 
          Grupo,
          CreadoPor,
          ModificadoPor,
          FechaCreado,
          FechaModificado
        FROM RHGrupoOcupacional
        ORDER BY Descripcion ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener grupos ocupacionales:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear un grupo ocupacional
exports.createGrupoOcupacional = async (req, res) => {
  const { EmpresaID, Descripcion, Grupo, CreadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaID', sql.Int, EmpresaID || 1)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('Grupo', sql.VarChar, Grupo)
      .input('CreadoPor', sql.Int, CreadoPor || 1)
      .query(`
        INSERT INTO RHGrupoOcupacional (EmpresaID, Descripcion, Grupo, CreadoPor, FechaCreado, FechaModificado)
        OUTPUT inserted.*
        VALUES (@EmpresaID, @Descripcion, @Grupo, @CreadoPor, GETDATE(), GETDATE())
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear grupo ocupacional:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar un grupo ocupacional
exports.updateGrupoOcupacional = async (req, res) => {
  const { id } = req.params;
  const { Descripcion, Grupo, ModificadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('Grupo', sql.VarChar, Grupo)
      .input('ModificadoPor', sql.Int, ModificadoPor || 1)
      .query(`
        UPDATE RHGrupoOcupacional
        SET Descripcion = @Descripcion,
            Grupo = @Grupo,
            ModificadoPor = @ModificadoPor,
            FechaModificado = GETDATE()
        OUTPUT inserted.*
        WHERE GrupoOcupacionalID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Grupo ocupacional no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al actualizar grupo ocupacional:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un grupo ocupacional
exports.deleteGrupoOcupacional = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM RHGrupoOcupacional WHERE GrupoOcupacionalID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Grupo ocupacional no encontrado' });
    }

    res.json({ message: 'Grupo ocupacional eliminado' });
  } catch (err) {
    console.error('Error al eliminar grupo ocupacional:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
