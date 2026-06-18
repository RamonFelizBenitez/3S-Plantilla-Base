const { sql, connectDB } = require('../config/db');

// Obtener todas las monedas
exports.getMonedas = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query(`
                SELECT * FROM Monedas 
                WHERE EmpresaID = @empresaId 
                ORDER BY MonedaID ASC
            `);
            
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear nueva moneda
exports.createMoneda = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        const { MonedaID, Descripcion, MgCuentaPerdida, MgCuentaGanancia, Simbolo, Multiplicador } = req.body;

        await pool.request()
            .input('monedaId', sql.VarChar, MonedaID)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, Descripcion || '')
            .input('perdida', sql.VarChar, MgCuentaPerdida || '')
            .input('ganancia', sql.VarChar, MgCuentaGanancia || '')
            .input('simbolo', sql.VarChar, Simbolo || '')
            .input('multiplicador', sql.Numeric(28, 12), Multiplicador || 0)
            .input('userId', sql.Int, userId)
            .query(`
                INSERT INTO Monedas (
                    MonedaID, EmpresaID, Descripcion, MgCuentaPerdida, MgCuentaGanancia, 
                    Simbolo, Multiplicador, CreadoPor
                ) VALUES (
                    @monedaId, @empresaId, @desc, @perdida, @ganancia, 
                    @simbolo, @multiplicador, @userId
                )
            `);
            
        res.json({ message: 'Moneda creada exitosamente' });
    } catch (err) {
        if (err.number === 2627) { 
            return res.status(400).json({ error: 'El ID de la moneda ya existe' });
        }
        res.status(500).json({ error: err.message });
    }
};

// Actualizar moneda
exports.updateMoneda = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params; // MonedaID
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        const { Descripcion, MgCuentaPerdida, MgCuentaGanancia, Simbolo, Multiplicador } = req.body;

        await pool.request()
            .input('monedaId', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, Descripcion || '')
            .input('perdida', sql.VarChar, MgCuentaPerdida || '')
            .input('ganancia', sql.VarChar, MgCuentaGanancia || '')
            .input('simbolo', sql.VarChar, Simbolo || '')
            .input('multiplicador', sql.Numeric(28, 12), Multiplicador || 0)
            .input('userId', sql.Int, userId)
            .query(`
                UPDATE Monedas SET 
                    Descripcion = @desc,
                    MgCuentaPerdida = @perdida,
                    MgCuentaGanancia = @ganancia,
                    Simbolo = @simbolo,
                    Multiplicador = @multiplicador,
                    ModificadoPor = @userId,
                    FechaModificado = GETDATE()
                WHERE MonedaID = @monedaId AND EmpresaID = @empresaId
            `);
            
        res.json({ message: 'Moneda actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar moneda
exports.deleteMoneda = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const empresaId = req.user?.empresaId || 1;
        
        // Verificar si la moneda está en uso en el catálogo de cuentas
        const checkUso = await pool.request()
            .input('monedaId', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query(`SELECT COUNT(*) as count FROM MG_CATALOGO WHERE MonedaID = @monedaId AND EmpresaID = @empresaId`);
            
        if (checkUso.recordset[0].count > 0) {
            return res.status(400).json({ error: 'No se puede eliminar la moneda porque está en uso en el Catálogo de Cuentas' });
        }
        
        await pool.request()
            .input('monedaId', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query(`DELETE FROM Monedas WHERE MonedaID = @monedaId AND EmpresaID = @empresaId`);
            
        res.json({ message: 'Moneda eliminada exitosamente' });
    } catch (err) {
        if (err.number === 547) { // Foreign Key constraint
            return res.status(400).json({ error: 'No se puede eliminar porque está referenciada en otras tablas' });
        }
        res.status(500).json({ error: err.message });
    }
};
