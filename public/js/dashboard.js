// public/js/dashboard.js - VERSIÓN SIN DEPENDER DE API

class DashboardManager {
    constructor() {
        this.statsInterval = null;
        this.init();
    }
    
    init() {
        this.loadStatistics();
        this.setupEventListeners();
        this.setupAutoRefresh();
        this.setupTooltips();
    }
    
    // Cargar estadísticas (sin API)
    async loadStatistics() {
        const estadisticas = await this.getLocalStatistics();
        
        // Actualizar elementos del DOM
        document.getElementById('totalPacientes')?.textContent = estadisticas.pacientes || 0;
        document.getElementById('totalBasculas')?.textContent = estadisticas.basculas || 0;
        document.getElementById('totalTemperaturas')?.textContent = estadisticas.temperaturas || 0;
        document.getElementById('totalUsuarios')?.textContent = estadisticas.usuarios || 1;
        
        this.updateButtonsState(estadisticas.pacientes || 0);
    }
    
    // Obtener estadísticas locales (sin API)
    async getLocalStatistics() {
        const estadisticas = {
            pacientes: 0,
            basculas: 0,
            temperaturas: 0,
            usuarios: 1
        };
        
        // Intentar contar pacientes desde la tabla si existe en la página
        const pacientesTable = document.getElementById('pacientesTable');
        if (pacientesTable) {
            const rows = pacientesTable.querySelectorAll('tbody tr');
            estadisticas.pacientes = rows.length;
        }
        
        // Si no hay tabla, intentar obtener de localStorage o usar 0
        if (estadisticas.pacientes === 0) {
            const storedPacientes = localStorage.getItem('appSalud_pacientesCount');
            estadisticas.pacientes = storedPacientes ? parseInt(storedPacientes) : 0;
        }
        
        // Guardar para futuras visitas
        localStorage.setItem('appSalud_pacientesCount', estadisticas.pacientes.toString());
        
        return estadisticas;
    }
    
    // Actualizar estado de los botones
    updateButtonsState(pacientesCount) {
        const basculasBtn = document.querySelector('[href="/basculas"]');
        const temperaturasBtn = document.querySelector('[href="/temperaturas"]');
        
        if (basculasBtn) {
            if (pacientesCount > 0) {
                basculasBtn.classList.remove('disabled');
                basculasBtn.removeAttribute('disabled');
                basculasBtn.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Ir a Básculas';
            } else {
                basculasBtn.classList.add('disabled');
                basculasBtn.setAttribute('disabled', 'true');
                basculasBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Primero añade pacientes';
                
                // Añadir tooltip explicativo
                basculasBtn.setAttribute('data-bs-toggle', 'tooltip');
                basculasBtn.setAttribute('title', 'Necesitas tener al menos un paciente registrado');
            }
        }
        
        if (temperaturasBtn) {
            if (pacientesCount > 0) {
                temperaturasBtn.classList.remove('disabled');
                temperaturasBtn.removeAttribute('disabled');
                temperaturasBtn.innerHTML = '<i class="fas fa-arrow-right me-2"></i>Ir a Temperaturas';
            } else {
                temperaturasBtn.classList.add('disabled');
                temperaturasBtn.setAttribute('disabled', 'true');
                temperaturasBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Primero añade pacientes';
                
                // Añadir tooltip explicativo
                temperaturasBtn.setAttribute('data-bs-toggle', 'tooltip');
                temperaturasBtn.setAttribute('title', 'Necesitas tener al menos un paciente registrado');
            }
        }
        
        // Actualizar tooltips después de cambiar botones
        this.setupTooltips();
    }
    
    // Establecer valores por defecto
    setDefaultValues() {
        const defaultValues = {
            'totalPacientes': 0,
            'totalBasculas': 0,
            'totalTemperaturas': 0,
            'totalUsuarios': 1
        };
        
        Object.entries(defaultValues).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    // Configurar auto-refresh
    setupAutoRefresh() {
        // Actualizar cada 30 segundos
        this.statsInterval = setInterval(() => {
            this.loadStatistics();
        }, 30000);
    }
    
    // Configurar tooltips
    setupTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(tooltipTriggerEl => {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        return tooltipList;
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Botón de recargar manual
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadStatistics();
                this.showToast('Estadísticas actualizadas', 'info');
            });
        }
        
        // Cuando se añade un nuevo paciente (simulación)
        document.addEventListener('pacienteAdded', (e) => {
            if (e.detail && e.detail.count !== undefined) {
                this.updatePatientCount(e.detail.count);
            }
        });
    }
    
    // Actualizar contador de pacientes (se puede llamar desde otras páginas)
    updatePatientCount(newCount) {
        const pacientesElement = document.getElementById('totalPacientes');
        if (pacientesElement) {
            pacientesElement.textContent = newCount;
            localStorage.setItem('appSalud_pacientesCount', newCount.toString());
            this.updateButtonsState(newCount);
        }
    }
    
    // Mostrar toast de notificación
    showToast(message, type = 'info') {
        // Solo mostrar toast si estamos en desarrollo o no hay muchos
        if (document.querySelectorAll('.toast').length > 3) return;
        
        // Crear toast container si no existe
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
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
                    type === 'warning' ? 'exclamation-triangle' : 
                    type === 'danger' ? 'exclamation-circle' : 'info-circle';
        
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
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        // Remover toast después de desaparecer
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    // Obtener cookie
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Limpiar intervalos al salir
    destroy() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página principal y hay elementos del dashboard
    if (document.querySelector('.dashboard-card') || document.getElementById('totalPacientes')) {
        window.dashboardManager = new DashboardManager();
        
        // Inicializar con valores actuales
        setTimeout(() => {
            window.dashboardManager.loadStatistics();
        }, 500);
    }
    
    // Si estamos en la página de pacientes, guardar el contador
    if (window.location.pathname.includes('/pacientes')) {
        savePatientCountFromPage();
    }
});

// Guardar contador de pacientes desde la página de pacientes
function savePatientCountFromPage() {
    setTimeout(() => {
        const pacientesTable = document.getElementById('pacientesTable');
        if (pacientesTable) {
            const rows = pacientesTable.querySelectorAll('tbody tr');
            const count = rows.length;
            localStorage.setItem('appSalud_pacientesCount', count.toString());
            
            // Disparar evento para que el dashboard se actualice
            const event = new CustomEvent('pacienteAdded', { detail: { count } });
            document.dispatchEvent(event);
        }
    }, 1000);
}

// Función auxiliar para actualizar contador manualmente
function updateDashboardPatientCount(count) {
    if (window.dashboardManager) {
        window.dashboardManager.updatePatientCount(count);
    } else {
        localStorage.setItem('appSalud_pacientesCount', count.toString());
    }
}