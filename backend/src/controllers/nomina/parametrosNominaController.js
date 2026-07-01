const { sql, connectDB } = require('../../config/db');

exports.getParametros = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaId', sql.VarChar, empresaId)
      .query(`SELECT TOP 1 * FROM NMPARAMETROS WHERE EmpresaId = @EmpresaId`);
      
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.json({}); // Parámetros aún no configurados
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.saveParametros = async (req, res) => {
  try {
    const { empresaId, banco, cuentaBanco, usuario } = req.body;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    
    // Check if exists
    const checkResult = await pool.request()
      .input('EmpresaId', sql.VarChar, empresaId)
      .query(`SELECT TOP 1 1 FROM NMPARAMETROS WHERE EmpresaId = @EmpresaId`);
      
    if (checkResult.recordset.length > 0) {
      // Update
      await pool.request()
        .input('EmpresaId', sql.VarChar, empresaId)
        .input('Banco', sql.VarChar, banco || '')
        .input('CuentaBanco', sql.VarChar, cuentaBanco || '')
        .input('ModificadoPor', sql.VarChar, usuario || 'SYSTEM')
        .query(`
          UPDATE NMPARAMETROS
          SET Banco = @Banco,
              CuentaBanco = @CuentaBanco,
              ModificadoPor = @ModificadoPor,
              FechaModificado = GETDATE()
          WHERE EmpresaId = @EmpresaId
        `);
    } else {
      // Insert
      await pool.request()
        .input('EmpresaId', sql.VarChar, empresaId)
        .input('Banco', sql.VarChar, banco || '')
        .input('CuentaBanco', sql.VarChar, cuentaBanco || '')
        .input('CreadoPor', sql.VarChar, usuario || 'SYSTEM')
        .query(`
          INSERT INTO NMPARAMETROS (EmpresaId, Banco, CuentaBanco, CreadoPor, FechaCreado, FechaModificado)
          VALUES (@EmpresaId, @Banco, @CuentaBanco, @CreadoPor, GETDATE(), GETDATE())
        `);
    }

    res.json({ message: 'Parámetros guardados exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
