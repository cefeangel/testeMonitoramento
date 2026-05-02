document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
        window.location.href = '/dashboard.html';
        return;
    }

    const elements = {
        backBtn: document.getElementById('back-to-event'),
        eventTitle: document.getElementById('event-title'),
        tbody: document.getElementById('guests-tbody'),
        search: document.getElementById('search-guest'),
        openModal: document.getElementById('open-add-guest'),
        modal: document.getElementById('modal-guest'),
        closeModal: document.getElementById('close-modal'),
        form: document.getElementById('add-guest-form'),
        cancelBtn: document.getElementById('cancel-form'),
        guestName: document.getElementById('guest-name'),
        guestPhone: document.getElementById('guest-phone'),
        statTotal: document.getElementById('stat-total'),
        statConfirmed: document.getElementById('stat-confirmed'),
        statPeople: document.getElementById('stat-people'),
        pagination: document.getElementById('pagination-container'),
        // Modal Titles/Buttons
        modalTitle: document.getElementById('modal-guest-title'),
        submitBtn: document.getElementById('submit-guest-btn'),
        // Confirm Modal
        modalConfirm: document.getElementById('modal-confirm'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel'),
        btnExportPdf: document.getElementById('btn-export-pdf')
    };

    // Update navigation
    if (elements.backBtn) elements.backBtn.href = `/event-details.html?id=${eventId}`;

    let allGuests = [];
    let allConfirmations = [];
    let currentGuestPage = 1;

    // Phone masking for +55 (DD) 99999-9999 or +55 (DD) 9999-9999
    elements.guestPhone.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('55')) val = val.substring(2);

        let formatted = '';
        if (val.length > 0) {
            formatted = '+55 ';
            const ddd = val.substring(0, 2);
            formatted += `(${ddd}`;
            if (val.length > 2) {
                formatted += ') ';
                const remaining = val.substring(2);
                if (remaining.length > 5) {
                    // Cellular: 99999-9999
                    formatted += `${remaining.substring(0, 5)}-${remaining.substring(5, 9)}`;
                } else if (remaining.length > 1) {
                    // In-progress or landline candidate: 9999-9999
                    // Actually, keep it as xxxx-xxxx if it fits
                    const p1 = remaining.substring(0, 4);
                    const p2 = remaining.substring(4, 8);
                    formatted += p1 + (p2 ? `-${p2}` : '');
                } else {
                    formatted += remaining;
                }
            }
        }
        e.target.value = formatted;
    });

    // Initial load
    await loadData(1);

    async function loadData(page = 1, search = '') {
        currentGuestPage = page;
        try {
            console.log("Loading guests for event:", eventId, "page:", page, "search:", search);
            
            // Critical data: Event and Paginated Guests
            const [guestsRes, eventRes] = await Promise.allSettled([
                api.getGuests(eventId, page, 10, search),
                api.getEvent(eventId)
            ]);

            // Handle Event Title
            if (eventRes.status === 'fulfilled' && eventRes.value.success) {
                elements.eventTitle.textContent = eventRes.value.data.nome;
            }

            // Handle Guests List
            if (guestsRes.status === 'fulfilled' && guestsRes.value.success) {
                allGuests = guestsRes.value.data.items || [];
                renderGuests(allGuests);
                updateStats();
            } else if (guestsRes.status === 'rejected' || !guestsRes.value.success) {
                throw new Error("Falha ao carregar lista de convidados");
            }

            // Fetch confirmations separately as secondary data
            try {
                const confirmRes = await api.getConfirmations(eventId);
                if (confirmRes.success) {
                    allConfirmations = confirmRes.data.items || [];
                    renderGuests(allGuests); // Re-render with statuses
                    renderPagination(guestsRes.value.data, search); // Pass search to maintain context
                    updateStats(guestsRes.value.data.totalItems, guestsRes.value.data.totalPeople);
                }
            } catch (confirmErr) {
                console.warn('Could not load confirmation states:', confirmErr);
            }
            
        } catch (err) {
            console.error('Critical initialization error:', err);
            if (typeof showToast === 'function') {
                showToast('Erro ao inicializar página: ' + err.message, 'error');
            }
        }
    }

    function updateStats(totalGuests = null, totalPeople = null) {
        // Usa o totalItems vindo do metadado da API se disponível
        const total = totalGuests !== null ? totalGuests : allGuests.length;
        const confirmed = allConfirmations.filter(c => c.status === 'CONFIRMADO' || c.status === 'CONFIRMED').length;
        
        // Agora usamos o total de pessoas enviado pelo backend (global)
        // Se não vier (caso de erro ou busca local), fallback para o cálculo local
        let peopleDisplay = totalPeople;
        if (peopleDisplay === null) {
            const companionsOnPage = allGuests.reduce((acc, g) => acc + (g.companions ? g.companions.length : 0), 0);
            peopleDisplay = total + companionsOnPage;
        }

        elements.statTotal.textContent = total;
        elements.statConfirmed.textContent = confirmed;
        elements.statPeople.textContent = peopleDisplay;
    }

    function renderGuests(guests) {
        elements.tbody.innerHTML = '';

        guests.forEach((guest, index) => {
            const confirmation = allConfirmations.find(c => c.guest_id === guest.id || c.guest_id === String(guest.id));
            const status = confirmation ? confirmation.status : 'PENDENTE';
            const isConfirmed = status === 'CONFIRMADO' || status === 'CONFIRMED';
            const isCancelled = status === 'CANCELADO' || status === 'CANCELLED';

            const statusClass = isConfirmed
                ? 'bg-green-100/80 text-green-700 hover:bg-red-50 hover:text-red-700'
                : (isCancelled
                    ? 'bg-red-100/80 text-red-700 hover:bg-green-50 hover:text-green-700'
                    : 'bg-surface-container-highest text-secondary hover:bg-green-50 hover:text-green-700');

            const tr = document.createElement('tr');
            tr.className = `animate-fade-in stagger-${(index % 5) + 1}`;
            tr.innerHTML = `
                <td class="px-10 py-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                            ${guest.nome_completo.charAt(0)}
                        </div>
                        <div class="font-bold text-on-surface text-sm">${guest.nome_completo}</div>
                    </div>
                </td>
                <td class="px-6 py-6 text-sm font-medium text-secondary/70">${guest.telefone}</td>
                <td class="px-6 py-6 text-center">
                    <span class="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface">
                        ${(guest.companions ? guest.companions.length : 0)} p.
                    </span>
                </td>
                <td class="px-6 py-6">
                    <button onclick="toggleConfirmation(${guest.id}, '${status}')" class="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${statusClass}" title="Clique para alternar status">
                        ${status}
                    </button>
                </td>
                <td class="px-10 py-6 text-right">
                    <div class="flex justify-end gap-3">
                        <button onclick="handleEditGuest(${guest.id})" class="text-secondary/30 hover:text-primary transition-colors" title="Editar">
                            <span class="material-symbols-outlined text-xl">edit_note</span>
                        </button>
                        <a href="/companions.html?eventId=${eventId}&guestId=${guest.id}" class="text-secondary/30 hover:text-primary transition-colors" title="Acompanhantes">
                            <span class="material-symbols-outlined text-xl">diversity_3</span>
                        </a>
                        <button onclick="handleDeleteGuest(${guest.id})" class="text-secondary/30 hover:text-primary transition-colors" title="Excluir">
                            <span class="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>
                </td>
            `;
            elements.tbody.appendChild(tr);
        });
    }

    function renderPagination(data, search = '') {
        elements.pagination.innerHTML = '';
        if (!data || data.totalPages <= 1) return;

        const totalPages = Number(data.totalPages);
        const currentPage = Number(data.currentPage);

        // Prev
        const prevBtn = document.createElement('button');
        prevBtn.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-primary/5 text-secondary'}`;
        prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
        if (currentPage > 1) prevBtn.onclick = () => loadData(currentPage - 1, search);
        elements.pagination.appendChild(prevBtn);

        // Numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            const isActive = i === currentPage;
            btn.className = `w-10 h-10 rounded-full font-manrope font-bold text-xs transition-all ${isActive ? 'bg-primary text-white' : 'hover:bg-primary/5 text-secondary'}`;
            btn.textContent = i;
            btn.onclick = () => loadData(i, search);
            elements.pagination.appendChild(btn);
        }

        // Next
        const nextBtn = document.createElement('button');
        nextBtn.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-primary/5 text-secondary'}`;
        nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
        if (currentPage < totalPages) nextBtn.onclick = () => loadData(currentPage + 1, search);
        elements.pagination.appendChild(nextBtn);
    }

    // Modal logic
    let currentEditId = null;

    const openModal = (guest = null) => {
        currentEditId = guest ? guest.id : null;
        elements.modalTitle.textContent = guest ? 'Editar Convidado' : 'Novo Convidado';
        elements.submitBtn.textContent = guest ? 'Salvar Alterações' : 'Salvar Convidado';

        if (guest) {
            elements.guestName.value = guest.nome_completo;
            elements.guestPhone.value = guest.telefone;
        } else {
            elements.form.reset();
        }

        elements.modal.classList.remove('hidden');
        setTimeout(() => elements.modal.classList.remove('opacity-0'), 10);
    };

    const closeModal = () => {
        elements.modal.classList.add('opacity-0');
        setTimeout(() => {
            elements.modal.classList.add('hidden');
            currentEditId = null;
            elements.form.reset();
        }, 300);
    };

    elements.openModal.addEventListener('click', () => openModal());
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
        elements.confirmOk.textContent = 'Excluindo...';

        try {
            const res = await api.deleteGuest(eventId, currentDeleteId);
            if (res.success) {
                showToast('Convidado excluído com sucesso!');
                closeConfirm();
                await loadData(currentGuestPage);
            }
        } catch (err) {
            showToast(err.message || 'Erro ao excluir convidado', 'error');
        } finally {
            elements.confirmOk.disabled = false;
            elements.confirmOk.textContent = originalText;
        }
    });

    // Filter logic with debounce
    let searchTimeout;
    elements.search.addEventListener('input', (e) => {
        const term = e.target.value;
        
        // Local filter immediately for better UX
        const filtered = allGuests.filter(g =>
            g.nome_completo.toLowerCase().includes(term.toLowerCase()) ||
            g.telefone.includes(term) ||
            (g.companions && g.companions.some(c => c.nome_completo.toLowerCase().includes(term.toLowerCase())))
        );
        renderGuests(filtered);
        
        // Clear previous timeout and set a new one for server-side search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadData(1, term); // Always search from page 1
        }, 500);
    });

    // Form logic
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = elements.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const guestData = {
            nome_completo: elements.guestName.value.trim(),
            telefone: elements.guestPhone.value.trim()
        };

        if (!guestData.nome_completo || guestData.telefone.length < 18) {
            showToast('Preencha o nome e o telefone (+55 (99) 99999-9999)', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';

            let res;
            if (currentEditId) {
                res = await api.updateGuest(eventId, currentEditId, guestData);
                if (res.success) showToast('Convidado atualizado com sucesso!');
            } else {
                res = await api.createGuest(eventId, guestData);
                if (res.success) showToast('Convidado adicionado com sucesso!');
            }

            if (res.success) {
                closeModal();
                await loadData(currentEditId ? currentGuestPage : 1); // If new, go to page 1, if edit stay
            }
        } catch (err) {
            console.error('Error detail:', err);
            showToast(err.message || 'Erro ao processar requisição', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Using global window.showToast from common.js

    // Global handlers
    window.handleDeleteGuest = (id) => {
        showConfirm(id);
    };

    window.handleEditGuest = (id) => {
        const guest = allGuests.find(g => g.id === id);
        if (guest) openModal(guest);
    };

    window.toggleConfirmation = async (guestId, currentStatus) => {
        try {
            const isConfirmed = currentStatus === 'CONFIRMADO' || currentStatus === 'CONFIRMED';
            if (isConfirmed) {
                await api.unconfirmGuest(eventId, guestId);
                showToast('Status alterado para Pendente');
            } else {
                await api.confirmGuest(eventId, guestId, 'CONFIRMADO');
                showToast('Convidado confirmado com sucesso!');
            }
            await loadData(currentGuestPage);
        } catch (err) {
            showToast(err.message || 'Erro ao alterar status', 'error');
        }
    };

    // PDF Export Logic
    async function exportGuestsPDF() {
        if (!elements.btnExportPdf) return;
        
        const originalText = elements.btnExportPdf.innerHTML;
        elements.btnExportPdf.disabled = true;
        elements.btnExportPdf.innerHTML = '<span class="material-symbols-outlined">sync</span> Gerando...';

        try {
            // 1. Fetch ALL guests for this event (high limit)
            const res = await api.getGuests(eventId, 1, 1000);
            if (!res.success) throw new Error('Falha ao obter lista de convidados');
            
            let guestsData = res.data.items || [];
            
            // 2. Sort alphabetically
            guestsData.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

            // 3. Setup jspdf
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Header Section
            const companyName = "Memory Docs Eventos";
            const eventName = elements.eventTitle.textContent || "Lista de Convidados";
            const dateStr = new Date().toLocaleDateString('pt-BR');

            doc.setFontSize(22);
            doc.setTextColor(173, 43, 12); // Primary color #ad2b0c
            doc.text(companyName, 14, 20);
            
            doc.setFontSize(14);
            doc.setTextColor(74, 97, 119); // Secondary color
            doc.text(eventName, 14, 30);
            
            doc.setFontSize(10);
            doc.text(`Lista de Presença - Gerada em: ${dateStr}`, 14, 38);

            // 4. Prepare Table Data
            const rows = [];
            guestsData.forEach(guest => {
                // Main Guest Row
                rows.push([
                    guest.nome_completo,
                    '[  ]' // Checkbox
                ]);

                // Companion Rows
                if (guest.companions && guest.companions.length > 0) {
                    guest.companions.forEach(comp => {
                        rows.push([
                            `      - ${comp.nome_completo} (Acomp.)`,
                            '[  ]' // Added checkbox for companions
                        ]);
                    });
                }
            });

            // 5. Build Table
            doc.autoTable({
                startY: 45,
                head: [['Nome do Convidado', 'Presença']],
                body: rows,
                theme: 'striped',
                headStyles: { 
                    fillColor: [173, 43, 12], 
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                styles: { 
                    fontSize: 9, 
                    cellPadding: 4,
                    valign: 'middle'
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 30, halign: 'center' }
                },
                didDrawPage: (data) => {
                    // Footer
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
                }
            });

            // 6. Save PDF
            const filename = `lista-convidados-${eventName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
            doc.save(filename);
            
            showToast('PDF gerado com sucesso!');

        } catch (err) {
            console.error('PDF Error:', err);
            showToast('Erro ao gerar PDF: ' + err.message, 'error');
        } finally {
            elements.btnExportPdf.disabled = false;
            elements.btnExportPdf.innerHTML = originalText;
        }
    }

    if (elements.btnExportPdf) {
        elements.btnExportPdf.addEventListener('click', exportGuestsPDF);
    }
});
