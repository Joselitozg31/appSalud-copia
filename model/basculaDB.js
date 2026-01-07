const db = require('../config/db');

// Insertar registro de peso y altura
function insertarBascula(paciente_id, peso, altura, fecha_registro, callback) {
  // Validaciones básicas
  if (typeof paciente_id !== 'number' || isNaN(paciente_id)) {
    return callback(new Error('paciente_id inválido'));
  }
  if (typeof peso !== 'number' || isNaN(peso)) {
    return callback(new Error('peso inválido'));
  }
  if (typeof altura !== 'number' || isNaN(altura)) {
    return callback(new Error('altura inválida'));
  }

  let sql, params;
  if (fecha_registro) {
    sql = 'INSERT INTO basculas (paciente_id, peso, altura, fecha_registro) VALUES (?, ?, ?, ?)';
    params = [paciente_id, peso, altura, fecha_registro];
  } else {
    sql = 'INSERT INTO basculas (paciente_id, peso, altura) VALUES (?, ?, ?)';
    params = [paciente_id, peso, altura];
  }
  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

// Listar todos los registros de bascula
function obtenerBasculas(callback) {
  db.query(`
    SELECT b.id, 
           b.paciente_id,
           b.peso,
           b.altura,
           b.fecha_registro,
           CONCAT(p.nombre, ' ', p.apellido) as nombre_paciente,
           p.nombre,
           p.apellido,
           p.fecha_nacimiento
    FROM basculas b
    LEFT JOIN pacientes p ON b.paciente_id = p.id
    ORDER BY b.fecha_registro DESC
  `, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

// Consultar registro por ID
function obtenerBasculaPorId(id, callback) {
  db.query('SELECT * FROM basculas WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Modificar registro de bascula
function modificarBascula(id, peso, altura, fecha_registro, callback) {
  let sql, params;
  if (fecha_registro) {
    sql = 'UPDATE basculas SET peso = ?, altura = ?, fecha_registro = ? WHERE id = ?';
    params = [peso, altura, fecha_registro, id];
  } else {
    sql = 'UPDATE basculas SET peso = ?, altura = ? WHERE id = ?';
    params = [peso, altura, id];
  }
  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

// Eliminar registro de bascula
function eliminarBascula(id, callback) {
  db.query('DELETE FROM basculas WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

// Calcular IMC
function calcularIMC(peso, altura) {
  if (!peso || !altura) return null;
  // Altura en metros
  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);
  return parseFloat(imc.toFixed(2));
}

// Clasificación IMC
function clasificacionIMC(imc) {
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

// Obtener registros por paciente ID
function obtenerPorPacienteId(pacienteId, callback) {
    db.query('SELECT * FROM basculas WHERE paciente_id = ? ORDER BY fecha_registro DESC', [pacienteId], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

// Obtener última medición de un paciente
function obtenerUltimaMedicion(pacienteId, callback) {
    db.query('SELECT * FROM basculas WHERE paciente_id = ? ORDER BY fecha_registro DESC LIMIT 1', [pacienteId], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
}

// Actualiza el module.exports para incluir las nuevas funciones
module.exports = {
    insertarBascula,
    obtenerBasculas,
    obtenerBasculaPorId,
    modificarBascula,
    eliminarBascula,
    calcularIMC,
    clasificacionIMC,
    obtenerPorPacienteId,      // NUEVA
    obtenerUltimaMedicion      // NUEVA
};
