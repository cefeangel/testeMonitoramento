document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const token = urlParams.get('token');

    if (!eventId || !token) {
        document.body.innerHTML = `
            <div class="h-screen flex items-center justify-center p-10 text-center bg-surface">
                <div class="space-y-6">
                    <span class="material-symbols-outlined text-red-500 text-6xl">error</span>
                    <h1 class="text-2xl font-bold">Acesso Inválido</h1>
                    <p class="text-secondary/60">Este link de convidado é inválido ou expirou. Por favor, solicite um novo acesso.</p>
                </div>
            </div>
        `;
        return;
    }

    const elements = {
        name: document.getElementById('event-name'),
        date: document.getElementById('event-date'),
        heroBg: document.getElementById('event-hero-bg'),
        galleryGrid: document.getElementById('gallery-grid'),
        btnUpload: document.getElementById('btn-upload-trigger'),
        linkFullSchedule: document.getElementById('link-full-schedule'),
        uploadInput: document.getElementById('photo-upload-input'),
        btnConfirmUpload: document.getElementById('btn-confirm-upload'),
        btnCancelUpload: document.getElementById('btn-cancel-upload'),
        modalUpload: document.getElementById('modal-upload-preview'),
        uploadPreview: document.getElementById('upload-media-preview'),
        uploadImgPreview: document.getElementById('upload-img-preview-el'),
        uploadVideoPreview: document.getElementById('upload-video-preview-el'),
        uploadGenericPreview: document.getElementById('upload-generic-preview'),
        modalWelcome: document.getElementById('modal-welcome'),
        welcomeInput: document.getElementById('guest-name-input'),
        btnSaveWelcome: document.getElementById('btn-save-welcome'),
        modalInfo: document.getElementById('modal-info'),
        modalInfoContent: document.getElementById('modal-info-content'),
        closeModalInfo: document.getElementById('close-modal-info'),
        btnViewGallery: document.getElementById('btn-view-gallery'),
        btnLoadMore: document.getElementById('btn-load-more-photos'),
        cameraInput: document.getElementById('camera-upload-input'),
        // Inline Camera Elements
        modalNativeCamera: document.getElementById('modal-native-camera'),
        cameraStream: document.getElementById('camera-stream'),
        btnCapture: document.getElementById('capture-photo'),
        btnCloseNativeCamera: document.getElementById('close-native-camera'),
        btnSwitchCamera: document.getElementById('switch-camera'),
        cameraCanvas: document.getElementById('camera-canvas'),
        modalChoice: document.getElementById('modal-upload-choice'),
        choiceCamera: document.getElementById('choice-camera'),
        choiceGallery: document.getElementById('choice-gallery'),
        btnCancelChoice: document.getElementById('btn-cancel-choice')
    };

    let currentEvent = null;
    let guestName = localStorage.getItem('Memory Docs_guest_name') || '';
    let selectedFile = null;
    let cameraActiveStream = null;
    let cameraFacingMode = 'environment';

    // Check Welcome
    if (!guestName) {
        elements.modalWelcome.classList.remove('hidden');
        setTimeout(() => {
            elements.modalWelcome.classList.remove('opacity-0');
            elements.modalWelcome.querySelector('.animate-fade-in').classList.remove('scale-95');
        }, 100);
    }

    elements.btnSaveWelcome.addEventListener('click', () => {
        const inputName = elements.welcomeInput.value.trim();
        guestName = inputName || 'Convidado';
        localStorage.setItem('Memory Docs_guest_name', guestName);
        closeModal(elements.modalWelcome);
    });

    // Fechar ao clicar no fundo (boas-vindas)
    elements.modalWelcome.addEventListener('click', (e) => {
        if (e.target === elements.modalWelcome) {
            guestName = 'Convidado';
            localStorage.setItem('Memory Docs_guest_name', guestName);
            closeModal(elements.modalWelcome);
        }
    });

    const openModal = (modal) => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Bloqueia scroll do fundo
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = modal.querySelector('.animate-fade-in') || modal.querySelector('.animate-slide-up');
            if (content) content.classList.remove('scale-95');
        }, 10);
    };

    const closeModal = (modal) => {
        modal.classList.add('opacity-0');
        const content = modal.querySelector('.animate-fade-in') || modal.querySelector('.animate-slide-up');
        if (content) content.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
            // Só libera o scroll se não houver outros modais visíveis
            const visibleModals = Array.from(document.querySelectorAll('.fixed:not(.hidden)'))
                .filter(m => m.id !== 'modal-welcome' && m.id !== 'modal-photo-view' || !m.classList.contains('hidden'));

            // Simplificando: se estamos fechando um modal, e não há outro processo de modal ativo, reseta.
            // Mas o jeito mais seguro é checar quem realmente tira o scroll.
            document.body.style.overflow = '';
        }, 300);
    };

    elements.closeModalInfo.addEventListener('click', () => closeModal(elements.modalInfo));

    // Fechar ao clicar no fundo
    elements.modalInfo.addEventListener('click', (e) => {
        if (e.target === elements.modalInfo) closeModal(elements.modalInfo);
    });

    // Load Data
    try {
        const res = await api.getPublicEvent(eventId, token);
        if (res.success) {
            currentEvent = res.data;
            renderEvent();
        }

        const galleryRes = await api.getPublicGallery(eventId, token);
        if (galleryRes.success) {
            renderGallery(galleryRes.data);
        }

        const agendaLink = document.getElementById('link-full-schedule');
        const galleryLink = document.getElementById('btn-view-gallery');
        const loadMoreLink = document.getElementById('btn-load-more-photos');

        if (agendaLink) agendaLink.href = `event-schedule.html?eventId=${eventId}&token=${token}`;
        if (galleryLink) {
            const url = `event-gallery.html?eventId=${eventId}&token=${token}`;
            galleryLink.onclick = () => window.location.href = url;
            loadMoreLink.onclick = () => window.location.href = url;
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        const msg = err.message || 'Token inválido ou expirado';
        showToast(`Falha ao acessar: ${msg}`, 'error');
    }

    function renderEvent() {
        elements.name.textContent = currentEvent.nome;
        const eventDate = new Date(currentEvent.data_hora);
        elements.date.textContent = eventDate.toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Hero Background (Preferir foto_capa do evento, fallback para primeiro item do cronograma)
        const coverUrl = currentEvent.foto_capa || currentEvent.schedules?.find(s => s.foto_url)?.foto_url;

        if (coverUrl) {
            elements.heroBg.style.backgroundImage = `url('${coverUrl}')`;
            elements.heroBg.style.backgroundSize = 'cover';
            elements.heroBg.style.backgroundPosition = 'center';
            elements.heroBg.classList.remove('bg-secondary/80');
        }
    }

    window.showInfo = (itemId) => {
        const item = currentEvent.schedules.find(s => s.id === itemId);
        if (!item) return;

        const time = new Date(item.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        elements.modalInfoContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">${time}h</div>
                <h2 class="text-2xl font-extrabold font-manrope leading-tight">${item.titulo}</h2>
                <p class="text-sm text-secondary leading-relaxed">${item.descricao || 'Sem detalhes adicionais fornecidos para esta etapa.'}</p>
            </div>
        `;

        openModal(elements.modalInfo);
    };

    window.viewPhoto = (url) => {
        const modal = document.getElementById('modal-photo-view');
        const img = document.getElementById('full-photo-img');
        const video = document.getElementById('full-video-player');
        
        // Se o modal não tiver o elemento de vídeo, vamos adicionar ou usar o que existir
        // No event-guest.html precisamos garantir que o video player exista
        const isVideo = url.match(/\.(mp4|mov|webm)$/i);

        if (isVideo) {
            if (img) img.classList.add('hidden');
            if (video) {
                video.classList.remove('hidden');
                video.src = url;
                video.play().catch(e => console.log('Video play interrupted', e));
            }
        } else {
            if (video) {
                video.classList.add('hidden');
                video.pause();
                video.src = '';
            }
            if (img) {
                img.classList.remove('hidden');
                img.src = url;
            }
        }

        openModal(modal);
    };

    document.getElementById('close-photo-view').addEventListener('click', () => {
        const modal = document.getElementById('modal-photo-view');
        const video = document.getElementById('full-video-player');
        if (video) {
            video.pause();
            video.src = '';
        }
        closeModal(modal);
    });

    // Fechar visualização de foto ao clicar no fundo
    document.getElementById('modal-photo-view').addEventListener('click', (e) => {
        const modal = document.getElementById('modal-photo-view');
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    function renderGallery(photos) {
        elements.galleryGrid.innerHTML = '';
        if (!photos || photos.length === 0) {
            elements.galleryGrid.innerHTML = '<div class="col-span-2 text-center py-10 text-secondary/30 italic text-xs">Nenhuma foto ainda. Seja o primeiro!</div>';
            return;
        }

        photos.slice(0, 6).forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = `aspect-square rounded-[2rem] overflow-hidden bg-surface-container-highest shadow-lg animate-fade-in stagger-${(idx % 4) + 1} active:scale-95 transition-all cursor-pointer relative`;
            div.onclick = () => window.viewPhoto(p.foto_url);
            
            const isVideo = p.media_type === 'VIDEO' || p.foto_url.match(/\.(mp4|mov|webm)$/i);
            
            div.innerHTML = isVideo 
                ? `<video src="${p.foto_url}" class="w-full h-full object-cover" muted playsinline></video>
                   <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span class="material-symbols-outlined text-white/50 text-3xl">play_circle</span>
                   </div>`
                : `<img src="${p.foto_url}" class="w-full h-full object-cover">`;
                
            elements.galleryGrid.appendChild(div);
        });
    }

    // Upload Logic
    const openModalChoice = () => {
        openModal(elements.modalChoice);
    };

    const closeChoice = (immediate = false) => {
        if (immediate) {
            elements.modalChoice.classList.add('opacity-0', 'hidden');
            document.body.style.overflow = '';
        } else {
            closeModal(elements.modalChoice);
        }
    };

    elements.btnUpload.addEventListener('click', openModalChoice);
    elements.btnCancelChoice.addEventListener('click', () => closeChoice());

    // Fechar ao clicar no fundo (fora do conteúdo)
    elements.modalChoice.addEventListener('click', (e) => {
        if (e.target === elements.modalChoice) {
            closeChoice();
        }
    });

    // Inline Camera Logic
    const startNativeCamera = async () => {
        try {
            closeChoice(true);
            const constraints = {
                video: {
                    facingMode: cameraFacingMode,
                    width: { ideal: 4096 },
                    height: { ideal: 2160 },
                    focusMode: 'continuous',
                    whiteBalanceMode: 'continuous'
                },
                audio: false
            };

            cameraActiveStream = await navigator.mediaDevices.getUserMedia(constraints);
            elements.cameraStream.srcObject = cameraActiveStream;

            elements.modalNativeCamera.classList.remove('hidden');
            setTimeout(() => elements.modalNativeCamera.classList.remove('opacity-0'), 10);
            showToast('Câmera ativada!', 'info');
        } catch (err) {
            console.error('Erro ao acessar câmera:', err);
            // Fallback para câmera do sistema (input file capture)
            showToast('Conexão insegura ou negada. Usando câmera do sistema...', 'warning');
            elements.cameraInput.click();
        }
    };

    const stopNativeCamera = () => {
        if (cameraActiveStream) {
            cameraActiveStream.getTracks().forEach(track => track.stop());
            cameraActiveStream = null;
        }
        elements.modalNativeCamera.classList.add('opacity-0');
        setTimeout(() => elements.modalNativeCamera.classList.add('hidden'), 300);
    };

    elements.choiceCamera.addEventListener('click', startNativeCamera);
    elements.btnCloseNativeCamera.addEventListener('click', stopNativeCamera);

    elements.btnSwitchCamera.addEventListener('click', () => {
        cameraFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
        stopNativeCamera();
        startNativeCamera();
    });

    elements.btnCapture.addEventListener('click', () => {
        const video = elements.cameraStream;
        const canvas = elements.cameraCanvas;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.imageSmoothingEnabled = false; // Desativa suavização para manter nitidez
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            stopNativeCamera();
            handleFileSelect(file);
        }, 'image/jpeg', 0.95);
    });

    elements.choiceGallery.addEventListener('click', () => {
        closeChoice(true);
        elements.uploadInput.click();
    });

    const handleFileSelect = (file) => {
        if (!file) {
            console.warn('Nenhum arquivo capturado');
            return;
        }

        const isVideo = file.type.startsWith('video/');
        showToast(`Processando ${isVideo ? 'vídeo' : 'imagem'}...`, 'info');

        // Check limit: 50MB
        const limitMB = 50;
        if (file.size > limitMB * 1024 * 1024) {
            showToast(`O arquivo deve ter no máximo ${limitMB}MB`, 'error');
            return;
        }

        selectedFile = file;
        
        // Reset previews
        elements.uploadImgPreview.classList.add('hidden');
        elements.uploadVideoPreview.classList.add('hidden');
        elements.uploadGenericPreview.classList.add('hidden');
        elements.uploadImgPreview.src = '';
        elements.uploadVideoPreview.src = '';

        const reader = new FileReader();

        reader.onerror = () => {
            showToast('Erro ao ler o arquivo. Tente novamente.', 'error');
        };

        reader.onload = (ev) => {
            if (isVideo) {
                elements.uploadVideoPreview.src = ev.target.result;
                elements.uploadVideoPreview.classList.remove('hidden');
                elements.uploadVideoPreview.play().catch(e => console.log('Autoplay prevented', e));
            } else if (file.type.startsWith('image/')) {
                elements.uploadImgPreview.src = ev.target.result;
                elements.uploadImgPreview.classList.remove('hidden');
            } else {
                elements.uploadGenericPreview.classList.remove('hidden');
            }

            // Força a exibição do modal de preview
            openModal(elements.modalUpload);
            elements.modalUpload.style.zIndex = '200';
        };
        reader.readAsDataURL(file);
    };

    elements.uploadInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
        e.target.value = ''; // Reset for next selection
    });

    elements.cameraInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
        e.target.value = ''; // Reset for next selection
    });

    elements.btnCancelUpload.addEventListener('click', () => {
        selectedFile = null;
        elements.uploadInput.value = '';
        closeModal(elements.modalUpload);
    });

    // Fechar ao clicar no fundo
    elements.modalUpload.addEventListener('click', (e) => {
        if (e.target === elements.modalUpload) {
            selectedFile = null;
            elements.uploadInput.value = '';
            closeModal(elements.modalUpload);
        }
    });

    elements.btnConfirmUpload.addEventListener('click', async () => {
        if (!selectedFile) return;

        const originalText = elements.btnConfirmUpload.textContent;
        try {
            elements.btnConfirmUpload.disabled = true;
            elements.btnConfirmUpload.textContent = 'Enviando...';

            const formData = new FormData();
            formData.append('foto', selectedFile);
            formData.append('enviado_por', guestName || 'Convidado');

            const res = await api.uploadPublicPhoto(eventId, token, formData);
            if (res.success) {
                const isVideo = selectedFile.type.startsWith('video/');
                showToast(`${isVideo ? 'Vídeo enviado' : 'Foto enviada'} com sucesso! Memória salva.`);
                closeModal(elements.modalUpload);
                elements.uploadInput.value = '';
                selectedFile = null;
                
                // Stop video preview if playing
                elements.uploadVideoPreview.pause();
                elements.uploadVideoPreview.src = '';

                // Refresh Gallery
                const galleryRes = await api.getPublicGallery(eventId, token);
                if (galleryRes.success) renderGallery(galleryRes.data);
            }
        } catch (err) {
            showToast('Erro ao enviar foto: ' + err.message, 'error');
        } finally {
            elements.btnConfirmUpload.disabled = false;
            elements.btnConfirmUpload.textContent = originalText;
        }
    });

});
