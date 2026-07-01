const { sql, connectDB } = require('../../config/db');

// --- CONTINENTES ---
exports.getContinentes = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Continentes ORDER BY Nombre ASC');
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createContinente = async (req, res) => {
    try {
        const pool = await connectDB();
        const { Nombre } = req.body;
        const userId = req.user ? req.user.id : 1; // MOCK
        await pool.request()
            .input('nombre', sql.NVarChar, Nombre)
            .input('userId', sql.Int, userId)
            .query('INSERT INTO Continentes (Nombre, CreadoPor) VALUES (@nombre, @userId)');
        res.json({ message: 'Continente creado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateContinente = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Nombre } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, Nombre)
            .input('userId', sql.Int, userId)
            .query('UPDATE Continentes SET Nombre = @nombre, ModificadoPor = @userId, FechaModificado = GETDATE() WHERE ContinenteID = @id');
        res.json({ message: 'Continente actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- PAISES ---
exports.getPaises = async (req, res) => {
    try {
        const pool = await connectDB();
        const continenteId = req.query.continenteId;
        
        let query = `
            SELECT p.*, c.Nombre as NombreContinente 
            FROM Paises p 
            JOIN Continentes c ON p.ContinenteID = c.ContinenteID 
        `;
        const request = pool.request();
        if (continenteId) {
            query += ` WHERE p.ContinenteID = @contId`;
            request.input('contId', sql.Int, continenteId);
        }
        query += ` ORDER BY p.Nombre ASC`;
        
        const result = await request.query(query);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPais = async (req, res) => {
    try {
        const pool = await connectDB();
        const { Nombre, ContinenteID } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('nombre', sql.NVarChar, Nombre)
            .input('contId', sql.Int, ContinenteID)
            .input('userId', sql.Int, userId)
            .query('INSERT INTO Paises (Nombre, ContinenteID, CreadoPor) VALUES (@nombre, @contId, @userId)');
        res.json({ message: 'País creado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePais = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Nombre, ContinenteID } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, Nombre)
            .input('contId', sql.Int, ContinenteID)
            .input('userId', sql.Int, userId)
            .query('UPDATE Paises SET Nombre = @nombre, ContinenteID = @contId, ModificadoPor = @userId, FechaModificado = GETDATE() WHERE PaisID = @id');
        res.json({ message: 'País actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- CIUDADES ---
exports.getCiudades = async (req, res) => {
    try {
        const pool = await connectDB();
        const paisId = req.query.paisId;
        let query = `
            SELECT c.*, p.Nombre as NombrePais 
            FROM Ciudades c 
            JOIN Paises p ON c.PaisID = p.PaisID 
        `;
        const request = pool.request();
        if (paisId) {
            query += ` WHERE c.PaisID = @paisId`;
            request.input('paisId', sql.Int, paisId);
        }
        query += ` ORDER BY c.Nombre ASC`;
        
        const result = await request.query(query);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCiudad = async (req, res) => {
    try {
        const pool = await connectDB();
        const { Nombre, PaisID } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('nombre', sql.NVarChar, Nombre)
            .input('paisId', sql.Int, PaisID)
            .input('userId', sql.Int, userId)
            .query('INSERT INTO Ciudades (Nombre, PaisID, CreadoPor) VALUES (@nombre, @paisId, @userId)');
        res.json({ message: 'Ciudad creada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCiudad = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Nombre, PaisID } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, Nombre)
            .input('paisId', sql.Int, PaisID)
            .input('userId', sql.Int, userId)
            .query('UPDATE Ciudades SET Nombre = @nombre, PaisID = @paisId, ModificadoPor = @userId, FechaModificado = GETDATE() WHERE CiudadID = @id');
        res.json({ message: 'Ciudad actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- MUNICIPIOS ---
exports.getMunicipios = async (req, res) => {
    try {
        const pool = await connectDB();
        const ciudadId = req.query.ciudadId;
        let query = `
            SELECT m.*, c.Nombre as NombreCiudad 
            FROM Municipios m 
            JOIN Ciudades c ON m.CiudadID = c.CiudadID 
        `;
        const request = pool.request();
        if (ciudadId) {
            query += ` WHERE m.CiudadID = @ciudadId`;
            request.input('ciudadId', sql.Int, ciudadId);
        }
        query += ` ORDER BY m.Nombre ASC`;
        
        const result = await request.query(query);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMunicipio = async (req, res) => {
    try {
        const pool = await connectDB();
        const { Nombre, CiudadID } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('nombre', sql.NVarChar, Nombre)
            .input('ciudadId', sql.Int, CiudadID)
            .input('userId', sql.Int, userId)
            .query('INSERT INTO Municipios (Nombre, CiudadID, CreadoPor) VALUES (@nombre, @ciudadId, @userId)');
        res.json({ message: 'Municipio creado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMunicipio = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const { Nombre, CiudadID } = req.body;
        const userId = req.user ? req.user.id : 1;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, Nombre)
            .input('ciudadId', sql.Int, CiudadID)
            .input('userId', sql.Int, userId)
            .query('UPDATE Municipios SET Nombre = @nombre, CiudadID = @ciudadId, ModificadoPor = @userId, FechaModificado = GETDATE() WHERE MunicipioID = @id');
        res.json({ message: 'Municipio actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
