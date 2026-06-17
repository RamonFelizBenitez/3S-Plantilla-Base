const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../config/db');

const login = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('username', username)
            .query('SELECT UsuarioID, NombreUsuario, NombreCompleto, PasswordHash, Activo FROM Usuarios WHERE NombreUsuario = @username');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.Activo) {
            return res.status(403).json({ message: 'User is inactive' });
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.UsuarioID,
                username: user.NombreUsuario,
                fullName: user.NombreCompleto
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key_rhdbw_123',
            { expiresIn: '8h' }
        );

        res.json({ token, user: payload.user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    login
};
