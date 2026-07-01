const { sql, connectDB } = require('../../config/db');

// Obtener todas las transacciones de un empleado
const getTransacciones = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;

    if (!empleadoId || !empresaId) {
      return res.status(400).json({ message: 'Se requiere empleadoId y empresaId' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpleadoID', sql.VarChar, empleadoId)
      .input('EmpresaId', sql.VarChar, empresaId)
      .query(`
        SELECT t.*, 
               tn.Descripcion as NominaDesc,
               tt.Descripcion as TransDesc
        FROM NMTRANSACCIONES t
        LEFT JOIN NMTIPOSNOMINAS tn ON t.TipoNominaId = tn.TipoNominaID AND t.EmpresaId = tn.EmpresaId
        LEFT JOIN NMTIPOSTRANSACCIONES tt ON t.TipoTransId = tt.TipoTransId AND t.EmpresaId = tt.EmpresaId
        WHERE t.EmpleadoID = @EmpleadoID AND t.EmpresaId = @EmpresaId
        ORDER BY t.Fecha DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear una nueva transacción
const addTransaccion = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;
    const { 
      TipoNovedad, 
      TipoNominaId, 
      TipoTransId, 
      Monto, 
      Abono, 
      Inactiva, 
      Intervalo, 
      Frecuencia,
      Fecha 
    } = req.body;

    if (!empleadoId || !empresaId || TipoNovedad === undefined || !TipoNominaId || !TipoTransId || Monto === undefined || !Fecha) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Inicializaciones lógicas basadas en la novedad
    const balance = Monto; // Inicialmente el balance es el monto
    const acumulado = 0;
    const totalPagado = 0;
    const estatus = 'Activo';

    const isFijaOcasional = TipoNovedad === 0 || TipoNovedad === 1;
    const finalAbono = Abono || 0;
    const finalFrecuencia = isFijaOcasional ? 0 : (Frecuencia || 0);

    const pool = await connectDB();
    await pool.request()
      .input('EmpleadoID', sql.VarChar, empleadoId)
      .input('EmpresaId', sql.VarChar, empresaId)
      .input('TipoNovedad', sql.Int, TipoNovedad)
      .input('TipoNominaId', sql.VarChar, TipoNominaId)
      .input('TipoTransId', sql.VarChar, TipoTransId)
      .input('Balance', sql.Money, balance)
      .input('Acumulado', sql.Money, acumulado)
      .input('Monto', sql.Money, Monto)
      .input('Abono', sql.Money, finalAbono)
      .input('TotalPagado', sql.Money, totalPagado)
      .input('Inactiva', sql.Bit, Inactiva ? 1 : 0)
      .input('Intervalo', sql.Int, Intervalo)
      .input('Frecuencia', sql.Int, finalFrecuencia)
      .input('Estatus', sql.VarChar, estatus)
      .input('Fecha', sql.DateTime, new Date(Fecha))
      .query(`
        INSERT INTO NMTRANSACCIONES (
          EmpleadoID, EmpresaId, TipoNovedad, TipoNominaId, TipoTransId,
          Balance, Acumulado, Monto, Abono, TotalPagado, Inactiva, 
          Intervalo, Frecuencia, Estatus, Fecha, FechaActualizacion,
          CreadoPor, FechaCreado
        ) VALUES (
          @EmpleadoID, @EmpresaId, @TipoNovedad, @TipoNominaId, @TipoTransId,
          @Balance, @Acumulado, @Monto, @Abono, @TotalPagado, @Inactiva,
          @Intervalo, @Frecuencia, @Estatus, @Fecha, GETDATE(),
          'SYSTEM', GETDATE()
        )
      `);

    res.status(201).json({ message: 'Transacción registrada exitosamente' });
  } catch (error) {
    console.error('Error al agregar transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor al agregar transacción' });
  }
};

// Actualizar transacción
const updateTransaccion = async (req, res) => {
  try {
    const { empleadoId, tipoNovedadViejo, lineaNumero } = req.params;
    const { empresaId } = req.query;
    const { 
      TipoNovedad, 
      TipoNominaId, 
      TipoTransId, 
      Monto, 
      Abono, 
      Inactiva, 
      Intervalo, 
      Frecuencia,
      Fecha 
    } = req.body;

    if (!empleadoId || !empresaId || tipoNovedadViejo === undefined || !lineaNumero || TipoNovedad === undefined || !TipoNominaId || !TipoTransId || Monto === undefined || !Fecha) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos para actualizar' });
    }

    const isFijaOcasional = TipoNovedad === 0 || TipoNovedad === 1;
    const finalAbono = Abono || 0;
    const finalFrecuencia = isFijaOcasional ? 0 : (Frecuencia || 0);

    // Si cambia el monto, actualizar el balance asumiendo que es una corrección
    // Lo ideal en sistemas contables es no cambiar el balance si ya hay pagado, 
    // pero al ser un mantenimiento básico, actualizamos el Balance = Monto - Acumulado
    
    const pool = await connectDB();
    await pool.request()
      .input('EmpleadoID', sql.VarChar, empleadoId)
      .input('EmpresaId', sql.VarChar, empresaId)
      .input('TipoNovedadViejo', sql.Int, tipoNovedadViejo)
      .input('LineaNumero', sql.Int, lineaNumero)
      
      .input('TipoNovedadNuevo', sql.Int, TipoNovedad)
      .input('TipoNominaId', sql.VarChar, TipoNominaId)
      .input('TipoTransId', sql.VarChar, TipoTransId)
      .input('Monto', sql.Money, Monto)
      .input('Abono', sql.Money, finalAbono)
      .input('Inactiva', sql.Bit, Inactiva ? 1 : 0)
      .input('Intervalo', sql.Int, Intervalo)
      .input('Frecuencia', sql.Int, finalFrecuencia)
      .input('Fecha', sql.DateTime, new Date(Fecha))
      .query(`
        UPDATE NMTRANSACCIONES 
        SET TipoNovedad = @TipoNovedadNuevo,
            TipoNominaId = @TipoNominaId,
            TipoTransId = @TipoTransId,
            Monto = @Monto,
            Abono = @Abono,
            Inactiva = @Inactiva,
            Intervalo = @Intervalo,
            Frecuencia = @Frecuencia,
            Fecha = @Fecha,
            FechaActualizacion = GETDATE(),
            ModificadoPor = 'SYSTEM',
            FechaModificado = GETDATE(),
            Balance = CASE WHEN Acumulado <= @Monto THEN @Monto - Acumulado ELSE 0 END
        WHERE EmpleadoID = @EmpleadoID AND EmpresaId = @EmpresaId AND TipoNovedad = @TipoNovedadViejo AND LineaNumero = @LineaNumero
      `);

    res.json({ message: 'Transacción actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar transacción' });
  }
};

// Eliminar transacción
const deleteTransaccion = async (req, res) => {
  try {
    const { empleadoId, tipoNovedad, lineaNumero } = req.params;
    const { empresaId } = req.query;

    if (!empleadoId || !empresaId || tipoNovedad === undefined || !lineaNumero) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos' });
    }

    const pool = await connectDB();
    await pool.request()
      .input('EmpleadoID', sql.VarChar, empleadoId)
      .input('EmpresaId', sql.VarChar, empresaId)
      .input('TipoNovedad', sql.Int, tipoNovedad)
      .input('LineaNumero', sql.Int, lineaNumero)
      .query(`
        DELETE FROM NMTRANSACCIONES 
        WHERE EmpleadoID = @EmpleadoID AND EmpresaId = @EmpresaId AND TipoNovedad = @TipoNovedad AND LineaNumero = @LineaNumero
      `);

    res.json({ message: 'Transacción eliminada' });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getTransacciones,
  addTransaccion,
  updateTransaccion,
  deleteTransaccion
};
