// public/js/auth.js

// ========== FUNCIONES PARA LOGIN ==========
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
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Redirigir al inicio después de login exitoso
            window.location.href = '/';
        } else {
            showError(data.error || 'Error en el login');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión con el servidor');
    }
}

// ========== FUNCIONES PARA REGISTRO ==========
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
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
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

// ========== FUNCIONES DE UTILIDAD ==========
function showError(message) {
    // Crear alerta de error
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar al inicio del formulario
    const form = document.querySelector('form');
    form.parentNode.insertBefore(alertDiv, form);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Crear alerta de éxito
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar al inicio del formulario
    const form = document.querySelector('form');
    form.parentNode.insertBefore(alertDiv, form);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Configurar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Configurar formulario de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', handleRegister);
    }
    
    // Validación en tiempo real para contraseñas
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.classList.add('is-invalid');
                confirmPasswordInput.classList.remove('is-valid');
            } else {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
            }
        });
    }
});