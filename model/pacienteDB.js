const db = require('../config/db');

// Obtener todos los pacientes
function obtenerPacientes(callback) {
  db.query('SELECT * FROM pacientes', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

// Insertar un nuevo paciente - CORREGIDO
function insertarPaciente(nombre, apellido, fecha_nacimiento, sexo, callback) {
  const sql = 'INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, sexo) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, apellido, fecha_nacimiento, sexo], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

// Buscar paciente por ID
function obtenerPacientePorId(id, callback) {
  db.query('SELECT * FROM pacientes WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Modificar paciente por ID - CORREGIDO
function modificarPaciente(id, nombre, apellido, fecha_nacimiento, sexo, callback) {
  const sql = 'UPDATE pacientes SET nombre = ?, apellido = ?, fecha_nacimiento = ?, sexo = ? WHERE id = ?';
  db.query(sql, [nombre, apellido, fecha_nacimiento, sexo, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

// Eliminar paciente por ID
function eliminarPaciente(id, callback) {
  db.query('DELETE FROM pacientes WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

module.exports = {
  obtenerPacientes,
  insertarPaciente,
  obtenerPacientePorId,
  modificarPaciente,
  eliminarPaciente
};