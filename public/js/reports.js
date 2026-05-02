document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
        globalEvents: document.getElementById('global-events'),
        globalGuests: document.getElementById('global-guests'),
        globalConfirmations: document.getElementById('global-confirmations'),
        globalPresences: document.getElementById('global-presences'),
        tbody: document.getElementById('report-tbody')
    };

    async function loadReport() {
        try {
            const res = await api.getReport();
            if (res.success) {
                renderGlobalStats(res.data.global);
                renderEventAnalysis(res.data.events);
            } else {
                showToast('Erro ao processar relatório', 'error');
            }
        } catch (error) {
            console.error('Error loading report:', error);
            if (typeof showToast === 'function') {
                showToast('Erro ao carregar dados analíticos', 'error');
            }
        }
    }

    function renderGlobalStats(global) {
        elements.globalEvents.textContent = global.totalEventos;
        elements.globalGuests.textContent = global.totalConvidadosBase;
        elements.globalConfirmations.textContent = global.totalConfirmacoes;
        elements.globalPresences.textContent = global.totalPresencasEstimadas;
    }

    function renderEventAnalysis(events) {
        elements.tbody.innerHTML = '';
        
        if (!events || events.length === 0) {
            elements.tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-10 py-20 text-center text-secondary/30 italic font-manrope">
                        Não há eventos cadastrados para análise.
                    </td>
                </tr>
            `;
            return;
        }

        events.forEach((event, index) => {
            const tr = document.createElement('tr');
            tr.className = `hover:bg-surface/30 transition-colors animate-fade-in stagger-${(index % 5) + 1}`;
            
            const stats = event.stats;
            // Gradiente de cor baseado na ocupação
            const barColor = stats.percentualOcupacao > 90 ? 'bg-red-600' : stats.percentualOcupacao > 70 ? 'bg-orange-500' : 'bg-primary';
            
            tr.innerHTML = `
                <td class="px-10 py-6">
                    <div class="text-sm font-bold text-on-surface font-manrope leading-tight">${event.nome}</div>
                    <div class="text-[10px] text-secondary/40 font-bold uppercase tracking-widest mt-1">
                        ${new Date(event.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                </td>
                <td class="px-6 py-6 font-manrope text-xs font-bold text-secondary">
                    ${event.capacidade} <span class="text-[8px] opacity-30 uppercase tracking-tighter">Vagas</span>
                </td>
                <td class="px-6 py-6">
                    <div class="flex items-center gap-2">
                        <span class="text-base font-extrabold text-on-surface font-manrope">${stats.ocupacaoAtual}</span>
                        <div class="flex flex-col">
                            <span class="text-[8px] font-bold text-secondary uppercase tracking-widest leading-none">Ocupado</span>
                            <span class="text-[8px] font-bold text-green-600 uppercase tracking-widest leading-none mt-0.5">${stats.confirmados} Confirmados</span>
                        </div>
                    </div>
                </td>
                <td class="px-10 py-6 min-w-[250px]">
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center text-[10px] font-bold font-manrope">
                            <span class="text-secondary uppercase tracking-widest">${stats.percentualOcupacao}% Ocupado</span>
                            <span class="${stats.ocupacaoAtual >= event.capacidade ? 'text-red-600' : 'text-primary'} uppercase">
                                ${Math.max(0, event.capacidade - stats.ocupacaoAtual)} Livres
                            </span>
                        </div>
                        <div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div class="${barColor} h-full transition-all duration-1000 ease-out" 
                                 style="width: ${Math.min(100, stats.percentualOcupacao)}%"></div>
                        </div>
                    </div>
                </td>
            `;
            elements.tbody.appendChild(tr);
        });
    }

    loadReport();
});
