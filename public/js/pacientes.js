// public/js/pacientes.js

// Funcionalidades específicas para la gestión de pacientes
class PacientesManager {
    constructor() {
        this.pacienteIdToDelete = null;
        this.init();
    }
    
    init() {
        this.setupSearch();
        this.setupDeleteButtons();
        this.setupConfirmDelete();
        this.setupFormValidation();
        this.setupDateValidation();
        this.setupBackButton();
        this.setupAutoCalculateAge();
        this.setupPhoneMask();
    }
    
    // Búsqueda en tiempo real
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#pacientesTable tbody tr');
                let visibleCount = 0;
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        row.style.display = '';
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                const countElement = document.getElementById('count');
                if (countElement) {
                    countElement.textContent = visibleCount;
                }
            });
        }
    }
    
    // Configurar botones de eliminar
    setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.pacienteIdToDelete = e.currentTarget.getAttribute('data-id');
                const patientName = e.currentTarget.getAttribute('data-name');
                
                document.getElementById('patientName').textContent = patientName;
                const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
                modal.show();
            });
        });
    }
    
    // Confirmar eliminación
    setupConfirmDelete() {
        const confirmBtn = document.getElementById('confirmDelete');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async () => {
                if (!this.pacienteIdToDelete) return;
                
                try {
                    // Obtener token del localStorage o de una cookie
                    const token = localStorage.getItem('token') || this.getCookie('token') || '';
                    
                    const response = await fetch(`/pacientes/api/${this.pacienteIdToDelete}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Mostrar mensaje de éxito y recargar
                        this.showAlert('success', 'Paciente eliminado exitosamente');
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        this.showAlert('danger', 'Error: ' + data.error);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    this.showAlert('danger', 'Error al eliminar paciente');
                }
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                if (modal) {
                    modal.hide();
                }
            });
        }
    }
    
    // Validación de formularios
    setupFormValidation() {
        const pacienteForm = document.getElementById('pacienteForm');
        if (!pacienteForm) return;
        
        pacienteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Mostrar loading
            const submitBtn = pacienteForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Procesando...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(pacienteForm);
                const data = Object.fromEntries(formData);
                
                // Validaciones básicas
                if (!data.nombre || !data.apellido || !data.fecha_nacimiento || !data.sexo) {
                    this.showAlert('warning', 'Por favor, completa todos los campos requeridos');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Validar fecha (no futura)
                const fechaNacimiento = new Date(data.fecha_nacimiento);
                const hoy = new Date();
                if (fechaNacimiento > hoy) {
                    this.showAlert('warning', 'La fecha de nacimiento no puede ser futura');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                const url = pacienteForm.action;
                const method = pacienteForm.getAttribute('method') || 'POST';
                
                const token = localStorage.getItem('token') || this.getCookie('token') || '';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.showAlert('success', result.message || '¡Operación exitosa!');
                    
                    // Redirigir después de 1.5 segundos
                    setTimeout(() => {
                        window.location.href = '/pacientes';
                    }, 1500);
                } else {
                    this.showAlert('danger', result.error || 'Error desconocido');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
                
            } catch (error) {
                console.error('Error:', error);
                this.showAlert('danger', 'Error de conexión con el servidor');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Validación de fechas
    setupDateValidation() {
        const fechaInput = document.getElementById('fecha_nacimiento');
        if (!fechaInput) return;
        
        // Establecer fecha máxima como hoy
        const today = new Date().toISOString().split('T')[0];
        fechaInput.max = today;
        
        fechaInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            
            if (selectedDate > today) {
                this.setCustomValidity('La fecha no puede ser futura');
                this.reportValidity();
            } else {
                this.setCustomValidity('');
            }
            
            // Calcular edad automáticamente
            const edadSpan = document.getElementById('edadCalculada');
            if (edadSpan && this.value) {
                const edad = calcularEdad(selectedDate);
                edadSpan.textContent = edad + ' años';
            }
        });
    }
    
    // Configurar botón de retroceso
    setupBackButton() {
        const backButtons = document.querySelectorAll('.btn-back, [data-action="back"]');
        backButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (document.referrer && document.referrer.includes(window.location.hostname)) {
                    window.history.back();
                } else {
                    window.location.href = '/pacientes';
                }
            });
        });
    }
    
    // Calcular edad automáticamente
    setupAutoCalculateAge() {
        const fechaInput = document.getElementById('fecha_nacimiento');
        if (!fechaInput) return;
        
        // Crear elemento para mostrar la edad si no existe
        if (!document.getElementById('edadContainer')) {
            const container = document.createElement('div');
            container.id = 'edadContainer';
            container.className = 'mt-2';
            container.innerHTML = '<small class="text-muted">Edad: <span id="edadCalculada">-</span></small>';
            fechaInput.parentNode.appendChild(container);
        }
        
        // Calcular edad inicial si hay valor
        if (fechaInput.value) {
            const edad = this.calcularEdad(new Date(fechaInput.value));
            document.getElementById('edadCalculada').textContent = edad + ' años';
        }
        
        // Recalcular al cambiar fecha
        fechaInput.addEventListener('change', () => {
            if (fechaInput.value) {
                const edad = this.calcularEdad(new Date(fechaInput.value));
                document.getElementById('edadCalculada').textContent = edad + ' años';
            }
        });
    }
    
    // Máscara para teléfono
    setupPhoneMask() {
        const phoneInput = document.getElementById('telefono');
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Limitar a 9 dígitos
            if (value.length > 9) {
                value = value.substring(0, 9);
            }
            
            // Formatear como 612 345 678
            if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1 $2');
            }
            
            e.target.value = value;
        });
    }
    
    // Calcular edad a partir de fecha de nacimiento
    calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }
        
        return edad;
    }
    
    // Mostrar alertas
    showAlert(type, message) {
        // Eliminar alertas anteriores del mismo tipo
        document.querySelectorAll(`.alert-${type}`).forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 
                              type === 'info' ? 'info-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insertar al inicio del contenido principal
        const main = document.querySelector('main .container') || document.querySelector('main');
        if (main) {
            main.insertBefore(alertDiv, main.firstChild);
            
            // Desplazar suavemente hacia la alerta
            alertDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }
    
    // Obtener cookie
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Guardar token en localStorage
    saveToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        }
    }
    
    // Obtener token
    getToken() {
        return localStorage.getItem('token') || this.getCookie('token') || '';
    }
    
    // Limpiar formulario
    clearForm() {
        const form = document.getElementById('pacienteForm');
        if (form) {
            form.reset();
            
            // Limpiar cálculo de edad
            const edadSpan = document.getElementById('edadCalculada');
            if (edadSpan) {
                edadSpan.textContent = '-';
            }
        }
    }
    
    // Exportar pacientes a CSV
    exportToCSV() {
        const table = document.getElementById('pacientesTable');
        if (!table) return;
        
        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const rowData = [];
            const cols = row.querySelectorAll('td, th');
            
            cols.forEach(col => {
                // Obtener texto limpio (sin HTML)
                let text = col.textContent.trim();
                
                // Limpiar datos
                text = text.replace(/(\r\n|\n|\r)/gm, '');
                text = text.replace(/\s+/g, ' ');
                
                // Escapar comillas para CSV
                text = text.replace(/"/g, '""');
                
                // Agregar comillas si contiene coma
                if (text.includes(',')) {
                    text = `"${text}"`;
                }
                
                rowData.push(text);
            });
            
            csv.push(rowData.join(','));
        });
        
        // Descargar archivo
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `pacientes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const pacientesManager = new PacientesManager();
    
    // Hacer disponible globalmente para debugging
    window.pacientesManager = pacientesManager;
    
    // Botón para exportar CSV (si existe)
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            pacientesManager.exportToCSV();
        });
    }
    
    // Validar formulario al perder foco
    document.querySelectorAll('#pacienteForm input[required]').forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });
    
    // Manejar tecla Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }
    });
    
    // Prevenir envío doble del formulario
    let formSubmitting = false;
    const pacienteForm = document.getElementById('pacienteForm');
    if (pacienteForm) {
        pacienteForm.addEventListener('submit', () => {
            if (formSubmitting) {
                return false;
            }
            formSubmitting = true;
            return true;
        });
    }
}); 