const express = require('express');
const router = express.Router();
const temperaturaDB = require('../model/temperaturaDB');
const pacienteDB = require('../model/pacienteDB');

// Helper edad (reutilizado)
const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

// Lista general de temperaturas
router.get('/', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }

    temperaturaDB.obtenerTemperaturas((err, registros) => {
        if (err) {
            console.error('Error al obtener registros de temperatura:', err);
            req.session.error = 'Error al cargar registros';
            return res.redirect('/');
        }

        res.render('temperaturas/list', {
            title: 'Registros de Temperatura',
            registros: registros || [],
            paciente: null,
            usuario: req.session.usuario,
            calcularEdad: calcularEdad
        });
    });
});

// Lista por paciente
router.get('/paciente/:id', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }

    const pacienteId = req.params.id;
    pacienteDB.obtenerPacientePorId(pacienteId, (errPac, paciente) => {
        if (errPac || !paciente) {
            req.session.error = 'Paciente no encontrado';
            return res.redirect('/pacientes');
        }

        temperaturaDB.obtenerTemperaturas((err, registros) => {
            if (err) {
                console.error('Error al obtener registros:', err);
                req.session.error = 'Error al cargar registros';
                return res.redirect('/pacientes');
            }

            // Filtrar por paciente
            const regs = (registros || []).filter(r => String(r.paciente_id) === String(pacienteId))
                .sort((a,b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));

            res.render('temperaturas/list', {
                title: `Temperatura - ${paciente.nombre} ${paciente.apellido}`,
                registros: regs,
                paciente: paciente,
                usuario: req.session.usuario,
                calcularEdad: calcularEdad
            });
        });
    });
});

// Form nuevo (sin paciente)
router.get('/nuevo', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    pacienteDB.obtenerPacientes((err, pacientes) => {
        if (err) {
            req.session.error = 'Error al cargar pacientes';
            return res.redirect('/');
        }
        res.render('temperaturas/form', { title: 'Nuevo Registro de Temperatura', pacientes: pacientes || [], registro: null, paciente: null, usuario: req.session.usuario });
    });
});

// Form nuevo con paciente
router.get('/nuevo/:paciente_id', (req, res) => {
    if (!req.session.usuario) return res.redirect('/login');
    const pacienteId = req.params.paciente_id;
    pacienteDB.obtenerPacientePorId(pacienteId, (err, paciente) => {
        if (err || !paciente) { req.session.error = 'Paciente no encontrado'; return res.redirect('/pacientes'); }
        res.render('temperaturas/form', { title: 'Nuevo Registro de Temperatura', registro: null, paciente: paciente, usuario: req.session.usuario });
    });
});

// Editar
router.get('/editar/:id', (req, res) => {
    if (!req.session.usuario) return res.redirect('/login');
    const id = req.params.id;
    temperaturaDB.obtenerTemperaturaPorId(id, (err, registro) => {
        if (err || !registro) { req.session.error = 'Registro no encontrado'; return res.redirect('/temperaturas'); }
        pacienteDB.obtenerPacientePorId(registro.paciente_id, (errP, paciente) => {
            if (errP || !paciente) { req.session.error = 'Paciente no encontrado'; return res.redirect('/temperaturas'); }
            res.render('temperaturas/form', { title: 'Editar Registro de Temperatura', registro: registro, paciente: paciente, usuario: req.session.usuario });
        });
    });
});

// API: crear
router.post('/api', (req, res) => {
    if (!req.session.usuario) return res.status(401).json({ success: false, error: 'No autorizado' });
    const { paciente_id, temperatura, fecha_medicion } = req.body;
    if (!paciente_id || !temperatura) return res.status(400).json({ success: false, error: 'Paciente y temperatura son requeridos' });
    const pacienteNum = parseInt(paciente_id,10);
    const tempNum = parseFloat(temperatura);
    temperaturaDB.insertarTemperatura(pacienteNum, tempNum, fecha_medicion || new Date(), (err, id) => {
        if (err) { console.error('Error al crear temperatura:', err); return res.status(500).json({ success:false, error:'Error al crear registro' }); }
        req.session.mensaje = 'Registro de temperatura creado exitosamente';
        res.json({ success: true, message: 'Registro creado', registroId: id });
    });
});

// API: actualizar
router.put('/api/:id', (req, res) => {
    if (!req.session.usuario) return res.status(401).json({ success:false, error:'No autorizado' });
    const id = req.params.id;
    const { temperatura, fecha_medicion } = req.body;
    const tempNum = parseFloat(temperatura);
    temperaturaDB.modificarTemperatura(id, tempNum, fecha_medicion, (err, result) => {
        if (err) { console.error('Error al actualizar temperatura:', err); return res.status(500).json({ success:false, error:'Error al actualizar' }); }
        if (result > 0) return res.json({ success:true, message:'Registro actualizado' });
        res.status(404).json({ success:false, error:'Registro no encontrado' });
    });
});

// API: eliminar
router.delete('/api/:id', (req, res) => {
    if (!req.session.usuario) return res.status(401).json({ success:false, error:'No autorizado' });
    const id = req.params.id;
    temperaturaDB.eliminarTemperatura(id, (err, result) => {
        if (err) { console.error('Error al eliminar temperatura:', err); return res.status(500).json({ success:false, error:'Error al eliminar' }); }
        if (result > 0) return res.json({ success:true, message:'Registro eliminado' });
        res.status(404).json({ success:false, error:'Registro no encontrado' });
    });
});

module.exports = router;
