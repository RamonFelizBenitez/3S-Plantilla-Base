const { sql, connectDB } = require('../../config/db');

exports.getClasificaciones = async (req, res) => {
    try {
        const { empresaId } = req.query;
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        const result = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`SELECT * FROM RHCLASIFICACION WHERE EmpresaID = @empresaId`);
            
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getClasificacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`SELECT * FROM RHCLASIFICACION WHERE ClasificacionID = @id AND EmpresaID = @empresaId`);

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Clasificación no encontrada' });
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createClasificacion = async (req, res) => {
    try {
        const { empresaId } = req.query;
        const { Descripcion, Grado, Estatus = 1, CreadoPor } = req.body;
        
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });
        if (!Grado) return res.status(400).json({ message: 'El grado es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .input('descripcion', sql.VarChar, Descripcion)
            .input('grado', sql.VarChar, Grado || null)
            .input('estatus', sql.Int, Estatus)
            .input('creadoPor', sql.VarChar, CreadoPor || '1')
            .query(`
                INSERT INTO RHCLASIFICACION (EmpresaID, Descripcion, Grado, Estatus, CreadoPor, FechaCreado)
                VALUES (@empresaId, @descripcion, @grado, @estatus, @creadoPor, GETDATE())
            `);

        res.status(201).json({ message: 'Clasificación creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateClasificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { Descripcion, Grado, Estatus, ModificadoPor } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });
        if (!Grado) return res.status(400).json({ message: 'El grado es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('descripcion', sql.VarChar, Descripcion)
            .input('grado', sql.VarChar, Grado || null)
            .input('estatus', sql.Int, Estatus)
            .input('modificadoPor', sql.VarChar, ModificadoPor || '1')
            .query(`
                UPDATE RHCLASIFICACION
                SET Descripcion = @descripcion,
                    Grado = @grado,
                    Estatus = @estatus,
                    ModificadoPor = @modificadoPor,
                    FechaModificado = GETDATE()
                WHERE ClasificacionID = @id AND EmpresaID = @empresaId
            `);

        res.json({ message: 'Clasificación actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteClasificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`DELETE FROM RHCLASIFICACION WHERE ClasificacionID = @id AND EmpresaID = @empresaId`);

        res.json({ message: 'Clasificación eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
