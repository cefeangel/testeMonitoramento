document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-event-form');
    const errorMsg = document.getElementById('error-message');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const eventData = {
            nome: document.getElementById('event-name').value,
            descricao: document.getElementById('event-desc').value,
            data_hora: new Date(document.getElementById('event-date').value).toISOString(),
            capacidade_total: parseInt(document.getElementById('event-capacity').value),
            max_dependentes_por_convidado: parseInt(document.getElementById('event-max-deps').value) || 0
        };

        // Feedback
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publicando...';
        errorMsg.classList.add('hidden');

        try {
            const result = await api.post('/events', eventData);

            if (result.success) {
                // Sucesso! Redireciona para o detalhe do novo evento
                window.location.href = `/event-details.html?id=${result.data.id}`;
            } else {
                throw new Error(result.message || 'Erro ao criar evento');
            }
        } catch (err) {
            console.error('Error creating event:', err);
            errorMsg.textContent = err.message || 'Erro inesperado ao salvar o evento.';
            errorMsg.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Evento';
        }
    });

    // Inputs cleanup error
    form.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => errorMsg.classList.add('hidden'));
    });
});
