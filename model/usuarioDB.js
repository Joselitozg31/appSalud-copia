const db = require('../config/db');

// Crear nuevo usuario (CORREGIDO para usar password_hash)
function crearUsuario(usuario, callback) {
  const { username, password_hash, email, rol = 'user' } = usuario;
  const sql = 'INSERT INTO usuarios (username, password_hash, email, rol) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [username, password_hash, email, rol], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

// Obtener usuario por username (CORREGIDO para usar password_hash)
function obtenerPorUsername(username, callback) {
  const sql = 'SELECT * FROM usuarios WHERE username = ?';
  
  db.query(sql, [username], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
}

// Obtener usuario por ID (sin password)
function obtenerPorId(id, callback) {
  const sql = 'SELECT id, username, email, rol FROM usuarios WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
}

// Obtener todos los usuarios (sin passwords)
function obtenerTodos(callback) {
  const sql = 'SELECT id, username, email, rol FROM usuarios';
  
  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

module.exports = {
  crearUsuario,
  obtenerPorUsername,
  obtenerPorId,
  obtenerTodos
};