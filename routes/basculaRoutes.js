const express = require('express');
const router = express.Router();
const basculaDB = require('../model/basculaDB');
const pacienteDB = require('../model/pacienteDB');

// ========== FUNCIÓN HELPER PARA CALCULAR EDAD ==========
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

// ========== RUTAS WEB (VISTAS) ==========

// Listar todos los registros de báscula
router.get('/', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    basculaDB.obtenerBasculas((err, registros) => {
        if (err) {
            console.error('Error al obtener registros de báscula:', err);
            req.session.error = 'Error al cargar registros';
            return res.redirect('/');
        }
        
        console.log('Registros obtenidos:', registros[0]); // Debug
        
        // Calcular IMC para cada registro si no está calculado
        const registrosConIMC = (registros || []).map(registro => {
            const imc = basculaDB.calcularIMC(registro.peso, registro.altura);
            const clasificacion = basculaDB.clasificacionIMC(imc);
            return {
                ...registro,
                imc: imc,
                clasificacion: clasificacion
            };
        });
        
        // IMPORTANTE: Pasar paciente como null cuando no hay paciente específico
        res.render('basculas/list', {
            title: 'Registros de Peso',
            registros: registrosConIMC,
            paciente: null,  // ← ESTA ES LA CORRECCIÓN
            usuario: req.session.usuario,
            calcularEdad: calcularEdad
        });
    });
});

// Listar registros por paciente
router.get('/paciente/:id', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    const pacienteId = req.params.id;
    
    // Primero obtener información del paciente
    pacienteDB.obtenerPacientePorId(pacienteId, (errPaciente, paciente) => {
        if (errPaciente || !paciente) {
            req.session.error = 'Paciente no encontrado';
            return res.redirect('/pacientes');
        }
        
        // Obtener registros de báscula del paciente
        basculaDB.obtenerPorPacienteId(pacienteId, (err, registros) => {
            if (err) {
                console.error('Error al obtener registros:', err);
                req.session.error = 'Error al cargar registros';
                return res.redirect('/pacientes');
            }
            
            // Calcular IMC para cada registro
            const registrosConIMC = (registros || []).map(registro => {
                const imc = basculaDB.calcularIMC(registro.peso, registro.altura);
                const clasificacion = basculaDB.clasificacionIMC(imc);
                return {
                    ...registro,
                    imc: imc,
                    clasificacion: clasificacion
                };
            });
            
            res.render('basculas/list', {
                title: `Peso - ${paciente.nombre} ${paciente.apellido}`,
                registros: registrosConIMC,
                paciente: paciente,
                usuario: req.session.usuario,
                calcularEdad: calcularEdad
            });
        });
    });
});

// Formulario para nuevo registro (sin paciente específico)
router.get('/nuevo', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    // Mostrar lista de pacientes para elegir
    pacienteDB.obtenerPacientes((err, pacientes) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            req.session.error = 'Error al cargar pacientes';
            return res.redirect('/');
        }
        
        res.render('basculas/select-paciente', {
            title: 'Seleccionar Paciente',
            pacientes: pacientes || [],
            usuario: req.session.usuario,
            calcularEdad: calcularEdad
        });
    });
});

// Formulario para nuevo registro (con paciente específico)
router.get('/nuevo/:paciente_id', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    const pacienteId = req.params.paciente_id;
    
    // Si viene de un paciente específico
    pacienteDB.obtenerPacientePorId(pacienteId, (err, paciente) => {
        if (err || !paciente) {
            req.session.error = 'Paciente no encontrado';
            return res.redirect('/pacientes');
        }
        
        res.render('basculas/form', {
            title: 'Nuevo Registro de Peso',
            paciente: paciente,
            registro: null,
            usuario: req.session.usuario,
            calcularEdad: calcularEdad
        });
    });
});

