const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',      
  user: 'root',           
  password: '',           
  database: 'app_salud'   
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conexión exitosa a MySQL');
});

module.exports = connection;
