document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
        window.location.href = '/dashboard.html';
        return;
    }

    let currentEvent = null;
    let currentQRCode = null;

    const elements = {
        title: document.getElementById('event-title'),
        date: document.getElementById('event-date'),
        loading: document.getElementById('loading-qr'),
        container: document.getElementById('qr-container'),
        image: document.getElementById('qr-image'),
        empty: document.getElementById('qr-empty'),
        status: document.getElementById('qr-status'),
        expiry: document.getElementById('qr-expiry'),
        btnGenerate: document.getElementById('btn-generate'),
        btnPrint: document.getElementById('btn-print'),
        btnDownload: document.getElementById('btn-download'),
        backBtn: document.getElementById('back-to-event'),
        editDate: document.getElementById('edit-date-trigger'),
        editLocation: document.getElementById('edit-location-trigger'),
        modal: document.getElementById('edit-modal'),
        modalForm: document.getElementById('edit-event-form'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        modalOverlay: document.getElementById('modal-overlay'),
        inputName: document.getElementById('edit-name'),
        inputDate: document.getElementById('edit-date'),
        inputLocation: document.getElementById('edit-location'),
        inputExpiry: document.getElementById('edit-expiry'),
        inputCover: document.getElementById('edit-cover'),
        coverPreview: document.getElementById('cover-preview'),
        editExpiry: document.getElementById('edit-expiry-trigger'),
        card: document.getElementById('checkin-card'),
        cardHero: document.getElementById('card-hero'),
        cardHeroImg: document.getElementById('card-hero-img'),
        cardHeroPlaceholder: document.getElementById('card-hero-placeholder'),
        sizeSelector: document.getElementById('print-size-selector'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmTitle: document.getElementById('confirm-title'),
        confirmMsg: document.getElementById('confirm-message'),
        btnConfirmOk: document.getElementById('btn-ok-confirm'),
        btnConfirmCancel: document.getElementById('btn-cancel-confirm'),
        confirmOverlay: document.getElementById('confirm-overlay')
    };

    elements.backBtn.href = `/event-details.html?id=${eventId}`;

    // Load initial data
    try {
        const eventRes = await api.getEvent(eventId);
        if (eventRes.success) {
            currentEvent = eventRes.data;
            elements.title.textContent = currentEvent.nome;
            elements.date.textContent = new Date(currentEvent.data_hora).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric'
            });

            // Update Card Hero
            if (currentEvent.foto_capa) {
                elements.cardHeroImg.style.backgroundImage = `url('${currentEvent.foto_capa}')`;
                elements.cardHeroPlaceholder.classList.add('opacity-0');
            } else {
                elements.cardHeroImg.style.backgroundImage = '';
                elements.cardHeroPlaceholder.classList.remove('opacity-0');
            }
        }

        await fetchQRCode();
    } catch (err) {
        console.error('Error loading QR info:', err);
    }

    elements.cardHero.addEventListener('click', () => openModal());

    async function fetchQRCode() {
        elements.loading.classList.remove('hidden');
        elements.container.classList.add('hidden');
        elements.empty.classList.add('hidden');

        try {
            const res = await api.getQRCode(eventId);
            if (res.success && res.data) {
                currentQRCode = res.data;
                renderQR(res.data);
            } else {
                elements.loading.classList.add('hidden');
                elements.empty.classList.remove('hidden');
            }
        } catch (err) {
            elements.loading.classList.add('hidden');
            if (err.message.includes('404')) {
                elements.empty.classList.remove('hidden');
            } else {
                console.error('Fetch error:', err);
                elements.empty.classList.remove('hidden');
            }
        }
    }

    function renderQR(data) {
        elements.loading.classList.add('hidden');
        elements.container.classList.remove('hidden');

        // Path construction based on what we saw in the service
        // The service saves to uploads/qrcodes/...
        // The static middleware serves /uploads/
        const qrPath = `/${data.qrcode_path.replace(/\\/g, '/')}`;
        elements.image.src = qrPath;

        const expiryDate = new Date(data.expires_at);
        elements.expiry.textContent = expiryDate.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const isExpired = expiryDate < new Date();
        if (isExpired) {
            elements.status.textContent = 'EXPIRADO';
            elements.status.className = 'px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-[10px]';
        } else {
            elements.status.textContent = 'ATIVO';
            elements.status.className = 'px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-[10px]';
        }
    }

    // Generate logic
    elements.btnGenerate.addEventListener('click', async () => {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30); // Default 30 days

        try {
            elements.btnGenerate.disabled = true;
            elements.btnGenerate.textContent = 'Gerando...';
            const res = await api.generateQRCode(eventId, expiry.toISOString());
            if (res.success) {
                await fetchQRCode();
            }
        } catch (err) {
            showToast('Erro ao gerar QR Code: ' + err.message, 'error');
        } finally {
            elements.btnGenerate.disabled = false;
        }
    });

    // Print logic
    elements.btnPrint.addEventListener('click', () => {
        window.print();
    });

    // Download logic (Only QR Code, but resized)
    elements.btnDownload.addEventListener('click', async () => {
        if (!elements.image.src) return;

        const size = elements.card.getAttribute('data-print-size') || 'lg';
        const targetSizes = { sm: 256, md: 512, lg: 1024 };
        const pixelSize = targetSizes[size] || 512;

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Critical for CORS
            img.src = elements.image.src;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = pixelSize;
                canvas.height = pixelSize;
                const ctx = canvas.getContext('2d');

                // Draw resized
                ctx.drawImage(img, 0, 0, pixelSize, pixelSize);

                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = `qrcode-${size}-${eventId}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            };
        } catch (err) {
            showToast('Erro ao processar imagem: ' + err.message, 'error');
        }
    });

    // Print Size Logic
    elements.sizeSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const size = btn.dataset.size;
        elements.card.setAttribute('data-print-size', size);

        // Update UI state
        Array.from(elements.sizeSelector.children).forEach(b => {
            b.className = 'px-6 py-2 rounded-full border border-surface-container-highest text-[10px] font-bold uppercase transition-all hover:bg-surface-container-highest';
        });
        btn.className = 'px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase transition-all';
    });

    // Modal Logic
    const openModal = () => {
        if (!currentEvent) return;
        elements.inputName.value = currentEvent.nome;
        elements.inputDate.value = currentEvent.data_hora.slice(0, 16);

        if (currentQRCode) {
            const date = new Date(currentQRCode.expires_at);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            elements.inputExpiry.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            // Default: 30 days from now
            const future = new Date();
            future.setDate(future.getDate() + 30);
            elements.inputExpiry.value = future.toISOString().slice(0, 16);
        }

        if (currentEvent.foto_capa) {
            elements.coverPreview.classList.remove('hidden');
            elements.coverPreview.querySelector('img').src = currentEvent.foto_capa;
        } else {
            elements.coverPreview.classList.add('hidden');
        }

        elements.modal.classList.remove('hidden');
    };

    // Cover preview logic
    elements.inputCover.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                elements.coverPreview.classList.remove('hidden');
                elements.coverPreview.querySelector('img').src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    const closeModal = () => elements.modal.classList.add('hidden');

    elements.editDate.addEventListener('click', openModal);
    elements.editLocation.addEventListener('click', openModal);
    if (elements.editExpiry) elements.editExpiry.addEventListener('click', openModal);
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', closeModal);

    async function showConfirm(title, message) {
        return new Promise((resolve) => {
            elements.confirmTitle.textContent = title;
            elements.confirmMsg.textContent = message;
            elements.confirmModal.classList.remove('hidden');

            const handleAction = (value) => {
                elements.confirmModal.classList.add('hidden');
                resolve(value);
            };

            elements.btnConfirmOk.onclick = () => handleAction(true);
            elements.btnConfirmCancel.onclick = () => handleAction(false);
            elements.confirmOverlay.onclick = () => handleAction(false);
        });
    }

    elements.modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const data = {
            nome: elements.inputName.value,
            data_hora: elements.inputDate.value,
            capacidade_total: (currentEvent && currentEvent.capacidade_total) || 1,
            descricao: currentEvent ? currentEvent.descricao : '',
            max_dependentes_por_convidado: currentEvent ? currentEvent.max_dependentes_por_convidado : 0
        };

        try {
            btn.disabled = true;
            btn.textContent = 'Salvando...';

            // 1. Upload Cover if selected
            if (elements.inputCover.files.length > 0) {
                const formData = new FormData();
                formData.append('foto', elements.inputCover.files[0]);
                await api.uploadEventCover(eventId, formData);
            }

            await api.updateEvent(eventId, data);

            const newExpiryRaw = elements.inputExpiry.value;
            const newExpiryDate = new Date(newExpiryRaw);
            const oldExpiryDate = currentQRCode ? new Date(currentQRCode.expires_at) : null;

            // Compare timestamps (ignoring seconds/ms since input doesn't have them)
            const hasChanged = !oldExpiryDate || Math.abs(newExpiryDate.getTime() - oldExpiryDate.getTime()) > 60000;

            if (hasChanged) {
                const confirmed = await showConfirm(
                    'Renovar QR Code',
                    'A alteração da expiração irá invalidar o código atual e gerar um novo. Deseja continuar?'
                );
                if (confirmed) {
                    await api.generateQRCode(eventId, newExpiryDate.toISOString());
                    showToast('QR Code renovado com sucesso!');
                }
            } else {
                showToast('Informações atualizadas!');
            }

            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            showToast('Erro ao atualizar: ' + err.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Salvar';
            }
        }
    });
});
