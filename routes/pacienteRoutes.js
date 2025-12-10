const express = require('express');
const router = express.Router();
const pacienteDB = require('../model/pacienteDB');
const { verificarToken } = require('../middleware/authMiddleware');

// ========== RUTAS WEB (VISTAS) ==========

// Listar todos los pacientes (vista web)
router.get('/', verificarToken, async (req, res) => {
    try {
        // Usamos promisify para convertir callback a promesa
        const obtenerPacientesPromise = () => new Promise((resolve, reject) => {
            pacienteDB.obtenerPacientes((err, pacientes) => {
                if (err) reject(err);
                else resolve(pacientes);
            });
        });
        
        const pacientes = await obtenerPacientesPromise();
        
        res.render('pacientes/list', {
            title: 'Gestión de Pacientes',
            pacientes: pacientes,
            usuario: req.usuario
        });
        
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        req.session.error = 'Error al cargar los pacientes';
        res.redirect('/');
    }
});

// Formulario para crear paciente
router.get('/nuevo', verificarToken, (req, res) => {
    res.render('pacientes/form', {
        title: 'Nuevo Paciente',
        paciente: null,
        usuario: req.usuario
    });
});

// Formulario para editar paciente
router.get('/editar/:id', verificarToken, async (req, res) => {
    try {
        const obtenerPacientePromise = (id) => new Promise((resolve, reject) => {
            pacienteDB.obtenerPacientePorId(id, (err, paciente) => {
                if (err) reject(err);
                else resolve(paciente);
            });
        });
        
        const paciente = await obtenerPacientePromise(req.params.id);
        
        if (!paciente) {
            req.session.error = 'Paciente no encontrado';
            return res.redirect('/pacientes');
        }
        
        res.render('pacientes/form', {
            title: 'Editar Paciente',
            paciente: paciente,
            usuario: req.usuario
        });
        
    } catch (error) {
        console.error('Error al obtener paciente:', error);
        req.session.error = 'Error al cargar el paciente';
        res.redirect('/pacientes');
    }
});

// ========== RUTAS API (CRUD) ==========

// Crear paciente (API)
router.post('/api', verificarToken, async (req, res) => {
    try {
        const { nombre, apellido, fecha_nacimiento, sexo } = req.body;
        
        if (!nombre || !apellido || !fecha_nacimiento || !sexo) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }
        
        const insertarPacientePromise = () => new Promise((resolve, reject) => {
            pacienteDB.insertarPaciente(nombre, apellido, fecha_nacimiento, sexo, (err, pacienteId) => {
                if (err) reject(err);
                else resolve(pacienteId);
            });
        });
        
        const pacienteId = await insertarPacientePromise();
        
        res.json({
            success: true,
            message: 'Paciente creado exitosamente',
            pacienteId: pacienteId
        });
        
    } catch (error) {
        console.error('Error al crear paciente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear paciente'
        });
    }
});

// Actualizar paciente (API)
router.put('/api/:id', verificarToken, async (req, res) => {
    try {
        const pacienteId = req.params.id;
        const { nombre, apellido, fecha_nacimiento, sexo } = req.body;
        
        const modificarPacientePromise = () => new Promise((resolve, reject) => {
            pacienteDB.modificarPaciente(pacienteId, nombre, apellido, fecha_nacimiento, sexo, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        const result = await modificarPacientePromise();
        
        if (result > 0) {
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
        
    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar paciente'
        });
    }
});

// Eliminar paciente (API)
router.delete('/api/:id', verificarToken, async (req, res) => {
    try {
        const pacienteId = req.params.id;
        
        const eliminarPacientePromise = () => new Promise((resolve, reject) => {
            pacienteDB.eliminarPaciente(pacienteId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        const result = await eliminarPacientePromise();
        
        if (result > 0) {
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
        
    } catch (error) {
        console.error('Error al eliminar paciente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar paciente'
        });
    }
});

// Obtener paciente por ID (API)
router.get('/api/:id', verificarToken, async (req, res) => {
    try {
        const pacienteId = req.params.id;
        
        const obtenerPacientePromise = (id) => new Promise((resolve, reject) => {
            pacienteDB.obtenerPacientePorId(id, (err, paciente) => {
                if (err) reject(err);
                else resolve(paciente);
            });
        });
        
        const paciente = await obtenerPacientePromise(pacienteId);
        
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
        
    } catch (error) {
        console.error('Error al obtener paciente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener paciente'
        });
    }
});

// Listar todos los pacientes (API)
router.get('/api', verificarToken, async (req, res) => {
    try {
        const obtenerPacientesPromise = () => new Promise((resolve, reject) => {
            pacienteDB.obtenerPacientes((err, pacientes) => {
                if (err) reject(err);
                else resolve(pacientes);
            });
        });
        
        const pacientes = await obtenerPacientesPromise();
        
        res.json({
            success: true,
            pacientes: pacientes,
            total: pacientes.length
        });
        
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pacientes'
        });
    }
});

module.exports = router;