const basculaDB = require('../model/basculaDB');
const pacienteDB = require('../model/pacienteDB');
const db = require('../config/db');

// Limpiar la tabla de basculas antes de probar
function limpiarBasculas(callback) {
  db.query('DELETE FROM basculas', (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

limpiarBasculas((err, rows) => {
  if (err) {
    console.error('Error al limpiar basculas:', err);
    return;
  }
  console.log(`Registros de basculas eliminados: ${rows}`);

  // Obtener un paciente para asociar el registro
  pacienteDB.obtenerPacientes((err, pacientes) => {
    if (err) {
      console.error('Error al obtener pacientes:', err);
      return;
    }
    if (pacientes.length === 0) {
      console.log('No hay pacientes para asociar.');
      return;
    }
    const pacienteId = pacientes[0].id;
    const peso = 72.5;
    const altura = 175; // altura en cm
    console.log('Valores a insertar:', { pacienteId, peso, altura });

    basculaDB.insertarBascula(pacienteId, peso, altura, undefined, (err, basculaId) => {
      if (err) {
        console.error('Error al insertar bascula:', err);
        return;
      }
      console.log(`Registro de bascula insertado con ID: ${basculaId}`);

      // Consultar registro de bascula por ID
      basculaDB.obtenerBasculaPorId(basculaId, (err, bascula) => {
        if (err) {
          console.error('Error al consultar bascula:', err);
          return;
        }
        console.log('Registro de bascula consultado:', bascula);
        // Calcular IMC y clasificación
        const imc = basculaDB.calcularIMC(bascula.peso, bascula.altura);
        const clasificacion = basculaDB.clasificacionIMC(imc);
        console.log(`IMC: ${imc}, Clasificación: ${clasificacion}`);
      });
    });
  });
});
