const { sql, connectDB } = require('../../config/db');

// Obtener todas las solicitudes de salario de un empleado
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
        SELECT *
        FROM NMACTUALIZASUELDO
        WHERE EmpresaId = @empresaId AND Empleadoid = @empleadoId
        ORDER BY FechaCreado DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Obtener sueldo actual activo
exports.getSueldoActual = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, empleadoId)
      .query(`
        SELECT TOP 1 Valor 
        FROM RHpercep
        WHERE EmpresaID = @empresaId 
          AND EmpleadoID = @empleadoId 
          AND SueldoActivo = 1
        ORDER BY FechaInicio DESC
      `);
      
    if (result.recordset.length > 0) {
      res.json({ sueldo: result.recordset[0].Valor });
    } else {
      res.json({ sueldo: 0 });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Crear nueva solicitud de actualización de salario
exports.create = async (req, res) => {
  try {
    const { empresaId } = req.query;
    const { Empleadoid, Nombre, SueldoActual, SueldoPropuesto, FechaInicio } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, Empleadoid)
      .input('nombre', sql.VarChar, Nombre)
      .input('sueldoActual', sql.Decimal(12, 2), SueldoActual || 0)
      .input('sueldoPropuesto', sql.Decimal(12, 2), SueldoPropuesto)
      .input('fechaInicio', sql.DateTime, FechaInicio)
      .query(`
        INSERT INTO NMACTUALIZASUELDO (
          EmpresaId, Empleadoid, Nombre, SueldoActual, SueldoPropuesto, FechaInicio, Estatus, FechaCreado
        ) VALUES (
          @empresaId, @empleadoId, @nombre, @sueldoActual, @sueldoPropuesto, @fechaInicio, 0, GETDATE()
        )
      `);

    res.status(201).json({ message: 'Registro creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Procesar solicitud (Actualiza RHpercep y marca como procesado)
exports.procesar = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    const { Empleadoid, SueldoPropuesto, FechaInicio } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Desactivar sueldos activos anteriores
      await transaction.request()
        .input('empleadoId', sql.VarChar, Empleadoid)
        .input('empresaId', sql.VarChar, empresaId)
        .query(`
          UPDATE RHpercep
          SET SueldoActivo = 0, FechaFin = GETDATE(), FechaModificado = GETDATE()
          WHERE EmpleadoID = @empleadoId AND EmpresaID = @empresaId AND SueldoActivo = 1
        `);

      // 2. Insertar nuevo sueldo en RHpercep
      await transaction.request()
        .input('empresaId', sql.VarChar, empresaId)
        .input('empleadoId', sql.VarChar, Empleadoid)
        .input('fechaInicio', sql.DateTime, FechaInicio)
        .input('sueldoPropuesto', sql.Decimal(12, 2), SueldoPropuesto)
        .query(`
          INSERT INTO RHpercep (
            EmpresaID, EmpleadoID, FechaInicio, FechaFin, SueldoActivo, Valor, NombreDevengo, FechaCreado
          ) VALUES (
            @empresaId, @empleadoId, @fechaInicio, '1999-01-01', 1, @sueldoPropuesto, 'SUELDO BASE', GETDATE()
          )
        `);

      // 3. Marcar como procesado en NMACTUALIZASUELDO
      await transaction.request()
        .input('id', sql.Int, id)
        .input('empresaId', sql.VarChar, empresaId)
        .query(`
          UPDATE NMACTUALIZASUELDO
          SET Estatus = 1, FechaModificado = GETDATE()
          WHERE Actualizasueldoid = @id AND EmpresaId = @empresaId
        `);

      await transaction.commit();
      res.json({ message: 'Salario procesado y actualizado exitosamente' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error procesando salario:', err);
    res.status(500).json({ message: err.message });
  }
};
