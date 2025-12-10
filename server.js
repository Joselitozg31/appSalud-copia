const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Importar rutas
const authRoutes = require('./routes/authRoutes');

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
    secure: false, // Cambiar a true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

// Pasar datos a vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.mensaje = req.session.mensaje || null;
  res.locals.error = req.session.error || null;
  
  // Limpiar mensajes flash
  delete req.session.mensaje;
  delete req.session.error;
  
  next();
});

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// IMPORTANTE: Configurar layout.ejs como plantilla por defecto
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout'); // Usa views/layout.ejs como layout

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-CSRF-Token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========== RUTAS WEB ==========

app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Inicio',
    usuario: req.session.usuario
  });
});

app.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.render('auth/login', { 
    title: 'Iniciar Sesión',
    layout: 'layout' // Usar layout.ejs
  });
});

app.get('/registro', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.render('auth/registro', { 
    title: 'Registro de Usuario',
    layout: 'layout'
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ========== RUTAS API ==========

app.use('/api/auth', authRoutes);

app.get('/api/status', (req, res) => {
  res.json({ 
    success: true,
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/protegido', require('./middleware/authMiddleware').verificarToken, (req, res) => {
  res.json({
    success: true,
    mensaje: 'Ruta protegida accesible',
    usuario: req.usuario
  });
});

// ========== MANEJO ERRORES ==========

app.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', { 
      title: 'Página no encontrada',
      layout: 'layout'
    });
  }
  next();
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada' 
  });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  if (req.accepts('html')) {
    return res.status(500).render('500', { 
      title: 'Error del servidor',
      error: err.message,
      layout: 'layout'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// ========== INICIAR ==========

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📂 Estructura:`);
  console.log(`   ├── views/`);
  console.log(`   │   ├── index.ejs`);
  console.log(`   │   ├── layout.ejs`);
  console.log(`   │   └── auth/login.ejs`);
  console.log(`   └── public/css/style.css`);
  console.log(`\n🌐 Vistas:`);
  console.log(`   http://localhost:${PORT}/       - Página principal`);
  console.log(`   http://localhost:${PORT}/login  - Login`);
  console.log(`   http://localhost:${PORT}/registro - Registro`);
});