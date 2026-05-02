document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const token = urlParams.get('token');

    if (!eventId || !token) {
        window.location.href = '/';
        return;
    }

    const elements = {
        name: document.getElementById('event-name'),
        heroBg: document.getElementById('event-hero-bg'),
        scheduleList: document.getElementById('schedule-list'),
        btnBack: document.getElementById('btn-back')
    };

    elements.btnBack.href = `event-guest.html?eventId=${eventId}&token=${token}`;

    try {
        const res = await api.getPublicEvent(eventId, token);
        if (res.success) {
            renderSchedule(res.data);
        }
    } catch (err) {
        console.error('Error loading schedule:', err);
        showToast('Erro ao carregar o cronograma. Verifique seu token de acesso.', 'error');
    }

    function renderSchedule(event) {
        elements.name.textContent = event.nome;

        // Hero Background (Priorizar foto_capa, fallback para primeiro item com foto)
        const coverUrl = event.foto_capa || event.schedules?.find(s => s.foto_url)?.foto_url;

        if (coverUrl) {
            elements.heroBg.style.backgroundImage = `url('${coverUrl}')`;
            elements.heroBg.style.backgroundSize = 'cover';
            elements.heroBg.style.backgroundPosition = 'center';
            elements.heroBg.classList.remove('bg-secondary/80');
        }

        if (event.schedules && event.schedules.length > 0) {
            elements.scheduleList.innerHTML = '';

            event.schedules.forEach((item, index) => {
                const time = new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                
                const itemEl = document.createElement('div');
                itemEl.className = "flex gap-8 group animate-fade-in stagger-item relative";
                itemEl.style.animationDelay = `${index * 150}ms`;
                
                // Vertical line logic
                const isLast = index === event.schedules.length - 1;
                
                itemEl.innerHTML = `
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 z-10">
                            <span class="text-xs font-black tracking-tighter">${time}</span>
                        </div>
                        ${!isLast ? '<div class="absolute top-12 bottom-[-48px] w-0.5 bg-gradient-to-b from-primary/10 to-transparent"></div>' : ''}
                    </div>
                    
                    <div class="flex-1 pb-16">
                        <div class="space-y-4">
                            <div class="flex items-center gap-2">
                                <h3 class="text-xl font-bold tracking-tight">${item.titulo}</h3>
                                <div class="h-px flex-1 bg-surface-container-highest"></div>
                            </div>
                            
                            <p class="text-sm text-secondary/60 leading-relaxed font-inter">${item.descricao || 'Nenhuma descrição adicional fornecida.'}</p>
                        </div>
                    </div>
                `;
                elements.scheduleList.appendChild(itemEl);
            });
        } else {
            elements.scheduleList.innerHTML = '<div class="text-center py-20 italic opacity-40">Nenhum item carregado no cronograma para este evento.</div>';
        }
    }

});
