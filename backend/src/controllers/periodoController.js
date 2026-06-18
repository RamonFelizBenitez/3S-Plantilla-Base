const { sql, connectDB } = require('../config/db');

exports.getPeriodos = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query(`
                SELECT * FROM MGPeriodos 
                WHERE EmpresaID = @empresaId 
                ORDER BY FecInicioPeriodo DESC, CodigoPeriodo ASC
            `);
            
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEstado = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Estado, Comentario } = req.body; // 'Abierto' o 'Detenido'
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        // Regla de Negocio: No se puede cambiar a 'Cerrado' por esta vía, solo 'Abierto' o 'Detenido'
        // Además, si actualmente está cerrado en la BD, no se puede cambiar.
        const check = await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.Int, empresaId)
            .query('SELECT Estado FROM MGPeriodos WHERE PeriodoID = @id AND EmpresaID = @empresaId');
            
        if (check.recordset.length === 0) return res.status(404).json({ error: 'No encontrado' });
        if (check.recordset[0].Estado === 'Cerrado') {
            return res.status(400).json({ error: 'Un periodo cerrado no puede ser modificado manualmente.' });
        }
        
        if (Estado === 'Cerrado') {
             return res.status(400).json({ error: 'El cierre debe ejecutarse mediante el proceso de cierre de nómina.' });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('estado', sql.NVarChar, Estado)
            .input('comentario', sql.NVarChar, Comentario || '')
            .input('userId', sql.Int, userId)
            .query(`
                UPDATE MGPeriodos 
                SET Estado = @estado, Comentario = @comentario, ModificadoPor = @userId, FechaModificado = GETDATE()
                WHERE PeriodoID = @id
            `);
            
        res.json({ message: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePeriodo = async (req, res) => {
    try {
        const pool = await connectDB();
        const { codigoPeriodo } = req.params; // Eliminar por lote
        const empresaId = req.user?.empresaId || 1;
        
        // Validación: Revisar si hay transacciones en MGTRANS para este CodigoPeriodo
        const checkUso = await pool.request()
            .input('codigo', sql.Int, codigoPeriodo)
            .input('empresaId', sql.Int, empresaId)
            .query(`SELECT COUNT(*) as count FROM MGTRANS WHERE CodigoPeriodo = @codigo AND EmpresaID = @empresaId`);
            
        if (checkUso.recordset[0].count > 0) {
            return res.status(400).json({ error: 'No se pueden eliminar los periodos porque ya existen transacciones en MGTRANS para este Código de Periodo.' });
        }

        await pool.request()
            .input('codigo', sql.Int, codigoPeriodo)
            .input('empresaId', sql.Int, empresaId)
            .query('DELETE FROM MGPeriodos WHERE CodigoPeriodo = @codigo AND EmpresaID = @empresaId');
            
        res.json({ message: 'Periodos eliminados exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// MOTOR GENERADOR
exports.generarPeriodos = async (req, res) => {
    let transaction;
    try {
        const pool = await connectDB();
        const { FecInicioPeriodo, TipoPeriodo } = req.body;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        if (!FecInicioPeriodo || !TipoPeriodo) {
            return res.status(400).json({ error: 'Fecha de inicio y Tipo de Periodo son obligatorios' });
        }

        let currentDate = new Date(FecInicioPeriodo);
        const periodosToInsert = [];
        
        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };
        
        const addMonths = (date, months) => {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        };

        const anioCodigo = new Date(FecInicioPeriodo).getFullYear();

        if (TipoPeriodo === 'M') { // Mensual (12)
            for (let i = 1; i <= 12; i++) {
                let start = new Date(currentDate);
                let end = addDays(addMonths(start, 1), -1);
                periodosToInsert.push({ CodigoPeriodo: anioCodigo, FecInicioPeriodo: start, FecFinPeriodo: end });
                currentDate = addMonths(currentDate, 1);
            }
        } else if (TipoPeriodo === 'T') { // Trimestral (4)
            for (let i = 1; i <= 4; i++) {
                let start = new Date(currentDate);
                let end = addDays(addMonths(start, 3), -1);
                periodosToInsert.push({ CodigoPeriodo: anioCodigo, FecInicioPeriodo: start, FecFinPeriodo: end });
                currentDate = addMonths(currentDate, 3);
            }
        } else if (TipoPeriodo === 'A') { // Anual (1)
            let start = new Date(currentDate);
            let end = addDays(addMonths(start, 12), -1);
            periodosToInsert.push({ CodigoPeriodo: anioCodigo, FecInicioPeriodo: start, FecFinPeriodo: end });
        } else if (TipoPeriodo === 'C') { // 4 Semanas (13 periodos de 28 dias)
            for (let i = 1; i <= 13; i++) {
                let start = new Date(currentDate);
                let end = addDays(start, 27);
                periodosToInsert.push({ CodigoPeriodo: anioCodigo, FecInicioPeriodo: start, FecFinPeriodo: end });
                currentDate = addDays(start, 28);
            }
        } else if (TipoPeriodo === 'Q') { // 4-4-5 Semanas
            for (let q = 1; q <= 4; q++) { // 4 quarters
                for (let m = 1; m <= 3; m++) { // 3 months per quarter
                    let weeks = (m === 3) ? 5 : 4; // 3rd month is 5 weeks
                    let days = weeks * 7;
                    let start = new Date(currentDate);
                    let end = addDays(start, days - 1);
                    periodosToInsert.push({ CodigoPeriodo: anioCodigo, FecInicioPeriodo: start, FecFinPeriodo: end });
                    currentDate = addDays(start, days);
                }
            }
        }

        // Ejecutar insercion atómica
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        for (let p of periodosToInsert) {
            await new sql.Request(transaction)
                .input('empresaId', sql.Int, empresaId)
                .input('codigo', sql.Int, p.CodigoPeriodo)
                .input('inicio', sql.DateTime, p.FecInicioPeriodo)
                .input('fin', sql.DateTime, p.FecFinPeriodo)
                .input('tipo', sql.NVarChar, TipoPeriodo)
                .input('userId', sql.Int, userId)
                .query(`
                    INSERT INTO MGPeriodos (EmpresaID, CodigoPeriodo, FecInicioPeriodo, FecFinPeriodo, TipoPeriodo, CreadoPor)
                    VALUES (@empresaId, @codigo, @inicio, @fin, @tipo, @userId)
                `);
        }

        await transaction.commit();
        res.json({ message: 'Periodos generados exitosamente', totalGenerados: periodosToInsert.length });
    } catch (err) {
        if (transaction) await transaction.rollback();
        if (err.number === 2627) {
            return res.status(400).json({ error: 'Ya existen periodos generados para esta fecha en su empresa. Elimínelos primero.' });
        }
        res.status(500).json({ error: err.message });
    }
};
