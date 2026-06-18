const { sql, connectDB } = require('../config/db');

// Obtener todas las empresas (con búsqueda, ordenamiento y paginación)
exports.getEmpresas = async (req, res) => {
    try {
        const pool = await connectDB();
        
        // Parámetros de query (valores por defecto)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        
        // Usar parámetros seguros con TYPES
        let request = pool.request()
            .input('search', sql.NVarChar, `%${search}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit);

        // Contar el total para la paginación
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Empresas e
            WHERE e.NombreEmpresa LIKE @search
        `;
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;

        // Query principal (JOIN con EmpresaInfo)
        const query = `
            SELECT 
                e.EmpresaID, e.NombreEmpresa, e.Activa, e.FechaCreado,
                i.RNC, i.Telefono, i.Correo
            FROM Empresas e
            LEFT JOIN EmpresaInfo i ON e.EmpresaID = i.EmpresaID
            WHERE e.NombreEmpresa LIKE @search OR i.RNC LIKE @search
            ORDER BY e.EmpresaID DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        
        const result = await request.query(query);

        res.json({
            data: result.recordset,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching empresas:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener empresa por ID (Detalle completo)
exports.getEmpresaById = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;

        const request = pool.request().input('id', sql.Int, id);

        const query = `
            SELECT 
                e.*,
                i.EmpresaInfoID, i.RNC, i.Direccion, i.PaisID, i.CiudadID, i.MunicipioID, 
                i.Telefono, i.Correo, i.PaginaWeb, i.Logo, 
                i.Representante, i.CargoRepresentante
            FROM Empresas e
            LEFT JOIN EmpresaInfo i ON e.EmpresaID = i.EmpresaID
            WHERE e.EmpresaID = @id
        `;
        
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching empresa by ID:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear una nueva empresa (Transaccional)
exports.createEmpresa = async (req, res) => {
    let transaction;
    try {
        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const data = req.body;
        // Data base
        const nombreEmpresa = data.NombreEmpresa || '';
        const activa = data.Activa !== undefined ? data.Activa : 1;

        // Data Info
        const info = data.Info || {};

        // 1. Insertar en Empresas
        const reqEmpresa = new sql.Request(transaction);
        const resultEmpresa = await reqEmpresa
            .input('nombreEmpresa', sql.NVarChar, nombreEmpresa)
            .input('activa', sql.Bit, activa)
            .input('creadoPor', sql.Int, 1) // Todo: Get from auth
            .query(`
                INSERT INTO Empresas (NombreEmpresa, Activa, CreadoPor, FechaCreado) 
                OUTPUT INSERTED.EmpresaID
                VALUES (@nombreEmpresa, @activa, @creadoPor, GETDATE())
            `);
        
        const newEmpresaID = resultEmpresa.recordset[0].EmpresaID;

        // 2. Insertar en EmpresaInfo
        const reqInfo = new sql.Request(transaction);
        await reqInfo
            .input('empresaId', sql.Int, newEmpresaID)
            .input('rnc', sql.NVarChar, info.RNC || null)
            .input('dirInfo', sql.NVarChar, info.Direccion || null)
            .input('paisId', sql.Int, info.PaisID || null)
            .input('ciudadId', sql.Int, info.CiudadID || null)
            .input('municipioId', sql.Int, info.MunicipioID || null)
            .input('telefono', sql.NVarChar, info.Telefono || null)
            .input('correo', sql.NVarChar, info.Correo || null)
            .input('web', sql.NVarChar, info.PaginaWeb || null)
            .input('logo', sql.NVarChar, info.Logo || null)
            .input('rep', sql.NVarChar, info.Representante || null)
            .input('cargo', sql.NVarChar, info.CargoRepresentante || null)
            .query(`
                INSERT INTO EmpresaInfo (EmpresaID, RNC, Direccion, PaisID, CiudadID, MunicipioID, Telefono, Correo, PaginaWeb, Logo, Representante, CargoRepresentante, CreadoPor)
                VALUES (@empresaId, @rnc, @dirInfo, @paisId, @ciudadId, @municipioId, @telefono, @correo, @web, @logo, @rep, @cargo, 1)
            `);

        await transaction.commit();
        res.status(201).json({ message: 'Empresa creada exitosamente', EmpresaID: newEmpresaID });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error creating empresa:', err);
        res.status(500).json({ error: 'Error al crear la empresa', details: err.message });
    }
};

// Actualizar una empresa existente
exports.updateEmpresa = async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const data = req.body;
        
        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Actualizar tabla principal
        const reqEmpresa = new sql.Request(transaction);
        await reqEmpresa
            .input('id', sql.Int, id)
            .input('nombreEmpresa', sql.NVarChar, data.NombreEmpresa)
            .input('activa', sql.Bit, data.Activa)
            .input('modificadoPor', sql.Int, 1) // Todo: Get from auth
            .query(`
                UPDATE Empresas 
                SET NombreEmpresa = @nombreEmpresa, Activa = @activa, ModificadoPor = @modificadoPor, FechaModificado = GETDATE()
                WHERE EmpresaID = @id
            `);

        // Comprobar si existe EmpresaInfo
        const info = data.Info || {};
        const reqCheckInfo = new sql.Request(transaction).input('id', sql.Int, id);
        const checkInfoResult = await reqCheckInfo.query(`SELECT EmpresaInfoID FROM EmpresaInfo WHERE EmpresaID = @id`);

        const reqInfo = new sql.Request(transaction);
        reqInfo
            .input('id', sql.Int, id)
            .input('rnc', sql.NVarChar, info.RNC)
            .input('dirInfo', sql.NVarChar, info.Direccion)
            .input('paisId', sql.Int, info.PaisID || null)
            .input('ciudadId', sql.Int, info.CiudadID || null)
            .input('municipioId', sql.Int, info.MunicipioID || null)
            .input('telefono', sql.NVarChar, info.Telefono)
            .input('correo', sql.NVarChar, info.Correo)
            .input('web', sql.NVarChar, info.PaginaWeb)
            .input('logo', sql.NVarChar, info.Logo)
            .input('rep', sql.NVarChar, info.Representante)
            .input('cargo', sql.NVarChar, info.CargoRepresentante);

        if (checkInfoResult.recordset.length > 0) {
            // Existe -> Actualizar
            await reqInfo.query(`
                UPDATE EmpresaInfo
                SET RNC = @rnc, Direccion = @dirInfo, PaisID = @paisId, CiudadID = @ciudadId, MunicipioID = @municipioId,
                    Telefono = @telefono, Correo = @correo, PaginaWeb = @web, Logo = @logo,
                    Representante = @rep, CargoRepresentante = @cargo, ModificadoPor = 1, FechaModificado = GETDATE()
                WHERE EmpresaID = @id
            `);
        } else {
            // No existe -> Insertar
            await reqInfo.query(`
                INSERT INTO EmpresaInfo (EmpresaID, RNC, Direccion, PaisID, CiudadID, MunicipioID, Telefono, Correo, PaginaWeb, Logo, Representante, CargoRepresentante, CreadoPor)
                VALUES (@id, @rnc, @dirInfo, @paisId, @ciudadId, @municipioId, @telefono, @correo, @web, @logo, @rep, @cargo, 1)
            `);
        }

        await transaction.commit();
        res.json({ message: 'Empresa actualizada exitosamente' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('Error updating empresa:', err);
        res.status(500).json({ error: 'Error al actualizar la empresa', details: err.message });
    }
};

// Eliminar (o desactivar) una empresa
exports.deleteEmpresa = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;

        const request = pool.request().input('id', sql.Int, id);

        // En sistemas empresariales es mejor el Soft Delete (Desactivar)
        // Pero proveemos la eliminación real si no hay dependencias, o un update a Activa = 0
        
        await request.query(`UPDATE Empresas SET Activa = 0 WHERE EmpresaID = @id`);
        
        res.json({ message: 'Empresa desactivada exitosamente (Soft Delete)' });
    } catch (err) {
        console.error('Error deleting empresa:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
