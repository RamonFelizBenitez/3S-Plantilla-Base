const { sql, connectDB } = require('../../config/db');

exports.getAll = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .query(`SELECT * FROM NMTIPOSTRANSACCIONES WHERE EmpresaId = @empresaId ORDER BY TipoTransId ASC`);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { empresaId } = req.query;
    const { TipoTransId, Descripcion, Tipo, ISR, AFP, ARS, Excento, Dependiente, Salario, EsIncentivo } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();

    const existCheck = await pool.request()
      .input('empresaId', sql.VarChar, empresaId)
      .input('tipoTransId', sql.VarChar, TipoTransId)
      .query(`SELECT TOP 1 * FROM NMTIPOSTRANSACCIONES WHERE EmpresaId = @empresaId AND TipoTransId = @tipoTransId`);

    if (existCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'El código de tipo de transacción ya existe.' });
    }

    await pool.request()
      .input('tipoTransId', sql.VarChar, TipoTransId)
      .input('empresaId', sql.VarChar, empresaId)
      .input('descripcion', sql.VarChar, Descripcion)
      .input('tipo', sql.Int, Tipo)
      .input('isr', sql.Bit, ISR)
      .input('afp', sql.Bit, AFP)
      .input('ars', sql.Bit, ARS)
      .input('excento', sql.Bit, Excento)
      .input('dependiente', sql.Bit, Dependiente)
      .input('salario', sql.Bit, Salario)
      .input('esincentivo', sql.Bit, EsIncentivo)
      .query(`
        INSERT INTO NMTIPOSTRANSACCIONES (
          TipoTransId, EmpresaId, Descripcion, Tipo, ISR, AFP, ARS, Excento, Dependiente, Salario, EsIncentivo,
          CreadoPor, ModificadoPor, FechaCreado, FechaModificado
        ) VALUES (
          @tipoTransId, @empresaId, @descripcion, @tipo, @isr, @afp, @ars, @excento, @dependiente, @salario, @esincentivo,
          '', '', GETDATE(), GETDATE()
        )
      `);

    res.status(201).json({ message: 'Tipo de transacción creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params; // es TipoTransId
    const { empresaId } = req.query;
    const { Descripcion, Tipo, ISR, AFP, ARS, Excento, Dependiente, Salario, EsIncentivo } = req.body;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('tipoTransId', sql.VarChar, id)
      .input('empresaId', sql.VarChar, empresaId)
      .input('descripcion', sql.VarChar, Descripcion)
      .input('tipo', sql.Int, Tipo)
      .input('isr', sql.Bit, ISR)
      .input('afp', sql.Bit, AFP)
      .input('ars', sql.Bit, ARS)
      .input('excento', sql.Bit, Excento)
      .input('dependiente', sql.Bit, Dependiente)
      .input('salario', sql.Bit, Salario)
      .input('esincentivo', sql.Bit, EsIncentivo)
      .query(`
        UPDATE NMTIPOSTRANSACCIONES
        SET Descripcion = @descripcion, 
            Tipo = @tipo, 
            ISR = @isr, 
            AFP = @afp, 
            ARS = @ars, 
            Excento = @excento, 
            Dependiente = @dependiente,
            Salario = @salario,
            EsIncentivo = @esincentivo,
            FechaModificado = GETDATE()
        WHERE EmpresaId = @empresaId AND TipoTransId = @tipoTransId
      `);

    res.json({ message: 'Tipo de transacción actualizado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    await pool.request()
      .input('tipoTransId', sql.VarChar, id)
      .input('empresaId', sql.VarChar, empresaId)
      .query(`DELETE FROM NMTIPOSTRANSACCIONES WHERE EmpresaId = @empresaId AND TipoTransId = @tipoTransId`);

    res.json({ message: 'Tipo de transacción eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
