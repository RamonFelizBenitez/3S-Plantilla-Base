const { sql, connectDB } = require('../config/db');

exports.getPerfiles = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.query.empresaId || null;
        
        let query = `
            SELECT p.PerfilID, p.Descripcion, p.EmpresaID, e.NombreEmpresa
            FROM Perfiles p
            LEFT JOIN Empresas e ON p.EmpresaID = e.EmpresaID
            WHERE 1=1
        `;
        
        const request = pool.request();
        
        if (empresaId) {
            query += ` AND (p.EmpresaID = @empresaId OR p.EmpresaID IS NULL) `;
            request.input('empresaId', sql.Int, empresaId);
        }

        query += ` ORDER BY p.Descripcion ASC `;
        
        const result = await request.query(query);
        res.json({ data: result.recordset });
    } catch (err) {
        console.error('Error fetching perfiles:', err);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.getPerfilById = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const result = await pool.request().input('id', sql.Int, id).query(`SELECT * FROM Perfiles WHERE PerfilID = @id`);
        if(result.recordset.length === 0) return res.status(404).json({message: 'Not found'});
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.createPerfil = async (req, res) => {
    try {
        const pool = await connectDB();
        const { Descripcion, EmpresaID } = req.body;
        const result = await pool.request()
            .input('desc', sql.NVarChar, Descripcion)
            .input('empId', sql.Int, EmpresaID || null)
            .query(`INSERT INTO Perfiles (Descripcion, EmpresaID) OUTPUT INSERTED.PerfilID VALUES (@desc, @empId)`);
        res.status(201).json({ message: 'Perfil creado', PerfilID: result.recordset[0].PerfilID });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear' });
    }
};

exports.updatePerfil = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Descripcion, EmpresaID } = req.body;
        await pool.request()
            .input('id', sql.Int, id)
            .input('desc', sql.NVarChar, Descripcion)
            .input('empId', sql.Int, EmpresaID || null)
            .query(`UPDATE Perfiles SET Descripcion = @desc, EmpresaID = @empId WHERE PerfilID = @id`);
        res.json({ message: 'Perfil actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

exports.deletePerfil = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        
        // Verifica dependencias antes de eliminar
        const check = await pool.request().input('id', sql.Int, id).query(`SELECT COUNT(*) as c FROM Usuarios_Perfiles WHERE PerfilID = @id`);
        if (check.recordset[0].c > 0) {
            return res.status(400).json({ error: 'No se puede eliminar porque hay usuarios con este perfil asignado.' });
        }

        await pool.request().input('id', sql.Int, id).query(`DELETE FROM Perfiles WHERE PerfilID = @id`);
        res.json({ message: 'Perfil eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
};
