document.addEventListener('DOMContentLoaded', async () => {
    // Get event ID from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        window.location.href = '/dashboard.html';
        return;
    }

    const elements = {
        title: document.getElementById('event-title'),
        description: document.getElementById('event-description'),
        dateBadge: document.getElementById('event-date-badge'),
        capacity: document.getElementById('event-capacity'),
        guestCount: document.getElementById('guest-count'),
        progressBar: document.getElementById('capacity-progress'),
        scheduleContainer: document.getElementById('schedule-container'),
        scheduleEmpty: document.getElementById('schedule-empty'),
        guestsList: document.getElementById('guests-list'),
        manageGuestsLink: document.getElementById('manage-guests-link'),
        manageQrBtn: document.getElementById('btn-manage-qr'),
        galleryLink: document.getElementById('gallery-link'),
        galleryPreview: document.getElementById('gallery-preview'),
        galleryEmpty: document.getElementById('gallery-empty-preview'),
        openSchedule: document.getElementById('add-schedule-btn'),
        modalSch: document.getElementById('modal-schedule'),
        formSch: document.getElementById('add-schedule-form'),
        cancelSch: document.getElementById('cancel-sch'),
        closeSch: document.getElementById('close-modal-schedule'),
        modalSchTitle: document.getElementById('modal-sch-title'),
        submitSchBtn: document.getElementById('submit-sch-btn'),
        // Confirm Modal
        modalConfirm: document.getElementById('modal-confirm'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel'),
        // Photo Specific
        schPhoto: document.getElementById('sch-photo'),
        schPhotoPreview: document.getElementById('sch-photo-preview'),
        schDate: document.getElementById('sch-date'),
        // Preview Modal
        modalPrev: document.getElementById('modal-preview'),
        modalPrevImg: document.getElementById('preview-img'),
        modalPrevVideo: document.getElementById('preview-video'),
        prevClose: document.getElementById('close-preview'),
        prevCloseBg: document.getElementById('close-preview-bg'),
        qrcodePlaceholder: document.getElementById('qrcode-placeholder'),
        exportPdfBtn: document.getElementById('btn-export-pdf')
    };

    // Update links
    elements.manageGuestsLink.href = `/guests.html?eventId=${eventId}`;
    elements.manageQrBtn.href = `/qrcode-view.html?eventId=${eventId}`;
    elements.galleryLink.href = `/gallery.html?eventId=${eventId}`;

    // Modal Schedule Logic
    let currentSchEditId = null;
    let allScheduleItems = [];

    const openSchModal = (item = null) => {
        currentSchEditId = item ? item.id : null;
        elements.modalSchTitle.textContent = item ? 'Editar Item de Cronograma' : 'Novo Item de Cronograma';
        elements.submitSchBtn.textContent = item ? 'Salvar Alterações' : 'Salvar Item';

        if (item) {
            document.getElementById('sch-title').value = item.titulo;
            document.getElementById('sch-desc').value = item.descricao || '';
            const dt = new Date(item.data_hora);
            const localDt = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            document.getElementById('sch-date').value = localDt;

            if (item.foto_url) {
                elements.schPhotoPreview.innerHTML = `<img src="${item.foto_url}" class="w-full h-full object-cover">`;
            } else {
                elements.schPhotoPreview.innerHTML = '<span class="material-symbols-outlined text-secondary/20">image</span>';
            }
        } else {
            elements.formSch.reset();
            elements.schPhotoPreview.innerHTML = '<span class="material-symbols-outlined text-secondary/20">image</span>';
        }

        elements.modalSch.classList.remove('hidden');
        setTimeout(() => {
            elements.modalSch.classList.remove('opacity-0');
            elements.modalSch.firstElementChild.classList.remove('scale-95');
        }, 10);
    };

    const closeSchModal = () => {
        elements.modalSch.classList.add('opacity-0');
        elements.modalSch.firstElementChild.classList.add('scale-95');
        setTimeout(() => {
            elements.modalSch.classList.add('hidden');
            currentSchEditId = null;
            elements.formSch.reset();
        }, 300);
    };

    elements.openSchedule.addEventListener('click', () => openSchModal());
    elements.closeSch.addEventListener('click', closeSchModal);
    elements.cancelSch.addEventListener('click', closeSchModal);
    elements.exportPdfBtn.addEventListener('click', () => exportSchedulePDF());

    elements.schPhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                elements.schPhotoPreview.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
        }
    });

    elements.formSch.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = elements.submitSchBtn;
        const originalText = submitBtn.textContent;

        const formData = new FormData();
        formData.append('titulo', document.getElementById('sch-title').value);
        formData.append('descricao', document.getElementById('sch-desc').value);
        formData.append('data_hora', new Date(elements.schDate.value).toISOString());

        if (elements.schPhoto.files[0]) {
            formData.append('foto', elements.schPhoto.files[0]);
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';

            let res;
            if (currentSchEditId) {
                // Use a generic request if api.putSchedule doesn't handle FormData easily, 
                // but our api.js now handles FormData in api.request.
                res = await api.putSchedule(eventId, currentSchEditId, formData);
                if (res.success) showToast('Item atualizado!');
            } else {
                res = await api.postSchedule(eventId, formData);
                if (res.success) showToast('Item adicionado!');
            }

            if (res.success) {
                closeSchModal();
                const freshSch = await api.getSchedule(eventId);
                allScheduleItems = freshSch.data.items || [];
                renderSchedule(allScheduleItems);
            }
        } catch (err) {
            showToast(err.message || 'Erro ao salvar item', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

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
            const res = await api.deleteSchedule(eventId, currentDeleteId);
            if (res.success) {
                showToast('Item removido com sucesso!');
                closeConfirm();
                const freshSch = await api.getSchedule(eventId);
                allScheduleItems = freshSch.data.items || [];
                renderSchedule(allScheduleItems);
            }
        } catch (err) {
            showToast(err.message || 'Erro ao excluir item', 'error');
        } finally {
            elements.confirmOk.disabled = false;
            elements.confirmOk.textContent = originalText;
        }
    });

    window.handleDeleteSch = async (schId) => {
        showConfirm(schId);
    };

    window.handleEditSch = (schId) => {
        const item = allScheduleItems.find(i => i.id === schId);
        if (item) openSchModal(item);
    };

    // Preview Logic
    window.handlePreview = (url) => {
        if (!url) return;
        
        const isVideo = url.match(/\.(mp4|mov|webm)$/i);
        
        if (isVideo) {
            elements.modalPrevImg.classList.add('hidden');
            elements.modalPrevVideo.classList.remove('hidden');
            elements.modalPrevVideo.src = url;
            elements.modalPrevVideo.play().catch(e => console.log('Autoplay blocked', e));
        } else {
            elements.modalPrevVideo.classList.add('hidden');
            elements.modalPrevVideo.pause();
            elements.modalPrevVideo.src = '';
            elements.modalPrevImg.classList.remove('hidden');
            elements.modalPrevImg.src = url;
        }

        elements.modalPrev.classList.remove('hidden');
        setTimeout(() => {
            elements.modalPrev.classList.remove('opacity-0');
            elements.modalPrev.querySelector('.relative').classList.remove('scale-95');
        }, 10);
    };

    const closePreview = () => {
        elements.modalPrev.classList.add('opacity-0');
        elements.modalPrev.querySelector('.relative').classList.add('scale-95');
        elements.modalPrevVideo.pause();
        
        setTimeout(() => {
            elements.modalPrev.classList.add('hidden');
            elements.modalPrevImg.src = '';
            elements.modalPrevVideo.src = '';
        }, 300);
    };

    elements.prevClose.addEventListener('click', closePreview);
    elements.prevCloseBg.addEventListener('click', closePreview);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modalPrev.classList.contains('hidden')) {
            closePreview();
        }
    });

    try {
        // Fetch data concurrently
        const [eventRes, scheduleRes, guestsRes, galleryRes] = await Promise.all([
            api.getEvent(eventId),
            api.getSchedule(eventId),
            api.getGuests(eventId),
            api.getGallery(eventId)
        ]);

        if (eventRes.success) {
            renderEventHeader(eventRes.data);
            updateStats(eventRes.data, guestsRes.data.items || []);
        }

        if (scheduleRes.success) {
            allScheduleItems = scheduleRes.data.items || [];
            renderSchedule(allScheduleItems);
        }

        if (guestsRes.success) {
            renderGuests((guestsRes.data.items || []).slice(0, 5)); // Show only first 5
        }

        if (galleryRes.success) {
            renderGallery((galleryRes.data.items || []).slice(0, 4)); // Show only first 4
        }

    } catch (error) {
        console.error('Error loading event details:', error);
    }

    async function loadQRCode() {
        try {
            const res = await api.getQRCode(eventId);
            if (res.success && res.data) {
                const qrPath = `/${res.data.qrcode_path.replace(/\\/g, '/')}`;
                elements.qrcodePlaceholder.innerHTML = `<img src="${qrPath}" class="w-full h-full object-contain rounded-xl">`;
                elements.qrcodePlaceholder.classList.remove('bg-surface', 'flex', 'items-center', 'justify-center');
                elements.qrcodePlaceholder.classList.add('overflow-hidden');
            }
        } catch (err) {
            // Probably 404, just keep placeholder
            console.log('No QR Code generated yet or error:', err.message);
        }
    }

    loadQRCode();

    function renderGallery(photos) {
        if (!photos || photos.length === 0) {
            elements.galleryEmpty.classList.remove('hidden');
            return;
        }

        elements.galleryPreview.innerHTML = '';
        photos.forEach(photo => {
            let photoPath = photo.foto_url || photo.url_foto;
            if (photoPath && !photoPath.startsWith('http')) {
                photoPath = `/${photoPath.replace(/\\/g, '/')}`;
            }

            const isVideo = photo.media_type === 'VIDEO' || photoPath.match(/\.(mp4|mov|webm)$/i);

            const div = document.createElement('div');
            div.className = "aspect-square rounded-2xl overflow-hidden bg-surface-container-highest cursor-pointer hover:scale-[1.02] active:scale-95 transition-all relative";
            
            div.innerHTML = isVideo 
                ? `<video src="${photoPath}" class="w-full h-full object-cover" muted playsinline></video>
                   <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span class="material-symbols-outlined text-white/50 text-2xl">play_circle</span>
                   </div>`
                : `<img src="${photoPath}" class="w-full h-full object-cover">`;
                
            div.onclick = () => window.handlePreview(photoPath);
            elements.galleryPreview.appendChild(div);
        });
    }

    function renderEventHeader(event) {
        const date = new Date(event.data_hora);
        const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };

        elements.title.textContent = event.nome;
        elements.description.textContent = event.descricao || 'Sem descrição detalhada disponível.';
        elements.dateBadge.textContent = date.toLocaleDateString('pt-BR', options);
        elements.capacity.textContent = event.capacidade_total;
    }

    function updateStats(event, guests) {
        const count = guests.length;
        elements.guestCount.textContent = count;

        const percentage = Math.min((count / event.capacidade_total) * 100, 100);
        elements.progressBar.style.width = `${percentage}%`;
    }

    function renderSchedule(items) {
        if (!items || items.length === 0) {
            elements.scheduleEmpty.classList.remove('hidden');
            return;
        }

        elements.scheduleContainer.innerHTML = '';
        // Timeline dot base line
        const dotLine = document.createElement('div');
        dotLine.className = "absolute left-0 top-0 bottom-0 w-[2px] bg-outline-variant/20 rounded-full";
        elements.scheduleContainer.appendChild(dotLine);

        items.forEach((item, index) => {
            const time = new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const div = document.createElement('div');
            div.className = `relative pl-10 group/item animate-fade-in stagger-${(index % 3) + 1}`;
            div.innerHTML = `
                <div class="absolute left-[-24px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white shadow-sm"></div>
                <div class="flex items-center justify-between">
                    <div class="flex-grow">
                        <div class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">${time}</div>
                        <h4 class="text-sm font-bold text-on-surface">${item.titulo}</h4>
                        <p class="text-xs text-secondary/60 mt-1">${item.descricao || ''}</p>
                        ${item.foto_url ? `
                        <div onclick="handlePreview('${item.foto_url}')" class="mt-4 aspect-video w-full max-w-[200px] rounded-xl overflow-hidden bg-surface-container-highest border border-outline-variant/10 cursor-pointer group/photo relative">
                            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-all">
                                <div class="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover/photo:scale-100 transition-all duration-300">
                                    <span class="material-symbols-outlined font-bold">zoom_in</span>
                                </div>
                            </div>
                            <img src="${item.foto_url}" class="w-full h-full object-cover">
                        </div>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                        <button onclick="handleEditSch(${item.id})" class="text-secondary/20 hover:text-primary transition-colors" title="Editar">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onclick="handleDeleteSch(${item.id})" class="text-secondary/20 hover:text-primary transition-colors" title="Remover">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>
            `;
            elements.scheduleContainer.appendChild(div);
        });
    }
    
    function exportSchedulePDF() {
        if (!allScheduleItems || allScheduleItems.length === 0) {
            showToast('O cronograma está vazio!', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const eventName = elements.title.textContent;
        const eventDate = elements.dateBadge.textContent;

        // Memory Docs Primary Color: #ad2b0c
        const primaryColor = [173, 43, 12]; 

        // Header Background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 45, 'F');
        
        // Brand Identity
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('MEMORY DOCS', 20, 20);
        
        doc.setFontSize(16);
        doc.text('Cronograma do Evento', 20, 32);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(eventName.toUpperCase(), 20, 40);
        doc.text(eventDate, 140, 40);

        // Content Table
        const tableData = allScheduleItems
            .map(item => [
                new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                item.titulo,
                item.descricao || '-'
            ]);

        doc.autoTable({
            startY: 55,
            head: [['HORÁRIO', 'ATIVIDADE', 'DESCRIÇÃO']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 5
            },
            columnStyles: {
                0: { cellWidth: 30, halign: 'center' },
                1: { cellWidth: 60, fontStyle: 'bold' },
                2: { cellWidth: 'auto' }
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            margin: { left: 20, right: 20 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Memory Docs - Gestão Editorial de Eventos`, 20, 285);
            doc.text(`Página ${i} de ${pageCount}`, 180, 285);
        }

        doc.save(`cronograma-${eventName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
        showToast('Cronograma exportado com sucesso!');
    }

    // Using global window.showToast from common.js

    function renderGuests(guests) {
        // No longer listing guests in the sidebar as per user request.
        // Keeping the summary at the top card (total count) but clearing the sidebar list.
        elements.guestsList.innerHTML = '';
        // If we want to hide the container entirely:
        // elements.guestsList.parentElement.classList.add('hidden'); 
        // But for now just clearing the inner list.
    }
});
