const { sql, connectDB } = require('../config/db');

const TIPO_BASES = {
  'Designacion': 10,
  'Cambios': 20,
  'Separacion': 30,
  'Amonestacion': 40,
  'Vacaciones': 50,
  'Ausencias': 60
};

// Obtener todas las acciones
exports.getTipoAcciones = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .query(`
        SELECT 
          TipoAccionID, 
          EmpresaID, 
          Descripcion, 
          Tipo,
          CreadoPor,
          ModificadoPor,
          FechaCreado,
          FechaModificado
        FROM RHTIPOACCIONES
        ORDER BY Tipo ASC, TipoAccionID ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener tipos de acciones:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear una accion
exports.createTipoAccion = async (req, res) => {
  const { EmpresaID, Descripcion, Tipo, CreadoPor } = req.body;
  try {
    if (!TIPO_BASES[Tipo]) {
      return res.status(400).json({ message: 'Tipo no válido' });
    }

    const base = TIPO_BASES[Tipo];
    const maxLimit = base + 9;

    const pool = await connectDB();

    // Buscar el ID máximo actual en el rango de ese Tipo
    const maxResult = await pool.request()
      .input('Base', sql.Int, base)
      .input('MaxLimit', sql.Int, maxLimit)
      .query('SELECT MAX(TipoAccionID) as MaxID FROM RHTIPOACCIONES WHERE TipoAccionID >= @Base AND TipoAccionID <= @MaxLimit');
    
    let nextID = base;
    if (maxResult.recordset[0].MaxID !== null) {
      nextID = maxResult.recordset[0].MaxID + 1;
    }

    if (nextID > maxLimit) {
      return res.status(400).json({ message: 'Límite de 10 acciones alcanzado para este tipo' });
    }

    const result = await pool.request()
      .input('TipoAccionID', sql.Int, nextID)
      .input('EmpresaID', sql.Int, EmpresaID || 1)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('Tipo', sql.VarChar, Tipo)
      .input('CreadoPor', sql.Int, CreadoPor || 1)
      .query(`
        INSERT INTO RHTIPOACCIONES (TipoAccionID, EmpresaID, Descripcion, Tipo, CreadoPor, FechaCreado, FechaModificado)
        OUTPUT inserted.*
        VALUES (@TipoAccionID, @EmpresaID, @Descripcion, @Tipo, @CreadoPor, GETDATE(), GETDATE())
      `);
      
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear tipo de acción:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar
exports.updateTipoAccion = async (req, res) => {
  const { id } = req.params;
  const { Descripcion, ModificadoPor } = req.body;
  try {
    // Nota: El 'Tipo' no se actualiza porque determina el ID
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('ModificadoPor', sql.Int, ModificadoPor || 1)
      .query(`
        UPDATE RHTIPOACCIONES
        SET Descripcion = @Descripcion,
            ModificadoPor = @ModificadoPor,
            FechaModificado = GETDATE()
        OUTPUT inserted.*
        WHERE TipoAccionID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Tipo de acción no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al actualizar tipo de acción:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar
exports.deleteTipoAccion = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM RHTIPOACCIONES WHERE TipoAccionID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Tipo de acción no encontrado' });
    }

    res.json({ message: 'Tipo de acción eliminado' });
  } catch (err) {
    console.error('Error al eliminar tipo de acción:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
