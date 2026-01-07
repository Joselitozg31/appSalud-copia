const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuarioDB = require('../model/usuarioDB');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_app_salud_2024';

// REGISTRO DE USUARIO
router.post('/registro', (req, res) => {
  const { username, password, email, rol = 'user' } = req.body;
  
  // Validaciones básicas
  if (!username || !password || !email) {
    return res.status(400).json({ 
      success: false,
      error: 'Username, password y email son requeridos' 
    });
  }
  
  // Verificar si usuario ya existe
  usuarioDB.obtenerPorUsername(username, (err, usuarioExistente) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        success: false,
        error: 'El nombre de usuario ya está en uso' 
      });
    }
    
    // Hash de la contraseña
    bcrypt.hash(password, 10, (err, password_hash) => {
      if (err) {
        console.error('Error al hashear password:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error interno del servidor' 
        });
      }
      
      // Crear usuario
      usuarioDB.crearUsuario(
        { username, password_hash, email, rol },
        (err, usuarioId) => {
          if (err) {
            console.error('Error al crear usuario:', err);
            return res.status(500).json({ 
              success: false,
              error: 'Error interno del servidor' 
            });
          }
          
          // Guardar usuario en sesión
          req.session.usuario = {
            id: usuarioId,
            username,
            email,
            rol
          };
          req.session.mensaje = '¡Registro exitoso! Por favor inicia sesión';

          // Generar token JWT
          const token = jwt.sign(
            { 
              id: usuarioId, 
              username, 
              rol 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
          );
          
          // Guardar sesión explícitamente
          req.session.save((err) => {
            if (err) {
              console.error('Error al guardar sesión:', err);
              return res.status(500).json({
                success: false,
                error: 'Error al crear sesión'
              });
            }
            
            res.status(201).json({
              success: true,
              mensaje: 'Usuario registrado exitosamente',
              token,
              usuario: {
                id: usuarioId,
                username,
                email,
                rol
              },
              session: req.sessionID
            });
          });
        }
      );
    });
  });
});

// LOGIN DE USUARIO
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Username y password son requeridos' 
    });
  }
  
  // Buscar usuario
  usuarioDB.obtenerPorUsername(username, (err, usuario) => {
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
        error: 'Credenciales inválidas' 
      });
    }
    
    // Verificar contraseña
    bcrypt.compare(password, usuario.password_hash, (err, passwordValida) => {
      if (err) {
        console.error('Error al comparar passwords:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error interno del servidor' 
        });
      }
      
      if (!passwordValida) {
        return res.status(401).json({ 
          success: false,
          error: 'Credenciales inválidas' 
        });
      }
      
      // Guardar usuario en sesión
      req.session.usuario = {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol
      };
      
      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          username: usuario.username, 
          rol: usuario.rol 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      // Guardar token en sesión también
      req.session.token = token;
      req.session.mensaje = '¡Login exitoso!';
      
      console.log('✅ Login exitoso para:', usuario.username);
      console.log('✅ Sesión ID:', req.sessionID);
      
      // Guardar la sesión explícitamente
      req.session.save((err) => {
        if (err) {
          console.error('Error al guardar sesión:', err);
          return res.status(500).json({
            success: false,
            error: 'Error al crear sesión'
          });
        }
        
        res.json({
          success: true,
          mensaje: 'Login exitoso',
          token: token,
          usuario: {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol
          },
          session: req.sessionID
        });
      });
    });
  });
});

// VERIFICAR SESIÓN (para mantener login)
router.get('/verificar', (req, res) => {
  if (req.session.usuario) {
    res.json({
      success: true,
      autenticado: true,
      usuario: req.session.usuario
    });
  } else {
    res.json({
      success: false,
      autenticado: false,
      error: 'No autenticado'
    });
  }
});

// LOGOUT (API)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir sesión:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al cerrar sesión'
      });
    }
    
    res.clearCookie('appSalud.sid');
    res.json({
      success: true,
      mensaje: 'Sesión cerrada exitosamente'
    });
  });
});

// OBTENER USUARIO ACTUAL
router.get('/usuario', (req, res) => {
  if (req.session.usuario) {
    res.json({
      success: true,
      usuario: req.session.usuario
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    });
  }
});

module.exports = router;