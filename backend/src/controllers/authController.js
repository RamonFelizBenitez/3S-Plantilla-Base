const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, connectDB } = require('../config/db');

const login = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('username', username)
            .query('SELECT UsuarioID, NombreUsuario, NombreCompleto, PasswordHash, EsGlobal, Activo FROM Usuarios WHERE NombreUsuario = @username');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.Activo) {
            return res.status(403).json({ message: 'User is inactive' });
        }

        // Obtener Empresas a las que tiene acceso el usuario
        let empResult;
        if (user.EsGlobal) {
            empResult = await pool.request()
                .query(`SELECT EmpresaID, NombreEmpresa FROM Empresas WHERE Activa = 1`);
        } else {
            empResult = await pool.request()
                .input('userId', sql.Int, user.UsuarioID)
                .query(`
                    SELECT e.EmpresaID, e.NombreEmpresa 
                    FROM Usuarios_Empresas ue
                    INNER JOIN Empresas e ON ue.EmpresaID = e.EmpresaID
                    WHERE ue.UsuarioID = @userId AND ue.Activo = 1 AND e.Activa = 1
                `);
        }
            
        const empresas = empResult.recordset;

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user.UsuarioID,
            username: user.NombreUsuario,
            fullName: user.NombreCompleto
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key_rhdbw_123',
            { expiresIn: '8h' }
        );

        res.json({ token, user: payload, empresas });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', details: err.message, stack: err.stack });
    }
};

module.exports = {
    login
};
