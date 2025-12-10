// public/js/main.js

// Funcionalidades generales de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Auto-cerrar alerts después de 5 segundos
    const autoCloseAlerts = () => {
        const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
        alerts.forEach(alert => {
            setTimeout(() => {
                if (alert.parentNode) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        });
    };
    
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
})
    // Confirmación para acciones peligrosas
    const confirmActions = () => {
        const deleteButtons = document.querySelectorAll('.btn-delete, .btn-danger[data-confirm]');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const message = this.getAttribute('data-confirm') || '¿Estás seguro de realizar esta acción?';
                if (!confirm(message)) {
                    e.preventDefault();
                }
            });
        });
    };
    
    // Formatear fechas
    const formatDates = () => {
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
    };
    
    // Inicializar todo
    autoCloseAlerts();
    initTooltips();
    confirmActions();
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