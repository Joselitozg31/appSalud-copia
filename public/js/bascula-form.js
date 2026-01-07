// Funcionalidades específicas para el formulario de básculas

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formBascula');
    const pesoInput = document.getElementById('peso');
    const alturaInput = document.getElementById('altura');
    const fechaInput = document.getElementById('fecha_medicion');
    
    // ========== CALCULADORA DE IMC EN TIEMPO REAL ==========
    if (pesoInput && alturaInput) {
        // Crear contenedor para mostrar IMC
        const imcContainer = document.createElement('div');
        imcContainer.className = 'alert alert-info mt-3 mb-3';
        imcContainer.id = 'imcContainer';
        imcContainer.style.display = 'none';
        imcContainer.innerHTML = `
            <h5>Calculadora de IMC</h5>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>IMC:</strong> <span id="imcCalculado" class="badge bg-primary">--</span></p>
                </div>
                <div class="col-md-6">
                    <p><strong>Clasificación:</strong> <span id="clasificacionIMC" class="badge bg-secondary">--</span></p>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-md-12">
                    <div class="progress" style="height: 20px;">
                        <div id="imcProgress" class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-1">
                        <small>Bajo peso</small>
                        <small>Normal</small>
                        <small>Sobrepeso</small>
                        <small>Obesidad</small>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar después de los inputs de peso y altura
        const rowInputs = pesoInput.closest('.row');
        if (rowInputs) {
            rowInputs.parentNode.insertBefore(imcContainer, rowInputs.nextSibling);
        }
        
        // Función para calcular IMC
        function calcularIMCRealTime() {
            const peso = parseFloat(pesoInput.value) || 0;
            const altura = parseFloat(alturaInput.value) || 0;
            
            if (peso > 0 && altura > 0) {
                const alturaM = altura / 100;
                const imc = peso / (alturaM * alturaM);
                const imcRedondeado = imc.toFixed(2);
                
                // Mostrar resultado
                document.getElementById('imcCalculado').textContent = imcRedondeado;
                
                // Determinar clasificación y color
                let clasificacion = '';
                let colorClass = '';
                let progressWidth = 0;
                
                if (imc < 18.5) {
                    clasificacion = 'Bajo peso';
                    colorClass = 'info';
                    progressWidth = (imc / 18.5) * 25;
                } else if (imc < 25) {
                    clasificacion = 'Normal';
                    colorClass = 'success';
                    progressWidth = 25 + ((imc - 18.5) / (25 - 18.5)) * 25;
                } else if (imc < 30) {
                    clasificacion = 'Sobrepeso';
                    colorClass = 'warning';
                    progressWidth = 50 + ((imc - 25) / (30 - 25)) * 25;
                } else {
                    clasificacion = 'Obesidad';
                    colorClass = 'danger';
                    progressWidth = 75 + ((Math.min(imc, 40) - 30) / (40 - 30)) * 25;
                }
                
                document.getElementById('clasificacionIMC').textContent = clasificacion;
                document.getElementById('clasificacionIMC').className = `badge bg-${colorClass}`;
                
                // Actualizar barra de progreso
                const progressBar = document.getElementById('imcProgress');
                progressBar.style.width = `${Math.min(progressWidth, 100)}%`;
                progressBar.className = `progress-bar bg-${colorClass}`;
                
                // Mostrar contenedor
                imcContainer.style.display = 'block';
            } else {
                // Ocultar si no hay datos válidos
                imcContainer.style.display = 'none';
            }
        }
        
        // Escuchar cambios en los inputs
        pesoInput.addEventListener('input', calcularIMCRealTime);
        alturaInput.addEventListener('input', calcularIMCRealTime);
    }
    
    // ========== VALIDACIÓN DE FORMULARIO MEJORADA ==========
    if (form) {
        // Crear elementos para mensajes de error
        function crearMensajesError() {
            const pesoError = document.createElement('div');
            pesoError.className = 'invalid-feedback';
            pesoError.id = 'pesoError';
            pesoError.textContent = 'El peso debe ser entre 0.1 y 300 kg';
            
            const alturaError = document.createElement('div');
            alturaError.className = 'invalid-feedback';
            alturaError.id = 'alturaError';
            alturaError.textContent = 'La altura debe ser entre 1 y 250 cm';
            
            const fechaError = document.createElement('div');
            fechaError.className = 'invalid-feedback';
            fechaError.id = 'fechaError';
            fechaError.textContent = 'La fecha no puede ser futura';
            
            if (pesoInput) pesoInput.parentNode.appendChild(pesoError);
            if (alturaInput) alturaInput.parentNode.appendChild(alturaError);
            if (fechaInput) fechaInput.parentNode.appendChild(fechaError);
        }
        
        crearMensajesError();
        
        // Validar peso
        if (pesoInput) {
            pesoInput.addEventListener('blur', function() {
                const peso = parseFloat(this.value);
                if (peso <= 0 || peso > 300) {
                    this.classList.add('is-invalid');
                    document.getElementById('pesoError').style.display = 'block';
                } else {
                    this.classList.remove('is-invalid');
                    document.getElementById('pesoError').style.display = 'none';
                }
            });
        }
        
        // Validar altura
        if (alturaInput) {
            alturaInput.addEventListener('blur', function() {
                const altura = parseFloat(this.value);
                if (altura <= 0 || altura > 250) {
                    this.classList.add('is-invalid');
                    document.getElementById('alturaError').style.display = 'block';
                } else {
                    this.classList.remove('is-invalid');
                    document.getElementById('alturaError').style.display = 'none';
                }
            });
        }
        
        // Validar fecha (no futura)
        if (fechaInput) {
            fechaInput.addEventListener('change', function() {
                const fechaSeleccionada = new Date(this.value);
                const ahora = new Date();
                
                if (fechaSeleccionada > ahora) {
                    this.classList.add('is-invalid');
                    document.getElementById('fechaError').style.display = 'block';
                } else {
                    this.classList.remove('is-invalid');
                    document.getElementById('fechaError').style.display = 'none';
                }
            });
        }
        
        // Validación al enviar el formulario
        form.addEventListener('submit', function(e) {
            let esValido = true;
            let mensajesError = [];
            
            // Validar peso
            if (pesoInput) {
                const peso = parseFloat(pesoInput.value);
                if (!peso || peso <= 0 || peso > 300) {
                    pesoInput.classList.add('is-invalid');
                    document.getElementById('pesoError').style.display = 'block';
                    esValido = false;
                    mensajesError.push('El peso debe ser entre 0.1 y 300 kg');
                }
            }
            
            // Validar altura
            if (alturaInput) {
                const altura = parseFloat(alturaInput.value);
                if (!altura || altura <= 0 || altura > 250) {
                    alturaInput.classList.add('is-invalid');
                    document.getElementById('alturaError').style.display = 'block';
                    esValido = false;
                    mensajesError.push('La altura debe ser entre 1 y 250 cm');
                }
            }
            
            // Validar fecha
            if (fechaInput && fechaInput.value) {
                const fechaSeleccionada = new Date(fechaInput.value);
                const ahora = new Date();
                
                if (fechaSeleccionada > ahora) {
                    fechaInput.classList.add('is-invalid');
                    document.getElementById('fechaError').style.display = 'block';
                    esValido = false;
                    mensajesError.push('La fecha de medición no puede ser futura');
                }
            }
            
            // Validar paciente
            const pacienteSelect = document.getElementById('paciente_id');
            if (pacienteSelect && !pacienteSelect.value) {
                pacienteSelect.classList.add('is-invalid');
                esValido = false;
                mensajesError.push('Debe seleccionar un paciente');
            }
            
            if (!esValido) {
                e.preventDefault();
                
                // Mostrar mensaje de error consolidado
                const errorContainer = document.getElementById('errorAlert');
                if (!errorContainer) {
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
                    alertDiv.id = 'errorAlert';
                    alertDiv.innerHTML = `
                        <h5 class="alert-heading">Error en el formulario</h5>
                        <ul id="errorList"></ul>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    form.prepend(alertDiv);
                }
                
                const errorList = document.getElementById('errorList');
                errorList.innerHTML = '';
                mensajesError.forEach(error => {
                    const li = document.createElement('li');
                    li.textContent = error;
                    errorList.appendChild(li);
                });
                
                // Desplazar hacia el primer error
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalid.focus();
                }
                
                return false;
            }
            
            // Mostrar indicador de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
            submitBtn.disabled = true;
            
            e.preventDefault();
            
            const formData = new FormData(form);
            const paciente_id = formData.get('paciente_id');
            const isUpdate = form.action.includes('/api/') && registroId;
            const method = isUpdate ? 'PUT' : 'POST';
            
            // Crear objeto JSON desde FormData
            const data = Object.fromEntries(formData);
            
            fetch(form.action, {
                method: method,
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    showToast('success', result.message || (isUpdate ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente'));
                    setTimeout(() => {
                        // Redirigir a la página de pesos del paciente
                        window.location.href = `/basculas/paciente/${paciente_id}`;
                    }, 1500);
                } else {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showToast('error', result.error || 'Error al procesar la solicitud');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showToast('error', 'Error al procesar la solicitud');
            });
            
            return false;
        });
    }
    
    // ========== FUNCIÓN PARA MOSTRAR TOASTS ==========
    function showToast(type, message) {
        // Crear contenedor de toasts si no existe
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // Crear toast
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-triangle' : 
                    type === 'warning' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        bsToast.show();
        
        // Eliminar toast después de ocultarse
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    // ========== AUTOCOMPLETAR FECHA ACTUAL ==========
    if (fechaInput && !fechaInput.value) {
        const ahora = new Date();
        // Ajustar a zona horaria local
        const fechaLocal = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000));
        fechaInput.value = fechaLocal.toISOString().slice(0, 16);
    }
    
    // ========== ENFOQUE AUTOMÁTICO ==========
    if (pesoInput && !pesoInput.value) {
        pesoInput.focus();
    }
});