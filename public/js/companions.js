document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const guestId = urlParams.get('guestId');

    if (!eventId || !guestId) {
        window.location.href = '/dashboard.html';
        return;
    }

    const elements = {
        back: document.getElementById('back-to-guests'),
        name: document.getElementById('guest-name'),
        tbody: document.getElementById('comp-tbody'),
        empty: document.getElementById('comp-empty'),
        openModal: document.getElementById('open-add-comp'),
        modal: document.getElementById('modal-comp'),
        closeModal: document.getElementById('close-modal-comp'),
        form: document.getElementById('add-comp-form'),
        cancelBtn: document.getElementById('cancel-comp'),
        compName: document.getElementById('comp-name'),
        // Confirm Modal
        modalConfirm: document.getElementById('modal-confirm'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel')
    };
    
    elements.back.href = `/guests.html?eventId=${eventId}`;

    let maxCompanions = 0;
    let currentCompanions = 0;

    // Load initial info
    try {
        const [eventRes, guestRes] = await Promise.all([
            api.getEvent(eventId),
            api.getGuest(eventId, guestId)
        ]);
        
        maxCompanions = eventRes.data.max_dependentes_por_convidado || 0;
        const guest = guestRes.data;
        if (guest) elements.name.textContent = guest.nome_completo;

        await loadCompanions();
    } catch (err) {
        console.error('Info load error:', err);
    }

    async function loadCompanions() {
        elements.tbody.innerHTML = '';
        try {
            const res = await api.getCompanions(eventId, guestId);
            const companions = (res.data && res.data.items) ? res.data.items : [];
            currentCompanions = companions.length;
            
            if (companions.length > 0) {
                elements.empty.classList.add('hidden');
                renderCompanions(companions);
            } else {
                elements.empty.classList.remove('hidden');
            }

            // Check if reached limit
            if (maxCompanions > 0 && currentCompanions >= maxCompanions) {
                elements.openModal.disabled = true;
                elements.openModal.classList.add('opacity-50', 'grayscale');
                elements.openModal.title = `Limite de ${maxCompanions} acompanhantes atingido.`;
            } else {
                elements.openModal.disabled = false;
                elements.openModal.classList.remove('opacity-50', 'grayscale');
            }
        } catch (err) {
            console.error('Error load comps:', err);
        }
    }

    function renderCompanions(companions) {
        companions.forEach((comp, index) => {
            const tr = document.createElement('tr');
            tr.className = `animate-fade-in stagger-${(index % 5) + 1}`;
            tr.innerHTML = `
                <td class="px-10 py-6">
                    <div class="flex items-center gap-4">
                        <div class="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
                            ${comp.nome_completo.charAt(0)}
                        </div>
                        <div class="font-bold text-on-surface text-sm">${comp.nome_completo}</div>
                    </div>
                </td>
                <td class="px-10 py-6 text-right">
                    <button onclick="handleDeleteComp(${comp.id})" class="text-secondary/20 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </td>
            `;
            elements.tbody.appendChild(tr);
        });
    }

    // Modal logic
    const closeModal = () => {
        elements.modal.classList.add('opacity-0');
        elements.modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => elements.modal.classList.add('hidden'), 300);
    };

    elements.openModal.addEventListener('click', () => {
        elements.modal.classList.remove('hidden');
        setTimeout(() => {
            elements.modal.classList.remove('opacity-0');
            elements.modal.firstElementChild.classList.remove('scale-95');
        }, 10);
    });

    elements.closeModal.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);

    // Confirmation Logic
    let currentDeleteId = null;
    const showConfirm = (id) => {
        currentDeleteId = id;
        elements.modalConfirm.classList.remove('hidden');
        setTimeout(() => elements.modalConfirm.classList.remove('opacity-0'), 10);
    };

    const closeConfirm = () => {
        elements.modalConfirm.classList.add('opacity-0');
        setTimeout(() => {
            elements.modalConfirm.classList.add('hidden');
            currentDeleteId = null;
        }, 300);
    };

    elements.confirmCancel.addEventListener('click', closeConfirm);
    elements.confirmOk.addEventListener('click', async () => {
        if (!currentDeleteId) return;
        
        const originalText = elements.confirmOk.textContent;
        elements.confirmOk.disabled = true;
        elements.confirmOk.textContent = 'Removendo...';

        try {
            const res = await api.deleteCompanion(eventId, guestId, currentDeleteId);
            if (res.success) {
                showToast('Acompanhante removido com sucesso!');
                closeConfirm();
                await loadCompanions();
            }
        } catch (err) {
            showToast(err.message || 'Erro ao excluir acompanhante', 'error');
        } finally {
            elements.confirmOk.disabled = false;
            elements.confirmOk.textContent = originalText;
        }
    });

    // Form logic
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = elements.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const data = {
            nome_completo: elements.compName.value,
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';

            const res = await api.postCompanion(eventId, guestId, data);
            if (res.success) {
                showToast('Acompanhante adicionado com sucesso!');
                closeModal();
                elements.form.reset();
                await loadCompanions();
            }
        } catch (err) {
            showToast(err.message || 'Erro ao salvar acompanhante', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Using global window.showToast from common.js

    window.handleDeleteComp = async (compId) => {
        showConfirm(compId);
    };
});
