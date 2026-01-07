const express = require('express');
const router = express.Router();
const pacienteDB = require('../model/pacienteDB');

// ========== RUTAS WEB (VISTAS) ==========

// Listar todos los pacientes (vista web)
router.get('/', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    pacienteDB.obtenerPacientes((err, pacientes) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            req.session.error = 'Error al cargar pacientes';
            return res.redirect('/');
        }
        
        res.render('pacientes/list', {
            title: 'Gestión de Pacientes',
            pacientes: pacientes || [],
            usuario: req.session.usuario
        });
    });
});

// Formulario para crear paciente
router.get('/nuevo', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    res.render('pacientes/form', {
        title: 'Nuevo Paciente',
        paciente: null,
        usuario: req.session.usuario
    });
});

// Formulario para editar paciente
router.get('/editar/:id', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    pacienteDB.obtenerPacientePorId(req.params.id, (err, paciente) => {
        if (err || !paciente) {
            console.error('Error al obtener paciente:', err);
            req.session.error = 'Paciente no encontrado';
            return res.redirect('/pacientes');
        }
        
        res.render('pacientes/form', {
            title: 'Editar Paciente',
            paciente: paciente,
            usuario: req.session.usuario
        });
    });
});

// ========== RUTAS API (CRUD) ==========

// Crear paciente (API)
router.post('/api', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const { nombre, apellido, fecha_nacimiento, sexo } = req.body;
    
    if (!nombre || !apellido || !fecha_nacimiento || !sexo) {
        return res.status(400).json({
            success: false,
            error: 'Todos los campos son requeridos'
        });
    }
    
pacienteDB.insertarPaciente(nombre, apellido, fecha_nacimiento, sexo, (err, pacienteId) => {
        if (err) {
            console.error('Error al crear paciente:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al crear paciente'
            });
        }
        
        req.session.mensaje = 'Paciente creado exitosamente';
        res.json({
            success: true,
            message: 'Paciente creado exitosamente',
            pacienteId: pacienteId
        });
    });
});

// Actualizar paciente (API)
router.put('/api/:id', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const pacienteId = req.params.id;
    const { nombre, apellido, fecha_nacimiento, sexo } = req.body;
    
    pacienteDB.modificarPaciente(pacienteId, nombre, apellido, fecha_nacimiento, sexo, (err, result) => {
        if (err) {
            console.error('Error al actualizar paciente:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al actualizar paciente'
            });
        }
        
        if (result > 0) {
            req.session.mensaje = 'Paciente actualizado exitosamente';
            res.json({
                success: true,
                message: 'Paciente actualizado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Paciente no encontrado'
            });
        }
    });
});

// Eliminar paciente (API)
router.delete('/api/:id', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const pacienteId = req.params.id;
    
    pacienteDB.eliminarPaciente(pacienteId, (err, result) => {
        if (err) {
            console.error('Error al eliminar paciente:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al eliminar paciente'
            });
        }
        
        if (result > 0) {
            req.session.mensaje = 'Paciente eliminado exitosamente';
            res.json({
                success: true,
                message: 'Paciente eliminado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Paciente no encontrado'
            });
        }
    });
});

// Obtener paciente por ID (API)
router.get('/api/:id', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const pacienteId = req.params.id;
    
    pacienteDB.obtenerPacientePorId(pacienteId, (err, paciente) => {
        if (err) {
            console.error('Error al obtener paciente:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener paciente'
            });
        }
        
        if (paciente) {
            res.json({
                success: true,
                paciente: paciente
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Paciente no encontrado'
            });
        }
    });
});

// Listar todos los pacientes (API)
router.get('/api', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    pacienteDB.obtenerPacientes((err, pacientes) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener pacientes'
            });
        }
        
        res.json({
            success: true,
            pacientes: pacientes || [],
            total: pacientes ? pacientes.length : 0
        });
    });
});

module.exports = router;