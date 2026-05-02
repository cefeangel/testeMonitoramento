document.addEventListener('DOMContentLoaded', async () => {
    console.log('--- Galeria Versão 2.1 - Zoom Ativo ---');
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
        window.location.href = '/dashboard.html';
        return;
    }

    const elements = {
        title: document.getElementById('event-title'),
        grid: document.getElementById('gallery-grid'),
        loading: document.getElementById('loading-gallery'),
        empty: document.getElementById('empty-gallery'),
        pagination: document.getElementById('pagination-container'),
        upload: document.getElementById('upload-photo'),
        overlay: document.getElementById('photo-overlay'),
        overlayImg: document.getElementById('overlay-img'),
        overlayVideo: document.getElementById('overlay-video'),
        zoomContainer: document.getElementById('zoom-container'),
        overlayIndex: document.getElementById('overlay-index'),
        prevPhoto: document.getElementById('prev-photo'),
        nextPhoto: document.getElementById('next-photo'),
        downloadOverlay: document.getElementById('download-overlay'),
        closeOverlay: document.getElementById('close-overlay'),
        backBtn: document.getElementById('back-to-event'),
        // Modal Elements
        modalConfirm: document.getElementById('modal-confirm'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalIcon: document.getElementById('modal-icon'),
        modalIconContainer: document.getElementById('modal-icon-container'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel'),
        // Tabs
        tabAll: document.getElementById('tab-all'),
        tabHighlights: document.getElementById('tab-highlights'),
        downloadAll: document.getElementById('download-all')
    };

    elements.backBtn.href = `/event-details.html?id=${eventId}`;

    let scheduleItems = [];
    let currentGalleryPhotos = []; // Cache das fotos carregadas na página atual
    let currentGalleryPage = 1;
    let currentPhotoIndex = 0;
    let isZoomed = false;
    let currentTab = 'all'; // 'all' or 'highlights'

    // Load initial data
    try {
        const [eventRes, schRes] = await Promise.all([
            api.getEvent(eventId),
            api.getSchedule(eventId)
        ]);

        if (eventRes.success) elements.title.textContent = `Galeria: ${eventRes.data.nome}`;
        scheduleItems = schRes.data.items || [];

        await loadPhotos(1);
    } catch (err) {
        console.error('Error info load:', err);
    }

    // Tab Listeners
    elements.tabAll.onclick = () => switchTab('all');
    elements.tabHighlights.onclick = () => switchTab('highlights');

    async function switchTab(tab) {
        if (currentTab === tab) return;
        currentTab = tab;

        // UI Update
        if (tab === 'all') {
            elements.tabAll.classList.add('border-primary', 'text-primary');
            elements.tabAll.classList.remove('border-transparent', 'text-secondary');
            elements.tabHighlights.classList.add('border-transparent', 'text-secondary');
            elements.tabHighlights.classList.remove('border-primary', 'text-primary');
            elements.pagination.classList.remove('hidden');
        } else {
            elements.tabHighlights.classList.add('border-primary', 'text-primary');
            elements.tabHighlights.classList.remove('border-transparent', 'text-secondary');
            elements.tabAll.classList.add('border-transparent', 'text-secondary');
            elements.tabAll.classList.remove('border-primary', 'text-primary');
            elements.pagination.classList.add('hidden'); // Highlights doesn't paginate (top 10)
        }

        await loadPhotos(1);
    }

    async function loadPhotos(page = 1) {
        currentGalleryPage = page;
        elements.loading.classList.remove('hidden');
        elements.grid.innerHTML = '';
        if (currentTab === 'all') elements.pagination.innerHTML = '';

        try {
            let res;
            if (currentTab === 'all') {
                res = await api.getGallery(eventId, page, 12);
            } else {
                res = await api.getTopPhotos(eventId);
            }

            elements.loading.classList.add('hidden');

            const photos = currentTab === 'all' ? (res.data.items || []) : (res.data || []);
            const paginationData = res.data || {};

            if (res.success && photos.length > 0) {
                elements.empty.classList.add('hidden');
                currentGalleryPhotos = photos; // Salva para navegação no overlay
                renderPhotos(photos);
                if (currentTab === 'all') renderPagination(paginationData);
            } else {
                elements.empty.classList.remove('hidden');
            }
        } catch (err) {
            elements.loading.classList.add('hidden');
            elements.empty.classList.remove('hidden');
        }
    }

    function renderPagination(data) {
        if (!data || data.totalPages <= 1) return;

        const totalPages = Number(data.totalPages);
        const currentPage = Number(data.currentPage);

        console.log(`Renderizando paginação: ${currentPage} de ${totalPages}`);

        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed text-secondary/30' : 'hover:bg-primary/5 hover:text-primary text-secondary'}`;
        prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
        if (currentPage > 1) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                loadPhotos(currentPage - 1);
            };
        }
        elements.pagination.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            const isActive = i === currentPage;
            btn.className = `w-10 h-10 rounded-full font-manrope font-bold text-xs transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/5 text-secondary'}`;
            btn.textContent = i;
            btn.onclick = (e) => {
                e.preventDefault();
                loadPhotos(i);
            };
            elements.pagination.appendChild(btn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = `w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed text-secondary/30' : 'hover:bg-primary/5 hover:text-primary text-secondary'}`;
        nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
        if (currentPage < totalPages) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                loadPhotos(currentPage + 1);
            };
        }
        elements.pagination.appendChild(nextBtn);
    }

    function renderPhotos(photos) {
        photos.forEach((photo, index) => {
            const div = document.createElement('div');
            div.className = `relative group break-inside-avoid animate-fade-in stagger-${(index % 5) + 1}`;

            // O backend retorna 'foto_url' (pode ser URL completa ou path relativo)
            let photoPath = photo.foto_url || photo.url_foto;
            if (photoPath && !photoPath.startsWith('http')) {
                photoPath = `/${photoPath.replace(/\\/g, '/')}`;
            }

            const isVideo = photo.media_type === 'VIDEO' || photoPath.match(/\.(mp4|mov|webm)$/i);

            div.innerHTML = `
                <div class="relative overflow-hidden rounded-[2rem] bg-surface-container-highest cursor-zoom-in mb-8">
                    ${isVideo 
                        ? `<video src="${photoPath}" class="w-full h-auto object-cover transition-transform duration-700"></video>
                           <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <span class="material-symbols-outlined text-white/50 text-5xl">play_circle</span>
                           </div>`
                        : `<img src="${photoPath}" class="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" alt="Capture">`
                    }
                    
                    ${photo.likes_count > 0 ? `
                        <div class="absolute top-4 left-4 bg-black/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 text-white border border-white/10">
                            <span class="material-symbols-outlined text-sm fill-1">favorite</span>
                            <span class="text-[10px] font-bold">${photo.likes_count}</span>
                        </div>
                    ` : ''}

                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onclick="handleDownloadPhoto('${photoPath}', 'evento-${eventId}-foto-${photo.id}.jpg')" class="w-10 h-10 bg-surface-container-lowest backdrop-blur-md rounded-full text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center" title="Baixar Foto">
                            <span class="material-symbols-outlined text-xl">download</span>
                        </button>
                        <button onclick="handleDeletePhoto(${photo.id})" class="w-10 h-10 bg-surface-container-lowest backdrop-blur-md rounded-full text-secondary hover:bg-error hover:text-white transition-all flex items-center justify-center" title="Excluir">
                            <span class="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>
                </div>
            `;

            // Clique na foto para abrir overlay
            const imgContainer = div.querySelector('div');
            imgContainer.addEventListener('click', (e) => {
                // Impede que o clique nos botões de download/delete abra o overlay
                if (e.target.closest('button')) return;
                openOverlay(index);
            });

            elements.grid.appendChild(div);
        });
    }

    function openOverlay(index) {
        currentPhotoIndex = index;
        isZoomed = false;
        const photo = currentGalleryPhotos[index];
        let photoPath = photo.foto_url || photo.url_foto;
        if (photoPath && !photoPath.startsWith('http')) {
            photoPath = `/${photoPath.replace(/\\/g, '/')}`;
        }

        const isVideo = photo.media_type === 'VIDEO' || photoPath.match(/\.(mp4|mov|webm)$/i);

        if (isVideo) {
            elements.overlayImg.classList.add('hidden');
            elements.overlayVideo.classList.remove('hidden');
            elements.overlayVideo.src = photoPath;
        } else {
            elements.overlayVideo.classList.add('hidden');
            elements.overlayVideo.src = '';
            elements.overlayImg.classList.remove('hidden');
            elements.overlayImg.src = photoPath;
        }

        elements.overlayIndex.textContent = `MÍDIA ${index + 1} / ${currentGalleryPhotos.length}`;

        // Reset Zoom
        elements.overlayImg.style.transform = 'scale(1)';
        elements.zoomContainer.classList.remove('cursor-zoom-out');
        elements.zoomContainer.classList.add('cursor-zoom-in');

        // Show Overlay
        elements.overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            elements.overlay.classList.remove('opacity-0');
            const target = isVideo ? elements.overlayVideo : elements.overlayImg;
            target.classList.add('scale-100', 'opacity-100');
            target.classList.remove('scale-90', 'opacity-0');
            if (isVideo) elements.overlayVideo.play().catch(e => console.log('Autoplay blocked', e));
        });
    }

    function updateOverlay(index) {
        if (index < 0 || index >= currentGalleryPhotos.length) return;

        // Fade out elements
        elements.overlayImg.style.opacity = '0';
        elements.overlayImg.style.transform = 'scale(0.95)';
        elements.overlayVideo.style.opacity = '0';
        elements.overlayVideo.style.transform = 'scale(0.95)';
        elements.overlayVideo.pause();

        setTimeout(() => {
            currentPhotoIndex = index;
            const photo = currentGalleryPhotos[index];
            let photoPath = photo.foto_url || photo.url_foto;
            if (photoPath && !photoPath.startsWith('http')) {
                photoPath = `/${photoPath.replace(/\\/g, '/')}`;
            }

            const isVideo = photo.media_type === 'VIDEO' || photoPath.match(/\.(mp4|mov|webm)$/i);

            if (isVideo) {
                elements.overlayImg.classList.add('hidden');
                elements.overlayVideo.classList.remove('hidden');
                elements.overlayVideo.src = photoPath;
                elements.overlayVideo.style.opacity = '1';
                elements.overlayVideo.style.transform = 'scale(1)';
                elements.overlayVideo.play().catch(e => console.log('Play blocked', e));
            } else {
                elements.overlayVideo.classList.add('hidden');
                elements.overlayVideo.src = '';
                elements.overlayImg.classList.remove('hidden');
                elements.overlayImg.src = photoPath;
                elements.overlayImg.style.opacity = '1';
                elements.overlayImg.style.transform = 'scale(1)';
            }

            elements.overlayIndex.textContent = `MÍDIA ${index + 1} / ${currentGalleryPhotos.length}`;
            isZoomed = false;
            elements.zoomContainer.classList.remove('cursor-zoom-out');
            elements.zoomContainer.classList.add('cursor-zoom-in');
        }, 250);
    }

    // Upload logic
    elements.upload.addEventListener('change', async (e) => {
        if (e.target.files.length === 0) return;

        const formData = new FormData();
        formData.append('foto', e.target.files[0]);
        formData.append('enviado_por', 'Administrador');

        try {
            elements.loading.classList.remove('hidden');
            const res = await api.uploadEventPhoto(eventId, formData);
            if (res.success) {
                showToast('Foto enviada com sucesso!');
                await loadPhotos(currentGalleryPage);
            }
        } catch (err) {
            showToast('Erro no upload: ' + err.message, 'error');
        } finally {
            elements.loading.classList.add('hidden');
        }
    });

    // Overlay logic
    elements.zoomContainer.addEventListener('click', (e) => {
        // Se clicar especificamente na IMAGEM, alterna o zoom
        if (e.target === elements.overlayImg) {
            e.stopPropagation();
            isZoomed = !isZoomed;
            if (isZoomed) {
                elements.overlayImg.style.transform = 'scale(1.5)';
                elements.zoomContainer.classList.remove('cursor-zoom-in');
                elements.zoomContainer.classList.add('cursor-zoom-out');
            } else {
                elements.overlayImg.style.transform = 'scale(1)';
                elements.zoomContainer.classList.remove('cursor-zoom-out');
                elements.zoomContainer.classList.add('cursor-zoom-in');
            }
            return;
        }

        // Se clicar fora da imagem (no fundo), fecha o overlay
        if (e.target === elements.zoomContainer) {
            elements.closeOverlay.click();
        }
    });

    elements.prevPhoto.onclick = (e) => {
        e.stopPropagation();
        if (currentPhotoIndex > 0) updateOverlay(currentPhotoIndex - 1);
    };

    elements.nextPhoto.onclick = (e) => {
        e.stopPropagation();
        if (currentPhotoIndex < currentGalleryPhotos.length - 1) updateOverlay(currentPhotoIndex + 1);
    };

    elements.downloadOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        const photo = currentGalleryPhotos[currentPhotoIndex];
        const url = photo.foto_url || photo.url_foto;
        const isVideo = photo.media_type === 'VIDEO' || url.match(/\.(mp4|mov|webm)$/i);
        handleDownloadPhoto(url, `memory-${eventId}-${isVideo ? 'video' : 'foto'}-${photo.id}${isVideo ? '.mp4' : '.jpg'}`);
    });

    elements.closeOverlay.addEventListener('click', () => {
        elements.overlay.classList.add('opacity-0');
        elements.overlayImg.classList.remove('scale-100', 'opacity-100');
        elements.overlayImg.classList.add('scale-90', 'opacity-0');
        elements.overlayVideo.classList.remove('scale-100', 'opacity-100');
        elements.overlayVideo.classList.add('scale-90', 'opacity-0');
        elements.overlayVideo.pause();
        
        setTimeout(() => {
            elements.overlay.classList.add('hidden');
            elements.overlayImg.src = '';
            elements.overlayVideo.src = '';
        }, 500);
    });

    // Teclado para navegação
    document.addEventListener('keydown', (e) => {
        if (elements.overlay.classList.contains('hidden')) return;

        if (e.key === 'ArrowRight') elements.nextPhoto.click();
        if (e.key === 'ArrowLeft') elements.prevPhoto.click();
        if (e.key === 'Escape') elements.closeOverlay.click();
    });

    // Generalized Confirmation Logic
    let currentConfirmCallback = null;

    const customConfirm = ({ title, message, icon, btnText, btnColor }) => {
        return new Promise((resolve) => {
            elements.modalTitle.textContent = title || 'Confirmar';
            elements.modalMessage.textContent = message || '';
            elements.modalIcon.textContent = icon || 'info';
            elements.confirmOk.textContent = btnText || 'Confirmar';

            // Re-apply classes for colors
            elements.confirmOk.className = `flex-1 py-4 text-white font-bold text-xs rounded-full shadow-lg active:scale-95 transition-all ${btnColor === 'red' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-primary hover:bg-primary-container shadow-primary/20'}`;
            elements.modalIconContainer.className = `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${btnColor === 'red' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`;

            elements.modalConfirm.classList.remove('hidden');
            setTimeout(() => elements.modalConfirm.classList.remove('opacity-0'), 10);

            const handleResult = (result) => {
                elements.modalConfirm.classList.add('opacity-0');
                setTimeout(() => {
                    elements.modalConfirm.classList.add('hidden');
                    resolve(result);
                }, 300);
            };

            elements.confirmCancel.onclick = () => handleResult(false);
            elements.confirmOk.onclick = () => handleResult(true);
        });
    };

    window.handleDeletePhoto = async (photoId) => {
        const confirmed = await customConfirm({
            title: 'Remover Foto',
            message: 'Tem certeza que deseja remover esta foto permanentemente? Esta ação não pode ser desfeita.',
            icon: 'delete_forever',
            btnText: 'Excluir Foto',
            btnColor: 'red'
        });

        if (confirmed) {
            try {
                const res = await api.deletePhoto(eventId, photoId);
                if (res.success) {
                    showToast('Foto removida com sucesso!');
                    await loadPhotos(currentGalleryPage);
                }
            } catch (err) {
                showToast('Erro: ' + err.message, 'error');
            }
        }
    };

    // Global Download functions
    window.handleDownloadPhoto = (url, filename) => {
        try {
            showToast('Iniciando download...', 'info');

            // Usamos o nosso proxy no backend para contornar o CORS do GCS
            const proxyUrl = `/api/gallery/download-proxy?url=${encodeURIComponent(url)}`;

            // Simplesmente redirecionamos para a rota que força o download
            window.location.href = proxyUrl;
        } catch (err) {
            console.error('Erro no download:', err);
            showToast('Erro ao iniciar download. Abra a foto e tente novamente.', 'error');
        }
    };

    elements.downloadAll.onclick = async () => {
        const confirmed = await customConfirm({
            title: 'Baixar Galeria',
            message: 'Deseja iniciar o download de todas as fotos desta página? O navegador pode solicitar permissão para múltiplos arquivos.',
            icon: 'download',
            btnText: 'Sim, Baixar Tudo',
            btnColor: 'primary'
        });

        if (!confirmed) return;

        const photos = elements.grid.querySelectorAll('button[title="Baixar Foto"]');
        if (photos.length === 0) {
            showToast('Nenhuma foto para baixar.', 'error');
            return;
        }

        showToast(`Iniciando download de ${photos.length} fotos...`, 'info');

        for (let i = 0; i < photos.length; i++) {
            const btn = photos[i];
            // Pequeno delay para não sobrecarregar o browser
            await new Promise(r => setTimeout(r, 300));
            btn.click();
        }
    };
});
