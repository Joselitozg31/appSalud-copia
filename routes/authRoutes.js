const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuarioDB = require('../model/usuarioDB');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_app_salud_2024';

// REGISTRO DE USUARIO (CORREGIDO: usa password_hash)
router.post('/registro', (req, res) => {
  const { username, password, email, rol = 'user' } = req.body;
  
  // Validaciones básicas
  if (!username || !password || !email) {
    return res.status(400).json({ 
      error: 'Username, password y email son requeridos' 
    });
  }
  
  // Verificar si usuario ya existe
  usuarioDB.obtenerPorUsername(username, (err, usuarioExistente) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está en uso' 
      });
    }
    
    // Hash de la contraseña (se guardará como password_hash)
    bcrypt.hash(password, 10, (err, password_hash) => {
      if (err) {
        console.error('Error al hashear password:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      // Crear usuario (CORREGIDO: usa password_hash)
      usuarioDB.crearUsuario(
        { username, password_hash, email, rol },
        (err, usuarioId) => {
          if (err) {
            console.error('Error al crear usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          
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
          
          res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            token,
            usuario: {
              id: usuarioId,
              username,
              email,
              rol
            }
          });
        }
      );
    });
  });
});

// LOGIN DE USUARIO (CORREGIDO: compara con password_hash)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username y password son requeridos' 
    });
  }
  
  // Buscar usuario
  usuarioDB.obtenerPorUsername(username, (err, usuario) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
    // Verificar contraseña (compara con password_hash)
    bcrypt.compare(password, usuario.password_hash, (err, passwordValida) => {
      if (err) {
        console.error('Error al comparar passwords:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!passwordValida) {
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }
      
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
      
      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    });
  });
});

module.exports = router;