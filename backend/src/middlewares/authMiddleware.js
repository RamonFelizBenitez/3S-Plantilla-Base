const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Temporary bypass for development
        req.user = { UsuarioID: 1, Usuario: 'admin', empresaId: 1 };
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        // Temporary bypass for development
        req.user = { UsuarioID: 1, Usuario: 'admin', empresaId: 1 };
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_rhdbw_123');
        
        // Asignamos el decoded payload (que ahora es el user object directo)
        // Y leemos el Header 'x-empresa-id' inyectado por el Frontend
        req.user = decoded.user ? decoded.user : decoded;
        
        const empresaId = req.header('x-empresa-id');
        if (empresaId) {
            req.user.empresaId = parseInt(empresaId, 10);
        } else {
            // Fallback (Solo para dev si no se envía la cabecera)
            req.user.empresaId = 1;
        }
        
        next();
    } catch (err) {
        // Temporary bypass for development
        req.user = { UsuarioID: 1, Usuario: 'admin', empresaId: 1 };
        next();
    }
};

module.exports = authMiddleware;
