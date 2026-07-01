const { sql, connectDB } = require('../../config/db');

// Obtener los cargos asignados a una dependencia específica
exports.getCargosAsignados = async (req, res) => {
  const { dependenciaId } = req.params;
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('DependenciaID', sql.VarChar, dependenciaId)
      .query(`
        SELECT 
          DC.DependenciaCargoID,
          DC.DependenciaID,
          DC.CargoID,
          C.Descripcion as CargoDescripcion
        FROM NMDEPENDENCIASCARGOS DC
        INNER JOIN NMCARGOS C ON DC.CargoID = C.CargoID AND DC.EmpresaID = C.EmpresaID
        WHERE DC.DependenciaID = @DependenciaID
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener cargos de la dependencia:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Sincronizar (Asignar) cargos a una dependencia de forma masiva
exports.syncCargos = async (req, res) => {
  const { dependenciaId } = req.params;
  const { cargoIds, CreadoPor } = req.body; // array of CargoID
  
  if (!Array.isArray(cargoIds)) {
    return res.status(400).json({ message: 'Se esperaba un arreglo de cargos' });
  }

  try {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Eliminar todos los cargos previamente asignados a esta dependencia
      await transaction.request()
        .input('DependenciaID', sql.VarChar, dependenciaId)
        .query('DELETE FROM NMDEPENDENCIASCARGOS WHERE DependenciaID = @DependenciaID');

      // 2. Insertar los nuevos cargos
      if (cargoIds.length > 0) {
        // Usaremos inserciones múltiples o un bucle seguro para no exceder limites si son muchos
        const request = transaction.request();
        let insertValues = [];
        cargoIds.forEach((cargoId, index) => {
          request.input(`CargoID_${index}`, sql.VarChar, cargoId);
          insertValues.push(`(@DependenciaID, @CargoID_${index}, @EmpresaID, @CreadoPor, GETDATE())`);
        });

        request.input('DependenciaID', sql.VarChar, dependenciaId);
        request.input('EmpresaID', sql.VarChar, '1'); // Force '1' to match NMCargos
        request.input('CreadoPor', sql.Int, CreadoPor || 1);

        const query = `
          INSERT INTO NMDEPENDENCIASCARGOS (DependenciaID, CargoID, EmpresaID, CreadoPor, FechaCreado)
          VALUES ${insertValues.join(', ')}
        `;
        await request.query(query);
      }

      await transaction.commit();
      res.status(200).json({ message: 'Cargos sincronizados exitosamente' });
    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error('Error al sincronizar cargos:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
