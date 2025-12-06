const pacienteDB = require('./pacienteDB');
const db = require('./config/db');

// Limpiar la tabla de pacientes
function limpiarPacientes(callback) {
  db.query('DELETE FROM pacientes', (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
}

// Insertar pacientes evitando duplicados por nombre y fecha de nacimiento
function insertarPacienteSinDuplicados(paciente, callback) {
  const sqlCheck = 'SELECT * FROM pacientes WHERE nombre = ? AND apellido = ? AND fecha_nacimiento = ?';
  db.query(sqlCheck, [paciente.nombre, paciente.apellidos, paciente.fecha_nacimiento], (err, results) => {
    if (err) return callback(err);
    if (results.length > 0) {
      return callback(null, 'Duplicado');
    }
    pacienteDB.insertarPaciente(paciente.nombre, paciente.apellidos, paciente.fecha_nacimiento, paciente.sexo, callback);
  });
}

// Ejemplo de uso
limpiarPacientes((err, rows) => {
  if (err) {
    console.error('Error al limpiar pacientes:', err);
    return;
  }
  console.log(`Pacientes eliminados: ${rows}`);

  const pacientes = [
    { nombre: 'Juan', apellidos: 'Pérez', fecha_nacimiento: '1990-05-15', sexo: 'M' },
    { nombre: 'María', apellidos: 'García', fecha_nacimiento: '1985-10-22', sexo: 'F' },
    { nombre: 'Carlos', apellidos: 'López', fecha_nacimiento: '2000-03-08', sexo: 'M' }
  ];

  pacientes.forEach((p) => {
    insertarPacienteSinDuplicados(p, (err, res) => {
      if (err) {
        console.error('Error al insertar paciente:', err);
      } else if (res === 'Duplicado') {
        console.log(`Paciente duplicado: ${p.nombre} ${p.apellidos}`);
      } else {
        console.log(`Paciente insertado con ID: ${res}`);
      }

      // Si es Juan Pérez, modificar el sexo a 'F'
      if (p.nombre === 'Juan' && p.apellidos === 'Pérez') {
        // Buscar el paciente por nombre, apellido y fecha de nacimiento
        const pacienteDB = require('./pacienteDB');
        const db = require('./config/db');
        db.query('SELECT id FROM pacientes WHERE nombre = ? AND apellido = ? AND fecha_nacimiento = ?', [p.nombre, p.apellidos, p.fecha_nacimiento], (err, results) => {
          if (err) {
            console.error('Error al buscar paciente Juan Pérez:', err);
            return;
          }
          if (results.length > 0) {
            const idJuan = results[0].id;
            pacienteDB.modificarPaciente(idJuan, p.nombre, p.apellidos, p.fecha_nacimiento, 'F', (err, rows) => {
              if (err) {
                console.error('Error al modificar sexo de Juan Pérez:', err);
              } else {
                console.log(`Sexo de Juan Pérez modificado a 'F' (${rows} filas afectadas)`);
              }
            });
          }
        });
      }
    });
  });
});

// Consultar todos los pacientes
pacienteDB.obtenerPacientes((err, pacientes) => {
  if (err) {
    console.error('Error al obtener pacientes:', err);
    return;
  }
  console.log('Lista de pacientes:', pacientes);

  // Modificar el primer paciente (si existe)
  if (pacientes.length > 0) {
    const primerPaciente = pacientes[0];
    pacienteDB.modificarPaciente(primerPaciente.id, 'NombreModificado', 'ApellidoModificado', primerPaciente.fecha_nacimiento, primerPaciente.sexo, (err, rows) => {
      if (err) {
        console.error('Error al modificar paciente:', err);
        return;
      }
      console.log(`Paciente con ID ${primerPaciente.id} modificado (${rows} filas afectadas)`);

      // Eliminar el segundo paciente (si existe)
      if (pacientes.length > 1) {
        const segundoPaciente = pacientes[1];
        pacienteDB.eliminarPaciente(segundoPaciente.id, (err, rows) => {
          if (err) {
            console.error('Error al eliminar paciente:', err);
            return;
          }
          console.log(`Paciente con ID ${segundoPaciente.id} eliminado (${rows} filas afectadas)`);
        });
      }
    });
  }
});