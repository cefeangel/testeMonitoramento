document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const token = urlParams.get('token');

    if (!eventId || !token) {
        window.location.href = '/';
        return;
    }

    const elements = {
        carousel: document.getElementById('gallery-carousel'),
        info: document.getElementById('gallery-info'),
        btnBack: document.getElementById('btn-back')
    };

    elements.btnBack.href = `event-guest.html?eventId=${eventId}&token=${token}`;

    try {
        const res = await api.getPublicGallery(eventId, token);
        if (res.success) {
            renderGallery(res.data);
        }
    } catch (err) {
        console.error('Error loading gallery:', err);
        showToast('Erro ao carregar a galeria.', 'error');
    }

    function renderGallery(photos) {
        if (!photos || photos.length === 0) {
            elements.info.textContent = 'Sem fotos';
            elements.carousel.innerHTML = '<div class="w-full text-center py-20 text-secondary/40 italic">Nenhuma foto enviada ainda.</div>';
            return;
        }

        elements.info.textContent = `${photos.length} Fotos Registradas`;
        elements.carousel.innerHTML = '';
        const visitorId = window.getVisitorId();

        photos.forEach((p, idx) => {
            const div = document.createElement('div');
            // Adding more padding/margin to prevent snapping issues with scale
            div.className = "snap-center shrink-0 w-[70vw] aspect-[3/4] bg-surface-container-highest rounded-[3rem] overflow-hidden relative gallery-item active:scale-95 transition-all cursor-pointer mx-4 group";
            div.dataset.index = idx;
            div.dataset.photoId = p.id;

            // Interaction logic: Double Tap to Like
            let lastTap = 0;
            div.addEventListener('click', (e) => {
                // Check if it's the heart button or the image
                if (e.target.closest('.btn-like')) return;

                const now = new Date().getTime();
                if (now - lastTap < 300) {
                    // Double tap detected
                    handleLike(p.id, div);
                } else {
                    // Single tap - view photo
                    window.viewPhoto(p.foto_url);
                }
                lastTap = now;
            });

            const isVideo = p.media_type === 'VIDEO' || p.foto_url.match(/\.(mp4|mov|webm)$/i);

            div.innerHTML = `
                ${isVideo 
                    ? `<video src="${p.foto_url}" class="w-full h-full object-cover" muted loop playsinline></video>
                       <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <span class="material-symbols-outlined text-white/50 text-6xl">play_circle</span>
                       </div>`
                    : `<img src="${p.foto_url}" class="w-full h-full object-cover">`
                }
                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-max">
                    <button class="btn-like flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all" onclick="event.stopPropagation(); window.handleLikeClick(${p.id}, this.closest('.gallery-item'))">
                        <span class="material-symbols-outlined text-xl ${p.likes_count > 0 ? 'fill-1 text-red-500' : ''}" style="font-variation-settings: 'FILL' ${p.likes_count > 0 ? 1 : 0}">favorite</span>
                        <span class="text-xs font-bold likes-count">${p.likes_count || 0}</span>
                    </button>
                </div>
            `;

            elements.carousel.appendChild(div);
        });

        setupObserver();
    }

    async function handleLike(photoId, cardEl) {
        const heartIcon = cardEl.querySelector('.material-symbols-outlined');
        const countEl = cardEl.querySelector('.likes-count');
        const visitorId = window.getVisitorId();

        // Visual feedback (Instant)
        heartIcon.style.transform = 'scale(1.5)';
        setTimeout(() => heartIcon.style.transform = 'scale(1)', 200);

        try {
            const res = await api.likePhoto(eventId, photoId, token, visitorId);
            if (res.success) {
                const { liked, likes_count } = res.data;
                heartIcon.style.fontVariationSettings = `'FILL' ${liked ? 1 : 0}`;
                if (liked) {
                    heartIcon.classList.add('text-red-500');
                    heartIcon.classList.add('fill-1');
                } else {
                    heartIcon.classList.remove('text-red-500');
                    heartIcon.classList.remove('fill-1');
                }
                countEl.textContent = likes_count;
            }
        } catch (err) {
            console.error('Like error:', err);
            showToast('Erro ao processar curtida', 'error');
        }
    }

    // Global handler for the button
    window.handleLikeClick = (id, el) => handleLike(id, el);

    function setupObserver() {
        const options = {
            root: elements.carousel,
            threshold: 0.6 // Focus when more than 60% visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('focused');
                } else {
                    entry.target.classList.remove('focused');
                }
            });
        }, options);

        document.querySelectorAll('.gallery-item').forEach(item => observer.observe(item));

        // Initial snap focus
        setTimeout(() => {
            elements.carousel.scrollLeft = 0;
        }, 100);
    }

    // Reuse Preview Logic
    window.viewPhoto = (url) => {
        const modal = document.getElementById('modal-photo-view');
        const img = document.getElementById('full-photo-img');
        const video = document.getElementById('full-video-player');
        
        const isVideo = url.match(/\.(mp4|mov|webm)$/i);

        if (isVideo) {
            img.classList.add('hidden');
            video.classList.remove('hidden');
            video.src = url;
            video.play().catch(e => console.log('Video play interrupted', e));
        } else {
            video.classList.add('hidden');
            video.pause();
            video.src = '';
            img.classList.remove('hidden');
            img.src = url;
        }

        document.body.style.overflow = 'hidden';
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const target = isVideo ? video : img;
            target.classList.remove('scale-95');
        }, 10);
    };

    document.getElementById('close-photo-view').addEventListener('click', () => {
        const modal = document.getElementById('modal-photo-view');
        const img = document.getElementById('full-photo-img');
        const video = document.getElementById('full-video-player');

        modal.classList.add('opacity-0');
        img.classList.add('scale-95');
        video.classList.add('scale-95');
        video.pause();

        setTimeout(() => {
            modal.classList.add('hidden');
            img.src = '';
            video.src = '';
            document.body.style.overflow = '';
        }, 300);
    });

    // Fechar ao clicar no fundo
    document.getElementById('modal-photo-view').addEventListener('click', (e) => {
        const modal = document.getElementById('modal-photo-view');
        if (e.target === modal) {
            document.getElementById('close-photo-view').click();
        }
    });

});
