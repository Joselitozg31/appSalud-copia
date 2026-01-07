const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const basculaRoutes = require('./routes/basculaRoutes');
const temperaturaRoutes = require('./routes/temperaturaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARES ==========

// Parsear JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar sesiones
app.use(session({
  secret: 'app_salud_secreto_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  },
  name: 'appSalud.sid'
}));

// Pasar datos a vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.mensaje = req.session.mensaje || null;
  res.locals.error = req.session.error || null;
  
  // Limpiar mensajes flash después de mostrarlos
  if (req.session.mensaje || req.session.error) {
    delete req.session.mensaje;
    delete req.session.error;
  }
  
  next();
});

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// IMPORTANTE: Si tienes error con layouts, COMENTA estas líneas:
// const expressLayouts = require('express-ejs-layouts');
// app.use(expressLayouts);
// app.set('layout', 'layout');

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Logging de peticiones
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// ========== RUTAS WEB ==========

// Página principal
app.get('/', (req, res) => {
  const pacienteDB = require('./model/pacienteDB');
  const basculaDB = require('./model/basculaDB');
  const temperaturaDB = require('./model/temperaturaDB');
  
  let stats = { pacientes: 0, basculas: 0, temperaturas: 0 };
  let completed = 0;
  
  const renderIndex = () => {
    res.render('index', { 
      title: 'Inicio',
      usuario: req.session.usuario,
      stats: stats
    });
  };
  
  pacienteDB.obtenerPacientes((err, pacientes) => {
    if (!err && pacientes) stats.pacientes = pacientes.length;
    completed++;
    if (completed === 3) renderIndex();
  });
  
  basculaDB.obtenerBasculas((err, basculas) => {
    if (!err && basculas) stats.basculas = basculas.length;
    completed++;
    if (completed === 3) renderIndex();
  });
  
  temperaturaDB.obtenerTemperaturas((err, temperaturas) => {
    if (!err && temperaturas) stats.temperaturas = temperaturas.length;
    completed++;
    if (completed === 3) renderIndex();
  });
});

// Login - Vista
app.get('/login', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/');
  }
  res.render('auth/login', { 
    title: 'Iniciar Sesión'
  });
});

// Registro - Vista
app.get('/registro', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.render('auth/registro', { 
    title: 'Registro de Usuario'
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir sesión:', err);
    }
    res.clearCookie('appSalud.sid');
    res.redirect('/');
  });
});

// ========== RUTAS PROTEGIDAS (WEB) ==========

// Rutas de pacientes
app.use('/pacientes', pacienteRoutes);

// Rutas de básculas
app.use('/basculas', basculaRoutes);

// Rutas de temperaturas
app.use('/temperaturas', temperaturaRoutes);

// ========== RUTAS API ==========

// Rutas de autenticación (API)
app.use('/api/auth', authRoutes);

// API Status
app.get('/api/status', (req, res) => {
  res.json({ 
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    session: {
      id: req.sessionID?.substring(0, 10) + '...',
      usuario: req.session.usuario?.username || 'No logueado'
    }
  });
});

// Test de sesión
app.get('/api/session-test', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    usuario: req.session.usuario,
    cookie: req.headers.cookie
  });
});

// ========== MANEJO DE ERRORES ==========

// 404 para vistas
app.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', { 
      title: 'Página no encontrada'
    });
  }
  next();
});

// 404 para API
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Error general
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  
  if (req.accepts('html')) {
    return res.status(500).render('500', { 
      title: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`\n🌐 VISTAS WEB DISPONIBLES:`);
  console.log(`   http://localhost:${PORT}/              - Página principal`);
  console.log(`   http://localhost:${PORT}/login         - Login`);
  console.log(`   http://localhost:${PORT}/registro      - Registro`);
  console.log(`   http://localhost:${PORT}/pacientes     - Gestión de pacientes`);
  console.log(`   http://localhost:${PORT}/basculas      - Gestión de básculas`);
  console.log(`   http://localhost:${PORT}/temperaturas - Gestión de temperaturas`);
  console.log(`\n📡 API DISPONIBLES:`);
  console.log(`   GET  /api/status          - Estado del servidor`);
  console.log(`   POST /api/auth/registro   - Registro`);
  console.log(`   POST /api/auth/login      - Login`);
  console.log(`   GET  /api/session-test    - Test de sesión`);
});