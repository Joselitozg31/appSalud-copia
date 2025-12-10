const db = require('../config/db');

// Insertar registro de temperatura
function insertarTemperatura(paciente_id, temperatura, fecha_registro, callback) {
  // Validaciones básicas
  if (typeof paciente_id !== 'number' || isNaN(paciente_id)) {
    return callback(new Error('paciente_id inválido'));
  }
  if (typeof temperatura !== 'number' || isNaN(temperatura)) {
    return callback(new Error('temperatura inválida'));
  }

  let sql, params;
  if (fecha_registro) {
    sql = 'INSERT INTO temperaturas (paciente_id, temperatura, fecha_registro) VALUES (?, ?, ?)';
    params = [paciente_id, temperatura, fecha_registro];
  } else {
    sql = 'INSERT INTO temperaturas (paciente_id, temperatura) VALUES (?, ?)';
    params = [paciente_id, temperatura];
  }
  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

// Listar todos los registros de temperatura
function obtenerTemperaturas(callback) {
  db.query('SELECT * FROM temperaturas', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

// Consultar registro por ID
function obtenerTemperaturaPorId(id, callback) {
  db.query('SELECT * FROM temperaturas WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Modificar registro de temperatura
function modificarTemperatura(id, temperatura, fecha_registro, callback) {
  const sql = 'UPDATE temperaturas SET temperatura = ?, fecha_registro = ? WHERE id = ?';
  db.query(sql, [temperatura, fecha_registro, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

// Eliminar registro de temperatura
function eliminarTemperatura(id, callback) {
  db.query('DELETE FROM temperaturas WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

module.exports = {
  insertarTemperatura,
  obtenerTemperaturas,
  obtenerTemperaturaPorId,
  modificarTemperatura,
  eliminarTemperatura
};
