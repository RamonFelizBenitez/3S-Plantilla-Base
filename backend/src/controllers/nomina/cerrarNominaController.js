const { connectDB, sql } = require('../../config/db');

exports.getNominasAbiertas = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .query(`
        SELECT * FROM NMNOMINA 
        WHERE EmpresaID = @EmpresaID AND Posteado = 0
        ORDER BY CodigoPeriodo DESC, NominaNumero DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.cerrarNomina = async (req, res) => {
  try {
    const { empresaId, tipoNominaId, codigoPeriodo, nominaNumero, secuencia, usuario } = req.body;

    if (!empresaId || !tipoNominaId || !codigoPeriodo || !nominaNumero || !secuencia) {
      return res.status(400).json({ message: 'Faltan parámetros clave para identificar la nómina a cerrar.' });
    }

    const pool = await connectDB();
    
    // Solo actualizamos NMNOMINA Posteado a 1
    const result = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .input('TipoNominaID', sql.VarChar, tipoNominaId)
      .input('CodigoPeriodo', sql.Int, parseInt(codigoPeriodo))
      .input('NominaNumero', sql.Int, parseInt(nominaNumero))
      .input('Secuencia', sql.Int, parseInt(secuencia))
      .input('Usuario', sql.VarChar, usuario || 'SYSTEM')
      .query(`
        UPDATE NMNOMINA
        SET Posteado = 1,
            ModificadoPor = @Usuario,
            FechaModificado = GETDATE()
        WHERE EmpresaId = @EmpresaID
          AND TipoNominaId = @TipoNominaID
          AND CodigoPeriodo = @CodigoPeriodo
          AND NominaNumero = @NominaNumero
          AND Secuencia = @Secuencia
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'No se encontró la nómina o ya estaba cerrada.' });
    }

    res.json({ message: 'Nómina cerrada exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
