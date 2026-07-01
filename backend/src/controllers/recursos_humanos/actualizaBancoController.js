const { sql, connectDB } = require('../../config/db');

// Obtener todas las solicitudes de un empleado
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
        FROM NMACTUALIZABANCO
        WHERE EmpresaId = @empresaId AND Empleadoid = @empleadoId
        ORDER BY FechaCreado DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Crear nueva solicitud de actualización de banco
exports.create = async (req, res) => {
  try {
    const { empresaId } = req.query;
    const { Empleadoid, Nombre, CuentaBancoAnterior, CuentaBanco } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('empleadoId', sql.VarChar, Empleadoid)
      .input('nombre', sql.VarChar, Nombre)
      .input('cuentaBancoAnterior', sql.VarChar, CuentaBancoAnterior || null)
      .input('cuentaBanco', sql.VarChar, CuentaBanco)
      .query(`
        INSERT INTO NMACTUALIZABANCO (
          EmpresaId, Empleadoid, Nombre, CuentaBancoAnterior, CuentaBanco, Fecha, Estatus, FechaCreado
        ) VALUES (
          @empresaId, @empleadoId, @nombre, @cuentaBancoAnterior, @cuentaBanco, GETDATE(), 0, GETDATE()
        )
      `);

    res.status(201).json({ message: 'Registro creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Procesar solicitud (Actualiza NMEMPLEADOS y marca como procesado)
exports.procesar = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;
    const { Empleadoid, CuentaBanco } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Marcar como procesado en NMACTUALIZABANCO
      await transaction.request()
        .input('id', sql.Int, id)
        .input('empresaId', sql.VarChar, empresaId)
        .query(`
          UPDATE NMACTUALIZABANCO
          SET Estatus = 1, FechaModificado = GETDATE()
          WHERE Actualizabancoid = @id AND EmpresaId = @empresaId
        `);

      // 2. Actualizar la cuenta en NMEMPLEADOS
      await transaction.request()
        .input('empleadoId', sql.VarChar, Empleadoid)
        .input('empresaId', sql.VarChar, empresaId)
        .input('cuentaBanco', sql.VarChar, CuentaBanco)
        .query(`
          UPDATE NMEMPLEADOS
          SET CuentaBanco = @cuentaBanco, FechaModificado = GETDATE()
          WHERE EmpleadoID = @empleadoId AND EmpresaId = @empresaId
        `);

      await transaction.commit();
      res.json({ message: 'Cuenta de banco actualizada y procesada exitosamente' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Error procesando:', err);
    res.status(500).json({ message: err.message });
  }
};