// Formulario para editar registro
router.get('/editar/:id', (req, res) => {
    if (!req.session.usuario) {
        req.session.error = 'Debes iniciar sesión para acceder';
        return res.redirect('/login');
    }
    
    const registroId = req.params.id;
    
    basculaDB.obtenerBasculaPorId(registroId, (err, registro) => {
        if (err || !registro) {
            req.session.error = 'Registro no encontrado';
            return res.redirect('/basculas');
        }
        
        // Obtener información del paciente
        pacienteDB.obtenerPacientePorId(registro.paciente_id, (errPaciente, paciente) => {
            if (errPaciente || !paciente) {
                req.session.error = 'Paciente no encontrado';
                return res.redirect('/basculas');
            }
            
            // Calcular IMC
            const imc = basculaDB.calcularIMC(registro.peso, registro.altura);
            const clasificacion = basculaDB.clasificacionIMC(imc);
            
            res.render('basculas/form', {
                title: 'Editar Registro de Peso',
                paciente: paciente,
                registro: {
                    ...registro,
                    imc: imc,
                    clasificacion: clasificacion
                },
                usuario: req.session.usuario,
                calcularEdad: calcularEdad
            });
        });
    });
});

// ========== RUTAS API (CRUD) ==========

// Crear registro (API)
router.post('/api', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const { paciente_id, peso, altura, fecha_medicion } = req.body;
    
    if (!paciente_id || !peso || !altura) {
        return res.status(400).json({
            success: false,
            error: 'Paciente, peso y altura son requeridos'
        });
    }
    
    // Convertir valores a números
    const paciente_id_num = parseInt(paciente_id, 10);
    const peso_num = parseFloat(peso);
    const altura_num = parseFloat(altura);
    
    // Calcular IMC
    const imc = basculaDB.calcularIMC(peso_num, altura_num);
    const clasificacion = basculaDB.clasificacionIMC(imc);
    
    basculaDB.insertarBascula(
        paciente_id_num, 
        peso_num, 
        altura_num, 
        fecha_medicion || new Date(), 
        (err, registroId) => {
            if (err) {
                console.error('Error al crear registro:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al crear registro'
                });
            }
            
            req.session.mensaje = 'Registro de peso creado exitosamente';
            res.json({
                success: true,
                message: 'Registro creado exitosamente',
                registroId: registroId,
                imc: imc,
                clasificacion: clasificacion
            });
        }
    );
});

// Actualizar registro (API)
router.put('/api/:id', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const registroId = req.params.id;
    const { peso, altura, fecha_medicion } = req.body;
    
    // Convertir valores a números
    const peso_num = peso ? parseFloat(peso) : null;
    const altura_num = altura ? parseFloat(altura) : null;
    
    // Calcular IMC si se actualizan peso o altura
    let imc = null;
    let clasificacion = null;
    
    if (peso_num && altura_num) {
        imc = basculaDB.calcularIMC(peso_num, altura_num);
        clasificacion = basculaDB.clasificacionIMC(imc);
    }
    
    basculaDB.modificarBascula(
        registroId, 
        peso_num, 
        altura_num, 
        fecha_medicion, 
        (err, result) => {
            if (err) {
                console.error('Error al actualizar registro:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al actualizar registro'
                });
            }
            
            if (result > 0) {
                req.session.mensaje = 'Registro actualizado exitosamente';
                res.json({
                    success: true,
                    message: 'Registro actualizado exitosamente',
                    imc: imc,
                    clasificacion: clasificacion
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Registro no encontrado'
                });
            }
        }
    );
});

// Eliminar registro (API)
router.delete('/api/:id', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const registroId = req.params.id;
    
    basculaDB.eliminarBascula(registroId, (err, result) => {
        if (err) {
            console.error('Error al eliminar registro:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al eliminar registro'
            });
        }
        
        if (result > 0) {
            req.session.mensaje = 'Registro eliminado exitosamente';
            res.json({
                success: true,
                message: 'Registro eliminado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Registro no encontrado'
            });
        }
    });
});

// Obtener último registro de paciente (API)
router.get('/api/paciente/:id/ultima', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
    
    const pacienteId = req.params.id;
    
    basculaDB.obtenerUltimaMedicion(pacienteId, (err, registro) => {
        if (err) {
            console.error('Error al obtener última medición:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener medición'
            });
        }
        
        if (registro) {
            // Calcular IMC
            const imc = basculaDB.calcularIMC(registro.peso, registro.altura);
            const clasificacion = basculaDB.clasificacionIMC(imc);
            
            res.json({
                success: true,
                registro: {
                    ...registro,
                    imc: imc,
                    clasificacion: clasificacion
                }
            });
        } else {
            res.json({
                success: true,
                registro: null,
                message: 'No hay registros para este paciente'
            });
        }
    });
});

module.exports = router;