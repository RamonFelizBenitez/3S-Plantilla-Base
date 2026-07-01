const { sql, connectDB } = require('../../config/db');

// Obtener todos los registros ISR activos (año 9999)
const getISRs = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT 
        i.Ident,
        i.EmpresaID,
        i.TipoTransID,
        t.Descripcion as TipoTransDescripcion,
        i.SueldoInicial,
        i.SueldoFinal,
        i.Valor,
        i.Base,
        i.FechaInicial,
        i.FechaFinal
      FROM NMISR i
      LEFT JOIN NMTIPOSTRANSACCIONES t ON i.TipoTransID = t.TipoTransId AND i.EmpresaID = t.EmpresaId
      WHERE YEAR(i.FechaFinal) = 9999
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener ISRs:', error);
    res.status(500).json({ message: 'Error al obtener registros ISR' });
  }
};

// Crear un nuevo registro ISR
const createISR = async (req, res) => {
  try {
    const { EmpresaID, TipoTransID, SueldoInicial, SueldoFinal, Valor, Base, FechaInicial, FechaFinal } = req.body;
    
    if (!EmpresaID) {
      return res.status(400).json({ message: 'Faltan datos requeridos (EmpresaID)' });
    }

    const pool = await connectDB();

    // Calcular próximo Ident
    const nextIdResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .query(`SELECT COALESCE(MAX(Ident), 0) + 1 as NextIdent FROM NMISR WHERE EmpresaID = @EmpresaID`);
    
    const nextIdent = nextIdResult.recordset[0].NextIdent;
    
    // Parse FechaFinal to a valid Date object to avoid SQL errors
    let finalDate;
    try {
      finalDate = FechaFinal ? new Date(FechaFinal) : new Date('9999-12-31T23:59:59');
      // If it's invalid date, fallback to 9999
      if (isNaN(finalDate.getTime())) {
        finalDate = new Date('9999-12-31T23:59:59');
      }
    } catch (e) {
      finalDate = new Date('9999-12-31T23:59:59');
    }

    let initialDate = null;
    if (FechaInicial) {
      initialDate = new Date(FechaInicial);
      if (isNaN(initialDate.getTime())) initialDate = null;
    }

    await pool.request()
      .input('Ident', sql.Int, nextIdent)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('TipoTransID', sql.VarChar, TipoTransID || null)
      .input('SueldoInicial', sql.Money, SueldoInicial || null)
      .input('SueldoFinal', sql.Money, SueldoFinal || null)
      .input('Valor', sql.Money, Valor || null)
      .input('Base', sql.Money, Base || null)
      .input('FechaInicial', sql.DateTime, initialDate)
      .input('FechaFinal', sql.DateTime, finalDate)
      .input('CreadoPor', sql.VarChar, 'SYSTEM')
      .input('ModificadoPor', sql.VarChar, 'SYSTEM')
      .query(`
        INSERT INTO NMISR (
          Ident, EmpresaID, TipoTransID, SueldoInicial, SueldoFinal, Valor, Base, 
          FechaInicial, FechaFinal, CreadoPor, ModificadoPor
        ) VALUES (
          @Ident, @EmpresaID, @TipoTransID, @SueldoInicial, @SueldoFinal, @Valor, @Base, 
          @FechaInicial, @FechaFinal, @CreadoPor, @ModificadoPor
        )
      `);

    res.status(201).json({ message: 'Registro ISR creado exitosamente', Ident: nextIdent });
  } catch (error) {
    console.error('Error al crear ISR:', error);
    res.status(500).json({ message: 'Error al crear registro ISR' });
  }
};

// Actualizar un registro ISR
const updateISR = async (req, res) => {
  try {
    const { id } = req.params; // id será el Ident
    const { EmpresaID, TipoTransID, SueldoInicial, SueldoFinal, Valor, Base, FechaInicial, FechaFinal } = req.body;
    
    if (!EmpresaID) {
      return res.status(400).json({ message: 'Faltan datos requeridos (EmpresaID)' });
    }

    const pool = await connectDB();
    
    let finalDate = null;
    if (FechaFinal) {
      finalDate = new Date(FechaFinal);
      if (isNaN(finalDate.getTime())) finalDate = null;
    }

    let initialDate = null;
    if (FechaInicial) {
      initialDate = new Date(FechaInicial);
      if (isNaN(initialDate.getTime())) initialDate = null;
    }
    
    const updateResult = await pool.request()
      .input('Ident', sql.Int, id)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('TipoTransID', sql.VarChar, TipoTransID || null)
      .input('SueldoInicial', sql.Money, SueldoInicial || null)
      .input('SueldoFinal', sql.Money, SueldoFinal || null)
      .input('Valor', sql.Money, Valor || null)
      .input('Base', sql.Money, Base || null)
      .input('FechaInicial', sql.DateTime, initialDate)
      .input('FechaFinal', sql.DateTime, finalDate)
      .input('ModificadoPor', sql.VarChar, 'SYSTEM')
      .input('FechaModificado', sql.DateTime, new Date())
      .query(`
        UPDATE NMISR
        SET 
          TipoTransID = @TipoTransID,
          SueldoInicial = @SueldoInicial,
          SueldoFinal = @SueldoFinal,
          Valor = @Valor,
          Base = @Base,
          FechaInicial = @FechaInicial,
          FechaFinal = @FechaFinal,
          ModificadoPor = @ModificadoPor,
          FechaModificado = @FechaModificado
        WHERE Ident = @Ident AND EmpresaID = @EmpresaID
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro ISR no encontrado' });
    }

    res.json({ message: 'Registro ISR actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar ISR:', error);
    res.status(500).json({ message: 'Error al actualizar registro ISR' });
  }
};

// Eliminar un registro ISR
const deleteISR = async (req, res) => {
  try {
    const { id } = req.params;
    const { EmpresaID } = req.query; // Lo recibimos como query param

    if (!EmpresaID) {
      return res.status(400).json({ message: 'Faltan datos requeridos (EmpresaID)' });
    }

    const pool = await connectDB();
    
    const result = await pool.request()
      .input('Ident', sql.Int, id)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .query(`
        DELETE FROM NMISR 
        WHERE Ident = @Ident AND EmpresaID = @EmpresaID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Registro ISR no encontrado' });
    }

    res.json({ message: 'Registro ISR eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ISR:', error);
    res.status(500).json({ message: 'Error al eliminar registro ISR' });
  }
};

module.exports = {
  getISRs,
  createISR,
  updateISR,
  deleteISR
};
