const { sql, connectDB } = require('../config/db');

exports.getEstructuraMenu = async (req, res) => {
    try {
        const pool = await connectDB();
        
        // Obtenemos los módulos
        const resultModulos = await pool.request().query(`
            SELECT ModuloID, Nombre, Icono 
            FROM Modulos 
            WHERE Activo = 1 
            ORDER BY Orden ASC
        `);
        
        // Obtenemos las opciones
        const resultOpciones = await pool.request().query(`
            SELECT OpcionID, ModuloID, CarpetaPadreID, Nombre, EsCarpeta 
            FROM Opciones 
            WHERE Activo = 1 
            ORDER BY Orden ASC
        `);

        const modulos = resultModulos.recordset;
        const opciones = resultOpciones.recordset;

        // Construir árbol
        const arbol = modulos.map(m => {
            const opcionesModulo = opciones.filter(o => o.ModuloID === m.ModuloID && o.CarpetaPadreID === null);
            
            const mapChildren = (parent) => {
                const children = opciones.filter(o => o.CarpetaPadreID === parent.OpcionID);
                return {
                    ...parent,
                    subOpciones: children.map(mapChildren)
                };
            };

            return {
                ...m,
                opciones: opcionesModulo.map(mapChildren)
            };
        });

        res.json({ data: arbol });
    } catch (err) {
        console.error('Error fetching estructura:', err);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.getPermisos = async (req, res) => {
    try {
        const { tipo, id } = req.params; // tipo: 'perfil' o 'usuario'
        const pool = await connectDB();
        
        let table = tipo === 'perfil' ? 'Permisos_Perfiles' : 'Permisos_Usuarios';
        let idColumn = tipo === 'perfil' ? 'PerfilID' : 'UsuarioID';
        
        let query = `
            SELECT OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar 
            FROM ${table} 
            WHERE ${idColumn} = @id
        `;
        
        const request = pool.request().input('id', sql.Int, id);

        if (tipo === 'usuario') {
            const empresaId = req.query.empresaId;
            if (!empresaId) return res.status(400).json({ error: 'Se requiere empresaId para usuarios' });
            query += ` AND EmpresaID = @empresaId`;
            request.input('empresaId', sql.Int, empresaId);
        }

        const result = await request.query(query);
            
        res.json({ data: result.recordset });
    } catch (err) {
        console.error('Error fetching permisos:', err);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.savePermisos = async (req, res) => {
    let transaction;
    try {
        const { tipo, id } = req.params; 
        const { permisos, empresaId } = req.body; // Array de {OpcionID, ...} y opcional empresaId

        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        let table = tipo === 'perfil' ? 'Permisos_Perfiles' : 'Permisos_Usuarios';
        let idColumn = tipo === 'perfil' ? 'PerfilID' : 'UsuarioID';

        if (tipo === 'usuario' && !empresaId) {
            throw new Error('Falta empresaId para los permisos de usuario');
        }

        // Borrar todos los permisos anteriores de este perfil o usuario
        let deleteQuery = `DELETE FROM ${table} WHERE ${idColumn} = @id`;
        const reqDelete = new sql.Request(transaction).input('id', sql.Int, id);
        
        if (tipo === 'usuario') {
            deleteQuery += ` AND EmpresaID = @empresaId`;
            reqDelete.input('empresaId', sql.Int, empresaId);
        }
        await reqDelete.query(deleteQuery);

        // Insertar los nuevos (si solo se envía la matriz que tiene algún check activo)
        for (let p of permisos) {
            // Solo insertamos si tiene algún permiso, para no llenar la BD de ceros innecesarios
            if (p.PuedeConsultar || p.PuedeInsertar || p.PuedeModificar || p.PuedeEliminar) {
                const reqInsert = new sql.Request(transaction)
                    .input('id', sql.Int, id)
                    .input('opcionId', sql.Int, p.OpcionID)
                    .input('c', sql.Bit, p.PuedeConsultar ? 1 : 0)
                    .input('i', sql.Bit, p.PuedeInsertar ? 1 : 0)
                    .input('m', sql.Bit, p.PuedeModificar ? 1 : 0)
                    .input('e', sql.Bit, p.PuedeEliminar ? 1 : 0);

                if (tipo === 'usuario') {
                    reqInsert.input('empresaId', sql.Int, empresaId);
                    await reqInsert.query(`
                        INSERT INTO ${table} (${idColumn}, EmpresaID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar)
                        VALUES (@id, @empresaId, @opcionId, @c, @i, @m, @e)
                    `);
                } else {
                    await reqInsert.query(`
                        INSERT INTO ${table} (${idColumn}, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar)
                        VALUES (@id, @opcionId, @c, @i, @m, @e)
                    `);
                }
            }
        }

        await transaction.commit();
        res.json({ message: 'Permisos guardados correctamente' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error saving permisos:', err);
        res.status(500).json({ error: 'Error interno al guardar' });
    }
};
