const { sql, connectDB } = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query('SELECT * FROM UNIDADESMEDIDA WHERE EmpresaID = @empresaId ORDER BY UnidadId ASC');
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const pool = await connectDB();
        const { UnidadId, Descripcion, Decimales } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        await pool.request()
            .input('id', sql.VarChar, UnidadId)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, Descripcion || '')
            .input('decimales', sql.Int, parseInt(Decimales) || 0)
            .input('userId', sql.Int, userId)
            .query(`INSERT INTO UNIDADESMEDIDA (UnidadId, EmpresaID, Descripcion, Decimales, CreadoPor) 
                    VALUES (@id, @empresaId, @desc, @decimales, @userId)`);
        res.json({ message: 'Unidad de medida creada exitosamente' });
    } catch (err) {
        if (err.number === 2627) return res.status(400).json({ error: 'El ID ya existe' });
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Descripcion, Decimales } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, Descripcion || '')
            .input('decimales', sql.Int, parseInt(Decimales) || 0)
            .input('userId', sql.Int, userId)
            .query(`UPDATE UNIDADESMEDIDA SET Descripcion = @desc, Decimales = @decimales, ModificadoPor = @userId, FechaModificado = GETDATE()
                    WHERE UnidadId = @id AND EmpresaID = @empresaId`);
        res.json({ message: 'Unidad de medida actualizada exitosamente' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRecord = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const empresaId = req.user?.empresaId || 1;
        
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query('DELETE FROM UNIDADESMEDIDA WHERE UnidadId = @id AND EmpresaID = @empresaId');
        res.json({ message: 'Eliminada exitosamente' });
    } catch (err) { 
        if (err.number === 547) return res.status(400).json({ error: 'Está en uso en otras tablas' });
        res.status(500).json({ error: err.message }); 
    }
};
