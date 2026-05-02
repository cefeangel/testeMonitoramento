document.addEventListener('DOMContentLoaded', async () => {
    const eventGrid = document.getElementById('event-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const logoutBtn = document.getElementById('logout-btn');

    // Logout logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            // No backend logout needed for standard session-based HttpOnly Cookies, 
            // but we can send a request if there's a logout endpoint
            try {
                // Simplesmente limpamos o cookie no lado do cliente ou redirecionamos
                // O servidor deve prover um endpoint /logout para limpar o cookie HttpOnly
                document.cookie = 'token=; Max-Age=0; path=/;';
                window.location.href = '/login.html';
            } catch (err) {
                console.error('Erro ao sair:', err);
            }
        });
    }

    try {
        const result = await api.getEvents();

        // O backend retorna os eventos dentro de data.items (paginação)
        const events = result.data.items || [];

        if (result.success && events.length > 0) {
            loadingState.classList.add('hidden');
            renderEvents(events);
        } else {
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        loadingState.classList.add('hidden');
        // Mostrar erro amigável (opcional)
    }

    function renderEvents(events) {
        eventGrid.innerHTML = '';
        
        events.forEach((event, index) => {
            const date = new Date(event.data_hora);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = `group cursor-pointer bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0px_10px_40px_rgba(25,28,30,0.04)] animate-fade-in transition-all hover-glass stagger-${(index % 3) + 1}`;
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-10">
                    <div class="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">event_available</span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-bold text-secondary uppercase tracking-widest leading-none mb-1">${formattedDate}</div>
                        <div class="text-[10px] font-medium text-secondary/60 uppercase tracking-tight">${formattedTime}</div>
                    </div>
                </div>

                <div class="mb-10">
                    <h3 class="text-lg font-bold font-manrope text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">${event.nome}</h3>
                    <p class="text-xs text-secondary/70 line-clamp-2 leading-relaxed">${event.descricao || 'Sem descrição.'}</p>
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-secondary/60 uppercase tracking-widest mb-1">Capacidade</span>
                        <span class="text-sm font-bold text-on-surface">${event.capacidade_total} Convidados</span>
                    </div>
                    <div class="flex -space-x-2">
                        <div class="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-secondary">+${event.max_dependentes_por_convidado || 0}</div>
                    </div>
                </div>

                <div class="mt-8">
                    <a href="/event-details.html?id=${event.id}" class="inline-flex w-full items-center justify-center py-3 bg-secondary/5 text-secondary text-xs font-bold rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                        Visualizar Evento
                        <span class="material-symbols-outlined text-sm ml-2">trending_flat</span>
                    </a>
                </div>
            `;

            eventGrid.appendChild(card);
        });
    }
});
