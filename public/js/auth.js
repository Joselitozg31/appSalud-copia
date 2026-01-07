// public/js/auth.js - Versión corregida

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Por favor, completa todos los campos');
        return;
    }
    
    const formData = { username, password };
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // ← IMPORTANTE: incluye cookies
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Guardar token en localStorage (opcional para API)
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // Mostrar mensaje de éxito
            showSuccess('¡Login exitoso! Redirigiendo...');
            
            // Esperar un momento y redirigir
            setTimeout(() => {
                // Recargar la página para que la sesión se active
                window.location.href = '/';
            }, 1000);
        } else {
            showError(data.error || 'Error en el login');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión con el servidor');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const rol = document.getElementById('rol').value;
    
    // Validaciones
    if (!username || !email || !password || !confirmPassword) {
        showError('Por favor, completa todos los campos requeridos');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (username.length < 3) {
        showError('El usuario debe tener al menos 3 caracteres');
        return;
    }
    
    const formData = { username, email, password, rol };
    
    try {
        const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // ← IMPORTANTE
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showSuccess('¡Registro exitoso! Redirigiendo al login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showError(data.error || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión con el servidor');
    }
}

// Funciones de utilidad
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('form');
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
    }
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }
    }, 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('form');
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
    }
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }
    }, 5000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', handleRegister);
    }
    
    // Verificar si ya está logueado
    checkAuthStatus();
});

// Verificar estado de autenticación
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/verificar', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.autenticado && window.location.pathname === '/login') {
            // Si ya está logueado y está en login, redirigir
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
    }
}