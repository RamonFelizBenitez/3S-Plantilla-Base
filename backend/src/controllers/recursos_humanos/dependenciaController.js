const { sql, connectDB } = require('../../config/db');

// Obtener todas las dependencias de una direccion
exports.getDependenciasByDireccion = async (req, res) => {
  const { direccionId } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('DireccionID', sql.VarChar, direccionId)
      .query(`
        SELECT 
          DependenciaID, 
          DireccionID,
          EmpresaID, 
          Descripcion, 
          CreadoPor,
          ModificadoPor,
          FechaCreado,
          FechaModificado
        FROM NMDEPENDENCIAS
        WHERE DireccionID = @DireccionID
        ORDER BY DependenciaID ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener dependencias:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear una dependencia
exports.createDependencia = async (req, res) => {
  const { direccionId } = req.params;
  const { DependenciaID, EmpresaID, Descripcion, CreadoPor } = req.body;
  
  try {
    if (!DependenciaID || !Descripcion) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Regla de Negocio (Opción A): El DependenciaID debe empezar con los primeros 2 dígitos del DireccionID
    const prefijoRequerido = String(direccionId).substring(0, 2);
    if (!String(DependenciaID).startsWith(prefijoRequerido)) {
      return res.status(400).json({ 
        message: `El código de la dependencia debe iniciar con "${prefijoRequerido}" (rango de la dirección actual)` 
      });
    }

    const pool = await connectDB();
    
    // Verificar si ya existe
    const checkResult = await pool.request()
      .input('DependenciaID', sql.VarChar, DependenciaID)
      .query('SELECT 1 FROM NMDEPENDENCIAS WHERE DependenciaID = @DependenciaID');
      
    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Este código de Dependencia ya existe' });
    }

    const result = await pool.request()
      .input('DependenciaID', sql.VarChar, DependenciaID)
      .input('DireccionID', sql.VarChar, direccionId)
      .input('EmpresaID', sql.Int, EmpresaID || 1)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('CreadoPor', sql.Int, CreadoPor || 1)
      .query(`
        INSERT INTO NMDEPENDENCIAS (DependenciaID, DireccionID, EmpresaID, Descripcion, CreadoPor, FechaCreado, FechaModificado)
        OUTPUT inserted.*
        VALUES (@DependenciaID, @DireccionID, @EmpresaID, @Descripcion, @CreadoPor, GETDATE(), GETDATE())
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error al crear dependencia:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar una dependencia (solo descripcion)
exports.updateDependencia = async (req, res) => {
  const { id } = req.params; // DependenciaID
  const { Descripcion, ModificadoPor } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.VarChar, id)
      .input('Descripcion', sql.VarChar, Descripcion)
      .input('ModificadoPor', sql.Int, ModificadoPor || 1)
      .query(`
        UPDATE NMDEPENDENCIAS
        SET Descripcion = @Descripcion,
            ModificadoPor = @ModificadoPor,
            FechaModificado = GETDATE()
        OUTPUT inserted.*
        WHERE DependenciaID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Dependencia no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al actualizar dependencia:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar una dependencia
exports.deleteDependencia = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('ID', sql.VarChar, id)
      .query('DELETE FROM NMDEPENDENCIAS WHERE DependenciaID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Dependencia no encontrada' });
    }

    res.json({ message: 'Dependencia eliminada' });
  } catch (err) {
    console.error('Error al eliminar dependencia:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
