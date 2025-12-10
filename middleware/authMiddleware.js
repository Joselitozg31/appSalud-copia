const jwt = require('jsonwebtoken');
const usuarioDB = require('../model/usuarioDB');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_app_salud_2024';

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
  try {
    // Obtener token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }
    
    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Error al verificar token:', err.message);
        return res.status(401).json({ 
          success: false,
          error: 'Token inválido o expirado.' 
        });
      }
      
      // Buscar usuario en la base de datos
      usuarioDB.obtenerPorId(decoded.id, (err, usuario) => {
        if (err) {
          console.error('Error al buscar usuario:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor' 
          });
        }
        
        if (!usuario) {
          return res.status(401).json({ 
            success: false,
            error: 'Usuario no encontrado.' 
          });
        }
        
        // Agregar usuario a la request
        req.usuario = usuario;
        req.userId = usuario.id;
        req.userRol = usuario.rol;
        req.token = token;
        
        next();
      });
    });
    
  } catch (error) {
    console.error('Error en middleware auth:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
}

// Middleware para verificar rol (admin, user, etc.)
function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción'
      });
    }
    
    next();
  };
}

module.exports = { verificarToken, verificarRol };