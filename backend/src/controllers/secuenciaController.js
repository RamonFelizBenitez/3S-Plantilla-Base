const { sql, connectDB } = require('../config/db');

exports.getSecuencias = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; // Fallback a 1 para MOCK local
        
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query(`
                SELECT * FROM SecuenciasNum 
                WHERE EmpresaID = @empresaId 
                ORDER BY SecID ASC
            `);
            
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSecuencia = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        const { 
            SecID, Descripcion, IniciaEn, FinalizaEn, NumeroMaximo, 
            Siguiente, Plantilla, NCF, CeroIzq, FechaValido 
        } = req.body;

        await pool.request()
            .input('secId', sql.NVarChar, SecID)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.NVarChar, Descripcion)
            .input('inicia', sql.Int, IniciaEn || 1)
            .input('finaliza', sql.Int, FinalizaEn || 999999999)
            .input('maximo', sql.Int, NumeroMaximo || 999999999)
            .input('siguiente', sql.Int, Siguiente || 1)
            .input('plantilla', sql.NVarChar, Plantilla || '')
            .input('ncf', sql.Bit, NCF ? 1 : 0)
            .input('ceroIzq', sql.Bit, CeroIzq ? 1 : 0)
            .input('fechaValido', sql.DateTime, FechaValido || null)
            .input('userId', sql.Int, userId)
            .query(`
                INSERT INTO SecuenciasNum (
                    SecID, EmpresaID, Descripcion, IniciaEn, FinalizaEn, NumeroMaximo, Siguiente,
                    Plantilla, NCF, CeroIzq, FechaValido, CreadoPor
                ) VALUES (
                    @secId, @empresaId, @desc, @inicia, @finaliza, @maximo, @siguiente,
                    @plantilla, @ncf, @ceroIzq, @fechaValido, @userId
                )
            `);
            
        res.json({ message: 'Secuencia creada exitosamente' });
    } catch (err) {
        if (err.number === 2627) { // Unique constraint violation
            return res.status(400).json({ error: 'El código de secuencia (SecID) ya existe para esta empresa' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.updateSecuencia = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        const { 
            SecID, Descripcion, IniciaEn, FinalizaEn, NumeroMaximo, 
            Siguiente, Plantilla, NCF, CeroIzq, FechaValido 
        } = req.body;

        await pool.request()
            .input('id', sql.Int, id)
            .input('secId', sql.NVarChar, SecID)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.NVarChar, Descripcion)
            .input('inicia', sql.Int, IniciaEn)
            .input('finaliza', sql.Int, FinalizaEn)
            .input('maximo', sql.Int, NumeroMaximo)
            .input('siguiente', sql.Int, Siguiente)
            .input('plantilla', sql.NVarChar, Plantilla)
            .input('ncf', sql.Bit, NCF ? 1 : 0)
            .input('ceroIzq', sql.Bit, CeroIzq ? 1 : 0)
            .input('fechaValido', sql.DateTime, FechaValido || null)
            .input('userId', sql.Int, userId)
            .query(`
                UPDATE SecuenciasNum SET 
                    SecID = @secId,
                    Descripcion = @desc,
                    IniciaEn = @inicia,
                    FinalizaEn = @finaliza,
                    NumeroMaximo = @maximo,
                    Siguiente = @siguiente,
                    Plantilla = @plantilla,
                    NCF = @ncf,
                    CeroIzq = @ceroIzq,
                    FechaValido = @fechaValido,
                    ModificadoPor = @userId,
                    FechaModificado = GETDATE()
                WHERE SecuenciaNumID = @id AND EmpresaID = @empresaId
            `);
            
        res.json({ message: 'Secuencia actualizada exitosamente' });
    } catch (err) {
        if (err.number === 2627) {
            return res.status(400).json({ error: 'El código de secuencia (SecID) ya existe para esta empresa' });
        }
        res.status(500).json({ error: err.message });
    }
};
