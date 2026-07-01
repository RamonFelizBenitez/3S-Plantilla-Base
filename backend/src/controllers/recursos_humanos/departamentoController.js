const { sql, connectDB } = require('../../config/db');

exports.getAll = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query('SELECT * FROM MGDepartamentos WHERE EmpresaID = @empresaId ORDER BY DepartamentoID ASC');
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const pool = await connectDB();
        const { DepartamentoID, DepartDescripcion } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        await pool.request()
            .input('id', sql.VarChar, DepartamentoID)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, DepartDescripcion)
            .input('userId', sql.Int, userId)
            .query(`INSERT INTO MGDepartamentos (DepartamentoID, EmpresaID, DepartDescripcion, CreadoPor) 
                    VALUES (@id, @empresaId, @desc, @userId)`);
        res.json({ message: 'Departamento creado exitosamente' });
    } catch (err) {
        if (err.number === 2627) return res.status(400).json({ error: 'El ID ya existe' });
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { DepartDescripcion } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;

        await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, DepartDescripcion)
            .input('userId', sql.Int, userId)
            .query(`UPDATE MGDepartamentos SET DepartDescripcion = @desc, ModificadoPor = @userId, FechaModificado = GETDATE()
                    WHERE DepartamentoID = @id AND EmpresaID = @empresaId`);
        res.json({ message: 'Departamento actualizado exitosamente' });
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
            .query(`SELECT COUNT(*) as count FROM MG_CATALOGO WHERE DepartamentoId = @id AND EmpresaID = @empresaId`);
            
        if (checkUso.recordset[0].count > 0) return res.status(400).json({ error: 'Está en uso en el Catálogo de Cuentas' });
        
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query('DELETE FROM MGDepartamentos WHERE DepartamentoID = @id AND EmpresaID = @empresaId');
        res.json({ message: 'Eliminado exitosamente' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
