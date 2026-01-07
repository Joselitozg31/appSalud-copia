document.addEventListener('DOMContentLoaded', () => {
    // Export CSV
    const exportBtn = document.getElementById('exportCsv');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const table = document.getElementById('temperaturasTable');
            if (!table) return;
            const rows = Array.from(table.querySelectorAll('tr'));
            const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(td => '"' + td.innerText.replace(/"/g, '""') + '"').join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'temperaturas.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    // Delete buttons
    document.querySelectorAll('.delete-temp').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.dataset.id;
            if (!confirm('¿Eliminar este registro de temperatura?')) return;
            try {
                const res = await fetch(`/temperaturas/api/${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (json.success) location.reload(); else alert(json.error || 'Error al eliminar');
            } catch (err) { console.error(err); alert('Error de red'); }
        });
    });

    // Form save (handles both create & update)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const pacienteEl = document.getElementById('paciente_id');
            const paciente_id = pacienteEl ? pacienteEl.value : null;
            const temperatura = document.getElementById('temperatura').value;
            const fecha_medicion = document.getElementById('fecha_medicion').value;

            if (!paciente_id) { alert('Selecciona un paciente'); return; }
            if (!temperatura) { alert('Ingresa la temperatura'); return; }

            // Si existe registro (edición) la página inyecta existingRegistro
            const registroId = (typeof existingRegistro !== 'undefined' && existingRegistro && existingRegistro.id) ? existingRegistro.id : null;
            try {
                const payload = { paciente_id, temperatura, fecha_medicion };
                const url = registroId ? `/temperaturas/api/${registroId}` : '/temperaturas/api';
                const method = registroId ? 'PUT' : 'POST';
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const json = await res.json();
                if (json.success) {
                    // Redirigir a la lista del paciente si hay paciente
                    window.location.href = `/temperaturas/paciente/${paciente_id}`;
                } else {
                    alert(json.error || 'Error en la operación');
                }
            } catch (err) { console.error(err); alert('Error de red'); }
        });
    }
});
