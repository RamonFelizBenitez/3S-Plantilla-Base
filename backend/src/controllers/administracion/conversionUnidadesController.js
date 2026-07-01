const { sql, connectDB } = require('../../config/db');

exports.getAll = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query('SELECT * FROM UNIDADESCONVERSION WHERE EmpresaID = @empresaId ORDER BY UnidadIdDesde ASC, UnidadIdHasta ASC');
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const pool = await connectDB();
        const { UnidadIdDesde, UnidadIdHasta, Factor, CantidadSumar } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        if (UnidadIdDesde === UnidadIdHasta) {
            return res.status(400).json({ error: 'La unidad origen y destino no pueden ser la misma' });
        }

        await pool.request()
            .input('desde', sql.VarChar, UnidadIdDesde)
            .input('hasta', sql.VarChar, UnidadIdHasta)
            .input('empresaId', sql.Int, empresaId)
            .input('factor', sql.Float, parseFloat(Factor) || 0)
            .input('sumar', sql.Float, parseFloat(CantidadSumar) || 0)
            .input('userId', sql.Int, userId)
            .query(`INSERT INTO UNIDADESCONVERSION (UnidadIdDesde, UnidadIdHasta, EmpresaID, Factor, CantidadSumar, CreadoPor) 
                    VALUES (@desde, @hasta, @empresaId, @factor, @sumar, @userId)`);
        res.json({ message: 'Conversión creada exitosamente' });
    } catch (err) {
        if (err.number === 2627) return res.status(400).json({ error: 'Ya existe una conversión para estas unidades' });
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pool = await connectDB();
        const { idDesde, idHasta } = req.params;
        const { UnidadIdDesde, UnidadIdHasta, Factor, CantidadSumar } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        if (UnidadIdDesde === UnidadIdHasta) {
            return res.status(400).json({ error: 'La unidad origen y destino no pueden ser la misma' });
        }

        await pool.request()
            .input('oldDesde', sql.VarChar, idDesde)
            .input('oldHasta', sql.VarChar, idHasta)
            .input('newDesde', sql.VarChar, UnidadIdDesde)
            .input('newHasta', sql.VarChar, UnidadIdHasta)
            .input('empresaId', sql.Int, empresaId)
            .input('factor', sql.Float, parseFloat(Factor) || 0)
            .input('sumar', sql.Float, parseFloat(CantidadSumar) || 0)
            .input('userId', sql.Int, userId)
            .query(`UPDATE UNIDADESCONVERSION 
                    SET UnidadIdDesde = @newDesde, UnidadIdHasta = @newHasta, Factor = @factor, CantidadSumar = @sumar, ModificadoPor = @userId, FechaModificado = GETDATE()
                    WHERE UnidadIdDesde = @oldDesde AND UnidadIdHasta = @oldHasta AND EmpresaID = @empresaId`);
        res.json({ message: 'Conversión actualizada exitosamente' });
    } catch (err) { 
        if (err.number === 2627) return res.status(400).json({ error: 'Ya existe una conversión para estas unidades' });
        res.status(500).json({ error: err.message }); 
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const pool = await connectDB();
        const { idDesde, idHasta } = req.params;
        const empresaId = req.user?.empresaId || 1;
        
        await pool.request()
            .input('desde', sql.VarChar, idDesde)
            .input('hasta', sql.VarChar, idHasta)
            .input('empresaId', sql.Int, empresaId)
            .query('DELETE FROM UNIDADESCONVERSION WHERE UnidadIdDesde = @desde AND UnidadIdHasta = @hasta AND EmpresaID = @empresaId');
        res.json({ message: 'Eliminada exitosamente' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
