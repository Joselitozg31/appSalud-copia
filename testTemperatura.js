const temperaturaDB = require('./temperaturaDB');
const pacienteDB = require('./pacienteDB');

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
  const temperatura = 36.8;
  // No pasamos fecha_registro para usar el valor por defecto
  console.log('Valores a insertar:', { pacienteId, temperatura });

  temperaturaDB.insertarTemperatura(pacienteId, temperatura, undefined, (err, tempId) => {
    if (err) {
      console.error('Error al insertar temperatura:', err);
      return;
    }
    console.log(`Registro de temperatura insertado con ID: ${tempId}`);

    // Consultar registro de temperatura por ID
    temperaturaDB.obtenerTemperaturaPorId(tempId, (err, temp) => {
      if (err) {
        console.error('Error al consultar temperatura:', err);
        return;
      }
      console.log('Registro de temperatura consultado:', temp);
    });
  });
});
