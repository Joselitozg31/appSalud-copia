// public/js/main.js - VERSIÓN CORREGIDA

// Funcionalidades generales de la aplicación

// Inicializar tooltips de Bootstrap
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    return tooltipList;
}

// Auto-cerrar alerts después de 5 segundos
function autoCloseAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    });
}

// Confirmación para acciones peligrosas
function confirmActions() {
    const deleteButtons = document.querySelectorAll('.btn-delete, .btn-danger[data-confirm]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm') || '¿Estás seguro de realizar esta acción?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

// Formatear fechas
function formatDates() {
    const dateElements = document.querySelectorAll('[data-date]');
    dateElements.forEach(element => {
        const dateString = element.getAttribute('data-date');
        if (dateString) {
            const date = new Date(dateString);
            element.textContent = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    });
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Auto-cerrar alerts después de 5 segundos
    autoCloseAlerts();
    
    // Inicializar tooltips
    initTooltips();
    
    // Configurar confirmaciones
    confirmActions();
    
    // Formatear fechas
    formatDates();
    
    // Manejar modales automáticamente
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            const input = this.querySelector('input[autofocus]');
            if (input) {
                input.focus();
            }
        });
    });
    
    // Manejar formularios con validación Bootstrap
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
    
    // Configurar todos los botones de cerrar alerts
    document.querySelectorAll('.alert .btn-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const alert = this.closest('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        });
    });
});