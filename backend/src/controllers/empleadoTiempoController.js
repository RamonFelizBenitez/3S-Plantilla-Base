const { sql, connectDB } = require('../config/db');

// Obtener todos los registros de tiempo de un empleado
exports.getAll = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({ error: 'empresaId es requerido' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        SELECT 
          EmpleadoID,
          EmpresaId,
          FechaInicial,
          FechaFinal,
          Pension,
          Vacacion,
          Institucion,
          RecordId
        FROM NMEMPLEADOTIEMPO
        WHERE CAST(EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
          AND CAST(EmpresaId AS VARCHAR) = CAST(@empresaId AS VARCHAR)
        ORDER BY FechaInicial DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener tiempo del empleado:', err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo registro de tiempo
exports.create = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;
    const { FechaInicial, FechaFinal, Pension, Vacacion, Institucion } = req.body;

    if (!empresaId) {
      return res.status(400).json({ error: 'empresaId es requerido' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('empresaId', sql.VarChar, empresaId)
      .input('fechaInicial', sql.DateTime, FechaInicial)
      .input('fechaFinal', sql.DateTime, FechaFinal)
      .input('pension', sql.Bit, Pension ? 1 : 0)
      .input('vacacion', sql.Bit, Vacacion ? 1 : 0)
      .input('institucion', sql.VarChar, Institucion)
      .query(`
        INSERT INTO NMEMPLEADOTIEMPO (
          EmpleadoID, EmpresaId, FechaInicial, FechaFinal, Pension, Vacacion, Institucion
        ) VALUES (
          @empleadoId, @empresaId, @fechaInicial, @fechaFinal, @pension, @vacacion, @institucion
        );
        SELECT SCOPE_IDENTITY() AS RecordId;
      `);

    res.status(201).json({ 
      message: 'Registro creado',
      RecordId: result.recordset[0] ? result.recordset[0].RecordId : null
    });
  } catch (err) {
    console.error('Error al crear tiempo del empleado:', err);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un registro existente
exports.update = async (req, res) => {
  try {
    const { empleadoId, recordId } = req.params;
    const { empresaId } = req.query;
    const { FechaInicial, FechaFinal, Pension, Vacacion, Institucion } = req.body;

    if (!empresaId) {
      return res.status(400).json({ error: 'empresaId es requerido' });
    }

    const pool = await connectDB();
    await pool.request()
      .input('recordId', sql.Int, recordId)
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('empresaId', sql.VarChar, empresaId)
      .input('fechaInicial', sql.DateTime, FechaInicial)
      .input('fechaFinal', sql.DateTime, FechaFinal)
      .input('pension', sql.Bit, Pension ? 1 : 0)
      .input('vacacion', sql.Bit, Vacacion ? 1 : 0)
      .input('institucion', sql.VarChar, Institucion)
      .query(`
        UPDATE NMEMPLEADOTIEMPO
        SET 
          FechaInicial = @fechaInicial,
          FechaFinal = @fechaFinal,
          Pension = @pension,
          Vacacion = @vacacion,
          Institucion = @institucion,
          FechaModificado = GETDATE()
        WHERE RecordId = @recordId
          AND CAST(EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
          AND CAST(EmpresaId AS VARCHAR) = CAST(@empresaId AS VARCHAR)
      `);

    res.json({ message: 'Registro actualizado' });
  } catch (err) {
    console.error('Error al actualizar tiempo del empleado:', err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un registro de tiempo
exports.delete = async (req, res) => {
  try {
    const { empleadoId, recordId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({ error: 'empresaId es requerido' });
    }

    const pool = await connectDB();
    await pool.request()
      .input('recordId', sql.Int, recordId)
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        DELETE FROM NMEMPLEADOTIEMPO
        WHERE RecordId = @recordId
          AND CAST(EmpleadoID AS VARCHAR) = CAST(@empleadoId AS VARCHAR)
          AND CAST(EmpresaId AS VARCHAR) = CAST(@empresaId AS VARCHAR)
      `);

    res.json({ message: 'Registro eliminado' });
  } catch (err) {
    console.error('Error al eliminar tiempo del empleado:', err);
    res.status(500).json({ error: err.message });
  }
};
