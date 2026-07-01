const { sql, connectDB } = require('../../config/db');

exports.getAll = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query('SELECT * FROM MGCentroCostos WHERE EmpresaID = @empresaId ORDER BY CentroCostoID ASC');
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const pool = await connectDB();
        const { CentroCostoID, CCostosDescripcion } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        await pool.request()
            .input('id', sql.VarChar, CentroCostoID)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, CCostosDescripcion)
            .input('userId', sql.Int, userId)
            .query(`INSERT INTO MGCentroCostos (CentroCostoID, EmpresaID, CCostosDescripcion, CreadoPor) 
                    VALUES (@id, @empresaId, @desc, @userId)`);
        res.json({ message: 'Centro de costo creado exitosamente' });
    } catch (err) {
        if (err.number === 2627) return res.status(400).json({ error: 'El ID ya existe' });
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { CCostosDescripcion } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, CCostosDescripcion)
            .input('userId', sql.Int, userId)
            .query(`UPDATE MGCentroCostos SET CCostosDescripcion = @desc, ModificadoPor = @userId, FechaModificado = GETDATE()
                    WHERE CentroCostoID = @id AND EmpresaID = @empresaId`);
        res.json({ message: 'Centro de costo actualizado exitosamente' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRecord = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const empresaId = req.user?.empresaId || 1;
        
        const checkUso = await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query(`SELECT COUNT(*) as count FROM MG_CATALOGO WHERE CentroCostoId = @id AND EmpresaID = @empresaId`);
            
        if (checkUso.recordset[0].count > 0) return res.status(400).json({ error: 'Está en uso en el Catálogo de Cuentas' });
        
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query('DELETE FROM MGCentroCostos WHERE CentroCostoID = @id AND EmpresaID = @empresaId');
        res.json({ message: 'Eliminado exitosamente' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
