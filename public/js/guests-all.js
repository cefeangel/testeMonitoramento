document.addEventListener('DOMContentLoaded', async () => {
    let allGuests = [];
    
    // UI Elements
    const elements = {
        tbody: document.getElementById('guests-all-tbody'),
        searchInput: document.getElementById('search-all-guests'),
        statTotal: document.getElementById('stat-total'),
        statEvents: document.getElementById('stat-events'),
        // Confirm Modal
        modalConfirm: document.getElementById('modal-confirm'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel')
    };

    async function loadData() {
        try {
            const [guestRes, eventRes] = await Promise.all([
                api.getGlobalGuests(1, 100),
                api.getEvents()
            ]);

            if (guestRes.success) {
                allGuests = guestRes.data.items || [];
                renderGuests(allGuests);
                elements.statTotal.textContent = guestRes.data.totalItems || allGuests.length;
            }

            if (eventRes.success) {
                elements.statEvents.textContent = eventRes.data.items?.length || 0;
            }
        } catch (error) {
            console.error('Error loading guests:', error);
            if (typeof showToast === 'function') {
                showToast('Erro ao carregar dados', 'error');
            }
        }
    }

    function renderGuests(guests) {
        elements.tbody.innerHTML = '';
        
        if (guests.length === 0) {
            elements.tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-10 py-20 text-center text-secondary/40 italic font-manrope">
                        Nenhum convidado encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        guests.forEach((guest, index) => {
            const tr = document.createElement('tr');
            tr.className = `hover:bg-surface/50 border-b border-outline-variant/5 transition-colors animate-fade-in stagger-${(index % 5) + 1}`;
            
            const eventName = guest.event?.nome || 'N/A';
            const companionCount = guest.companions ? guest.companions.length : 0;
            
            tr.innerHTML = `
                <td class="px-10 py-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-xs uppercase">
                            ${guest.nome_completo.charAt(0)}
                        </div>
                        <div>
                            <div class="text-sm font-bold text-on-surface font-manrope">${guest.nome_completo}</div>
                            <div class="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">ID: #${guest.id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-6">
                    <span class="text-xs font-bold text-secondary uppercase tracking-tighter">${eventName}</span>
                </td>
                <td class="px-6 py-6">
                    <div class="text-xs font-medium text-on-surface">${guest.telefone}</div>
                </td>
                <td class="px-6 py-6 text-center">
                    <span class="px-3 py-1 bg-surface-container-highest text-secondary text-[10px] font-bold rounded-full">
                        ${companionCount}
                    </span>
                </td>
                <td class="px-10 py-6 text-right">
                    <div class="flex justify-end gap-3">
                         <a href="/companions.html?eventId=${guest.event_id}&guestId=${guest.id}" class="text-secondary/30 hover:text-primary transition-colors" title="Acompanhantes">
                            <span class="material-symbols-outlined text-xl">diversity_3</span>
                        </a>
                        <button onclick="handleDeleteGuest(${guest.event_id}, ${guest.id})" class="text-secondary/30 hover:text-primary transition-colors" title="Excluir">
                            <span class="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>
                </td>
            `;
            elements.tbody.appendChild(tr);
        });
    }

    // Search logic
    elements.searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allGuests.filter(g => 
            g.nome_completo.toLowerCase().includes(term) || 
            (g.event?.nome || '').toLowerCase().includes(term)
        );
        renderGuests(filtered);
    });

    // Delete Confirmation Logic
    let deleteContext = null;
    window.handleDeleteGuest = (eventId, guestId) => {
        deleteContext = { eventId, guestId };
        elements.modalConfirm.classList.remove('hidden');
        setTimeout(() => elements.modalConfirm.classList.remove('opacity-0'), 10);
    };

    const closeConfirm = () => {
        elements.modalConfirm.classList.add('opacity-0');
        setTimeout(() => {
            elements.modalConfirm.classList.add('hidden');
            deleteContext = null;
        }, 300);
    };

    if (elements.confirmCancel) elements.confirmCancel.addEventListener('click', closeConfirm);
    if (elements.confirmOk) elements.confirmOk.addEventListener('click', async () => {
        if (!deleteContext) return;
        
        const originalText = elements.confirmOk.textContent;
        elements.confirmOk.disabled = true;
        elements.confirmOk.textContent = 'Removendo...';

        try {
            const res = await api.deleteGuest(deleteContext.eventId, deleteContext.guestId);
            if (res.success) {
                if (typeof showToast === 'function') showToast('Convidado removido com sucesso!');
                closeConfirm();
                await loadData();
            }
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message || 'Erro ao excluir', 'error');
        } finally {
            elements.confirmOk.disabled = false;
            elements.confirmOk.textContent = originalText;
        }
    });

    // Initial load
    await loadData();
});
