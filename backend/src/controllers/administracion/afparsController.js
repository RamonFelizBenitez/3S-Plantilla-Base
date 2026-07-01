const { sql, connectDB } = require('../../config/db');

// Obtener los parámetros NMAFPARS para una empresa
const getAfpars = async (req, res) => {
  try {
    const { EmpresaID } = req.query;
    if (!EmpresaID) {
      return res.status(400).json({ message: 'Se requiere EmpresaID' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .query(`
        SELECT *
        FROM NMAFPARS
        WHERE EmpresaId = @EmpresaID
      `);
    
    // Como es un solo registro por empresa, devolvemos el primero o un objeto vacío si no existe
    res.json(result.recordset[0] || null);
  } catch (error) {
    console.error('Error al obtener parametros AFPARS:', error);
    res.status(500).json({ message: 'Error al obtener parametros de AFPARS' });
  }
};

// Guardar o actualizar los parámetros (UPSERT)
const saveAfpars = async (req, res) => {
  try {
    const { 
      EmpresaId, TOPEAFP, TOPEARS, Riesgo, 
      Pcto1, Pcto2, Pcto3, 
      AportePension, AporteSalud, 
      PatronoAFP, PatronoARS 
    } = req.body;
    
    if (!EmpresaId) {
      return res.status(400).json({ message: 'Se requiere EmpresaId' });
    }

    const pool = await connectDB();

    // Verificamos si existe el registro
    const checkResult = await pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaId)
      .query('SELECT 1 FROM NMAFPARS WHERE EmpresaId = @EmpresaId');
    
    const exists = checkResult.recordset.length > 0;

    const request = pool.request()
      .input('EmpresaId', sql.VarChar, EmpresaId)
      .input('TOPEAFP', sql.Float, TOPEAFP || 0)
      .input('TOPEARS', sql.Float, TOPEARS || 0)
      .input('Riesgo', sql.Float, Riesgo || 0)
      .input('Pcto1', sql.Float, Pcto1 || 0)
      .input('Pcto2', sql.Float, Pcto2 || 0)
      .input('Pcto3', sql.Float, Pcto3 || 0)
      .input('AportePension', sql.Float, AportePension || 0)
      .input('AporteSalud', sql.Float, AporteSalud || 0)
      .input('PatronoAFP', sql.Float, PatronoAFP || 0)
      .input('PatronoARS', sql.Float, PatronoARS || 0)
      .input('ModificadoPor', sql.VarChar, 'SYSTEM');

    if (exists) {
      // UPDATE
      await request
        .input('FechaModificado', sql.DateTime, new Date())
        .query(`
          UPDATE NMAFPARS SET
            TOPEAFP = @TOPEAFP,
            TOPEARS = @TOPEARS,
            Riesgo = @Riesgo,
            Pcto1 = @Pcto1,
            Pcto2 = @Pcto2,
            Pcto3 = @Pcto3,
            AportePension = @AportePension,
            AporteSalud = @AporteSalud,
            PatronoAFP = @PatronoAFP,
            PatronoARS = @PatronoARS,
            ModificadoPor = @ModificadoPor,
            FechaModificado = @FechaModificado
          WHERE EmpresaId = @EmpresaId
        `);
      res.json({ message: 'Parámetros actualizados exitosamente' });
    } else {
      // INSERT
      await request
        .input('CreadoPor', sql.VarChar, 'SYSTEM')
        .query(`
          INSERT INTO NMAFPARS (
            EmpresaId, TOPEAFP, TOPEARS, Riesgo, Pcto1, Pcto2, Pcto3, 
            AportePension, AporteSalud, PatronoAFP, PatronoARS, 
            CreadoPor, ModificadoPor
          ) VALUES (
            @EmpresaId, @TOPEAFP, @TOPEARS, @Riesgo, @Pcto1, @Pcto2, @Pcto3,
            @AportePension, @AporteSalud, @PatronoAFP, @PatronoARS,
            @CreadoPor, @ModificadoPor
          )
        `);
      res.status(201).json({ message: 'Parámetros guardados exitosamente' });
    }
  } catch (error) {
    console.error('Error al guardar AFPARS:', error);
    res.status(500).json({ message: 'Error al guardar parámetros de AFPARS' });
  }
};

module.exports = {
  getAfpars,
  saveAfpars
};
