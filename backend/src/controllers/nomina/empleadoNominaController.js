const { sql, connectDB } = require('../../config/db');

// Obtener tipos de nomina de un empleado
exports.getByEmpleado = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, empleadoId)
      .query(`
        SELECT en.*, tn.Descripcion as TipoNominaDesc
        FROM NMEMPLEADOSNOM en
        LEFT JOIN NMTIPOSNOMINAS tn ON en.TipoNominaId = tn.TipoNominaID AND en.Empresaid = tn.EmpresaID
        WHERE en.Empresaid = @empresaId AND en.EmpleadoID = @empleadoId
        ORDER BY en.FechaInicio DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Asignar un tipo de nomina al empleado
exports.create = async (req, res) => {
  try {
    const { empresaId } = req.query;
    const { EmpleadoID, TipoNominaId, FechaInicio } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();

    // Validar si ya existe
    const existCheck = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, EmpleadoID)
      .input('tipoNominaId', sql.VarChar, TipoNominaId)
      .query(`
        SELECT TOP 1 * FROM NMEMPLEADOSNOM 
        WHERE Empresaid = @empresaId AND EmpleadoID = @empleadoId AND TipoNominaId = @tipoNominaId
      `);

    if (existCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'Este tipo de nómina ya está asignado a este empleado. Por favor, edítelo si desea cambiar la fecha o bórrelo primero.' });
    }

    await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, EmpleadoID)
      .input('tipoNominaId', sql.VarChar, TipoNominaId)
      .input('fechaInicio', sql.DateTime, FechaInicio)
      .query(`
        INSERT INTO NMEMPLEADOSNOM (
          EmpresaId, EmpleadoID, TipoNominaId, FechaInicio, CreadoPor, ModificadoPor, FechaCreado, FechaModificado
        ) VALUES (
          @empresaId, @empleadoId, @tipoNominaId, @fechaInicio, '', '', GETDATE(), GETDATE()
        )
      `);

    res.status(201).json({ message: 'Tipo de nómina asignado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Actualizar la fecha de inicio
exports.update = async (req, res) => {
  try {
    const { empleadoId, tipoNominaId } = req.params;
    const { empresaId } = req.query;
    const { FechaInicio } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('tipoNominaId', sql.VarChar, tipoNominaId)
      .input('fechaInicio', sql.DateTime, FechaInicio)
      .query(`
        UPDATE NMEMPLEADOSNOM
        SET FechaInicio = @fechaInicio, FechaModificado = GETDATE()
        WHERE Empresaid = @empresaId AND EmpleadoID = @empleadoId AND TipoNominaId = @tipoNominaId
      `);

    res.json({ message: 'Fecha de inicio actualizada exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Eliminar un tipo de nómina asignado
exports.remove = async (req, res) => {
  try {
    const { empleadoId, tipoNominaId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('tipoNominaId', sql.VarChar, tipoNominaId)
      .query(`
        DELETE FROM NMEMPLEADOSNOM
        WHERE Empresaid = @empresaId AND EmpleadoID = @empleadoId AND TipoNominaId = @tipoNominaId
      `);

    res.json({ message: 'Tipo de nómina removido exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
