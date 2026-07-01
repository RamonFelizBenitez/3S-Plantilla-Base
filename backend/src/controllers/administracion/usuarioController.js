const { sql, connectDB } = require('../../config/db');
const bcrypt = require('bcrypt');

exports.getUsuarios = async (req, res) => {
    try {
        const pool = await connectDB();
        
        // El EmpresaID vendría del token JWT (req.user.empresaId). 
        // Por ahora simularemos que viene por query param para filtrar o nulo para globales
        const empresaId = req.query.empresaId || null;
        const search = req.query.search || '';

        let request = pool.request()
            .input('search', sql.NVarChar, `%${search}%`);

        let query = `
            SELECT 
                u.UsuarioID, u.NombreUsuario, u.NombreCompleto, u.Correo, u.Activo, u.EsGlobal,
                STRING_AGG(e.NombreEmpresa, ', ') as Empresa,
                STRING_AGG(p.Descripcion, ', ') as Perfiles
            FROM Usuarios u
            LEFT JOIN Usuarios_Empresas ue ON u.UsuarioID = ue.UsuarioID
            LEFT JOIN Empresas e ON ue.EmpresaID = e.EmpresaID
            LEFT JOIN Usuarios_Perfiles up ON u.UsuarioID = up.UsuarioID
            LEFT JOIN Perfiles p ON up.PerfilID = p.PerfilID
            WHERE (u.NombreUsuario LIKE @search OR u.NombreCompleto LIKE @search OR u.Correo LIKE @search)
        `;

        if (empresaId) {
            request.input('empresaId', sql.Int, empresaId);
            query += ` AND ue.EmpresaID = @empresaId `;
        }

        query += `
            GROUP BY 
                u.UsuarioID, u.NombreUsuario, u.NombreCompleto, u.Correo, u.Activo, u.EsGlobal
            ORDER BY u.NombreCompleto ASC
        `;
        
        const result = await request.query(query);

        res.json({
            data: result.recordset
        });
    } catch (err) {
        console.error('Error fetching usuarios:', err);
        res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
};

exports.getUsuarioById = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT UsuarioID, NombreUsuario, NombreCompleto, Correo, EsGlobal, Activo
                FROM Usuarios WHERE UsuarioID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = result.recordset[0];

        // Obtener perfiles asignados
        const perfiles = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT PerfilID FROM Usuarios_Perfiles WHERE UsuarioID = @id`);
            
        usuario.Perfiles = perfiles.recordset.map(p => p.PerfilID);

        // Obtener empresas asignadas
        const empresas = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT EmpresaID FROM Usuarios_Empresas WHERE UsuarioID = @id`);
            
        usuario.Empresas = empresas.recordset.map(e => e.EmpresaID);

        res.json(usuario);
    } catch (err) {
        console.error('Error fetching usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.createUsuario = async (req, res) => {
    let transaction;
    try {
        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const data = req.body;
        
        const hash = await bcrypt.hash(data.Password, 10);

        const request = new sql.Request(transaction);
        const userResult = await request
            .input('nombreUsuario', sql.NVarChar, data.NombreUsuario)
            .input('nombreCompleto', sql.NVarChar, data.NombreCompleto)
            .input('correo', sql.NVarChar, data.Correo)
            .input('password', sql.NVarChar, hash)
            .input('esGlobal', sql.Bit, data.EsGlobal ? 1 : 0)
            .input('activo', sql.Bit, data.Activo !== undefined ? data.Activo : 1)
            .query(`
                INSERT INTO Usuarios (NombreUsuario, NombreCompleto, Correo, PasswordHash, EsGlobal, Activo)
                OUTPUT INSERTED.UsuarioID
                VALUES (@nombreUsuario, @nombreCompleto, @correo, @password, @esGlobal, @activo)
            `);
            
        const newUsuarioID = userResult.recordset[0].UsuarioID;

        // Insertar empresas
        if (data.Empresas && data.Empresas.length > 0) {
            for (let empresaId of data.Empresas) {
                const reqEmpresa = new sql.Request(transaction);
                await reqEmpresa
                    .input('userId', sql.Int, newUsuarioID)
                    .input('empresaId', sql.Int, empresaId)
                    .query(`INSERT INTO Usuarios_Empresas (UsuarioID, EmpresaID) VALUES (@userId, @empresaId)`);
            }
        }

        // Insertar roles
        if (data.Perfiles && data.Perfiles.length > 0) {
            for (let perfilId of data.Perfiles) {
                const reqPerfil = new sql.Request(transaction);
                await reqPerfil
                    .input('userId', sql.Int, newUsuarioID)
                    .input('perfilId', sql.Int, perfilId)
                    .query(`INSERT INTO Usuarios_Perfiles (UsuarioID, PerfilID) VALUES (@userId, @perfilId)`);
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Usuario creado', UsuarioID: newUsuarioID });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error creating usuario:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

exports.updateUsuario = async (req, res) => {
    let transaction;
    try {
        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const { id } = req.params;
        const data = req.body;

        const request = new sql.Request(transaction);
        let query = `
            UPDATE Usuarios
            SET NombreUsuario = @nombreUsuario, NombreCompleto = @nombreCompleto, 
                Correo = @correo, EsGlobal = @esGlobal, Activo = @activo
        `;

        request.input('id', sql.Int, id)
               .input('nombreUsuario', sql.NVarChar, data.NombreUsuario)
               .input('nombreCompleto', sql.NVarChar, data.NombreCompleto)
               .input('correo', sql.NVarChar, data.Correo)
               .input('esGlobal', sql.Bit, data.EsGlobal ? 1 : 0)
               .input('activo', sql.Bit, data.Activo !== undefined ? data.Activo : 1);

        if (data.Password) {
            const hash = await bcrypt.hash(data.Password, 10);
            query += `, PasswordHash = @password `;
            request.input('password', sql.NVarChar, hash);
        }

        query += ` WHERE UsuarioID = @id`;
        await request.query(query);

        // Actualizar empresas (Borrar e insertar de nuevo)
        await new sql.Request(transaction).input('id', sql.Int, id).query(`DELETE FROM Usuarios_Empresas WHERE UsuarioID = @id`);

        if (data.Empresas && data.Empresas.length > 0) {
            for (let empresaId of data.Empresas) {
                const reqEmpresa = new sql.Request(transaction);
                await reqEmpresa
                    .input('userId', sql.Int, id)
                    .input('empresaId', sql.Int, empresaId)
                    .query(`INSERT INTO Usuarios_Empresas (UsuarioID, EmpresaID) VALUES (@userId, @empresaId)`);
            }
        }

        // Actualizar roles (Borrar e insertar de nuevo)
        await new sql.Request(transaction).input('id', sql.Int, id).query(`DELETE FROM Usuarios_Perfiles WHERE UsuarioID = @id`);

        if (data.Perfiles && data.Perfiles.length > 0) {
            for (let perfilId of data.Perfiles) {
                const reqPerfil = new sql.Request(transaction);
                await reqPerfil
                    .input('userId', sql.Int, id)
                    .input('perfilId', sql.Int, perfilId)
                    .query(`INSERT INTO Usuarios_Perfiles (UsuarioID, PerfilID) VALUES (@userId, @perfilId)`);
            }
        }

        await transaction.commit();
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error updating usuario:', err);
        res.status(500).json({ error: 'Error al actualizar usuario', details: err.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        await pool.request().input('id', sql.Int, id).query(`UPDATE Usuarios SET Activo = 0 WHERE UsuarioID = @id`);
        res.json({ message: 'Usuario desactivado' });
    } catch (err) {
        console.error('Error deleting usuario:', err);
        res.status(500).json({ error: 'Error al desactivar usuario' });
    }
};
