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
                    const token = localStorage.getItem('token') || this.getCookie('token');
                    
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
                modal.hide();
            });
        }
    }
    
    // Validación de formularios
    setupFormValidation() {
        const pacienteForm = document.getElementById('pacienteForm');
        if (pacienteForm) {
            pacienteForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(pacienteForm);
                const data = Object.fromEntries(formData);
                
                // Validaciones básicas
                if (!data.nombre || !data.apellido || !data.fecha_nacimiento || !data.sexo) {
                    this.showAlert('warning', 'Por favor, completa todos los campos requeridos');
                    return;
                }
                
                const url = pacienteForm.getAttribute('action');
                const method = pacienteForm.getAttribute('method') || 'POST';
                
                try {
                    const token = localStorage.getItem('token') || this.getCookie('token');
                    
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
                        this.showAlert('success', result.message || 'Operación exitosa');
                        setTimeout(() => {
                            window.location.href = '/pacientes';
                        }, 1500);
                    } else {
                        this.showAlert('danger', 'Error: ' + (result.error || 'Error desconocido'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    this.showAlert('danger', 'Error de conexión con el servidor');
                }
            });
        }
    }
    
    // Mostrar alertas
    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insertar al inicio del contenido principal
        const main = document.querySelector('main .container') || document.querySelector('main');
        if (main) {
            main.insertBefore(alertDiv, main.firstChild);
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PacientesManager();
});