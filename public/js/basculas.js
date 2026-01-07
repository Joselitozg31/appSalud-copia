// Funcionalidades específicas para la página de básculas

document.addEventListener('DOMContentLoaded', function() {
    // ========== ELIMINACIÓN DE REGISTROS ==========
    let registroIdAEliminar = null;
    
    // Configurar botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            registroIdAEliminar = this.getAttribute('data-id');
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
            deleteModal.show();
        });
    });
    
    // Confirmar eliminación
    document.getElementById('confirmDelete').addEventListener('click', function() {
        if (!registroIdAEliminar) return;
        
        fetch(`/basculas/api/${registroIdAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cerrar modal
                const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                deleteModal.hide();
                
                // Mostrar mensaje de éxito
                showToast('success', data.message || 'Registro eliminado exitosamente');
                
                // Recargar la página después de 1 segundo
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast('error', data.error || 'Error al eliminar el registro');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('error', 'Error al eliminar el registro');
        });
    });
    
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
    
    // ========== FILTRADO DE TABLA ==========
    const table = document.getElementById('basculasTable');
    if (table) {
        // Crear campo de búsqueda
        const searchContainer = document.createElement('div');
        searchContainer.className = 'mb-3';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control';
        searchInput.id = 'filtroBasculas';
        searchInput.placeholder = 'Buscar en registros...';
        
        const tableCardBody = table.closest('.card-body');
        tableCardBody.insertBefore(searchInput, table.parentNode);
        
        // Función de filtrado
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            
            let visibleCount = 0;
            Array.from(rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                const isVisible = text.includes(searchTerm);
                row.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });
            
            // Actualizar contador
            const countElement = document.getElementById('count');
            if (countElement) {
                countElement.textContent = visibleCount;
            }
            
            // Mostrar mensaje si no hay resultados
            const noResults = document.getElementById('noResultsMessage');
            if (visibleCount === 0 && searchTerm !== '') {
                if (!noResults) {
                    const messageRow = document.createElement('tr');
                    messageRow.id = 'noResultsMessage';
                    messageRow.innerHTML = `
                        <td colspan="6" class="text-center py-4">
                            <i class="fas fa-search fa-2x text-muted mb-2"></i>
                            <p class="text-muted">No se encontraron registros que coincidan con "${searchTerm}"</p>
                        </td>
                    `;
                    table.getElementsByTagName('tbody')[0].appendChild(messageRow);
                }
            } else if (noResults) {
                noResults.remove();
            }
        });
    }
    
    // ========== EXPORTACIÓN A EXCEL ==========
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportToExcel();
        });
    }
    
    function exportToExcel() {
        const table = document.getElementById('basculasTable');
        if (!table) {
            showToast('error', 'No hay tabla para exportar');
            return;
        }
        
        // Crear un libro de Excel simple con datos de la tabla
        let csv = 'Paciente,Fecha Nacimiento,Fecha,Peso (kg),Altura (cm),IMC,Clasificación\n';
        
        // Obtener filas de la tabla
        const rows = table.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            showToast('warning', 'No hay registros para exportar');
            return;
        }
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                // Extraer datos de las celdas
                const paciente = cells[0].textContent.trim();
                const fechaNacimiento = cells[1].textContent.trim();
                const fecha = cells[2].textContent.trim();
                const peso = cells[3].textContent.trim();
                const altura = cells[4].textContent.trim();
                const imc = cells[5].textContent.trim();
                const clasificacion = cells[6].textContent.trim();
                
                csv += `"${paciente}","${fechaNacimiento}","${fecha}","${peso}","${altura}","${imc}","${clasificacion}"\n`;
            }
        });
        
        // Crear blob y descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `registros_peso_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('success', 'Datos exportados exitosamente');
    }
    
    // ========== ORDENACIÓN DE TABLA ==========
    // Agregar ordenación a los encabezados de la tabla
    if (table) {
        const headers = table.getElementsByTagName('th');
        Array.from(headers).forEach((header, index) => {
            if (index < headers.length - 1) { // Excluir columna de acciones
                header.style.cursor = 'pointer';
                header.addEventListener('click', function() {
                    sortTable(index);
                });
                
                // Agregar indicador visual
                const sortIcon = document.createElement('i');
                sortIcon.className = 'fas fa-sort ms-1 text-muted';
                header.appendChild(sortIcon);
            }
        });
    }
    
    let sortDirection = 1; // 1 = ascendente, -1 = descendente
    let lastSortedColumn = -1;
    
    function sortTable(columnIndex) {
        const tableBody = table.getElementsByTagName('tbody')[0];
        const rows = Array.from(tableBody.getElementsByTagName('tr'));
        
        // Si hacemos clic en la misma columna, invertir dirección
        if (lastSortedColumn === columnIndex) {
            sortDirection *= -1;
        } else {
            sortDirection = 1;
        }
        lastSortedColumn = columnIndex;
        
        // Ordenar filas
        rows.sort((a, b) => {
            const cellA = a.getElementsByTagName('td')[columnIndex];
            const cellB = b.getElementsByTagName('td')[columnIndex];
            
            let valueA, valueB;
            
            // Manejar diferentes tipos de datos
            if (columnIndex === 0) { // Fecha
                const dateTextA = cellA.textContent.trim().split('\n')[0];
                const dateTextB = cellB.textContent.trim().split('\n')[0];
                valueA = new Date(dateTextA.split('/').reverse().join('-'));
                valueB = new Date(dateTextB.split('/').reverse().join('-'));
            } else if (columnIndex === 1 || columnIndex === 2) { // Peso o Altura
                valueA = parseFloat(cellA.textContent) || 0;
                valueB = parseFloat(cellB.textContent) || 0;
            } else if (columnIndex === 3) { // IMC (badge)
                const badgeA = cellA.querySelector('.badge');
                const badgeB = cellB.querySelector('.badge');
                valueA = badgeA ? parseFloat(badgeA.textContent) : 0;
                valueB = badgeB ? parseFloat(badgeB.textContent) : 0;
            } else { // Texto normal
                valueA = cellA.textContent.trim().toLowerCase();
                valueB = cellB.textContent.trim().toLowerCase();
            }
            
            if (valueA < valueB) return -1 * sortDirection;
            if (valueA > valueB) return 1 * sortDirection;
            return 0;
        });
        
        // Reordenar la tabla
        rows.forEach(row => tableBody.appendChild(row));
        
        // Actualizar indicadores visuales
        updateSortIndicators(columnIndex);
        
        showToast('info', `Tabla ordenada por ${table.getElementsByTagName('th')[columnIndex].textContent.trim()}`);
    }
    
    function updateSortIndicators(columnIndex) {
        const headers = table.getElementsByTagName('th');
        
        Array.from(headers).forEach((header, index) => {
            const icon = header.querySelector('i');
            if (icon) {
                if (index === columnIndex) {
                    icon.className = sortDirection === 1 ? 
                        'fas fa-sort-up ms-1' : 'fas fa-sort-down ms-1';
                } else {
                    icon.className = 'fas fa-sort ms-1 text-muted';
                }
            }
        });
    }
    
    // ========== MANEJO DE MENSAJES DEL SERVIDOR ==========
    // Si hay mensajes de sesión, mostrarlos automáticamente
    // Nota: Estos mensajes deben ser pasados desde el servidor
    // en las variables 'mensaje' y 'error'
    window.addEventListener('load', function() {
        // Este código se ejecuta cuando la página termina de cargar
        // Los mensajes se manejan desde el servidor via EJS
    });
});