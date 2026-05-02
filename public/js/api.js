const API_BASE_URL = '/api';

/**
 * Módulo de comunicação com a API
 */
const api = {
    /**
     * Realiza uma requisição fetch com tratamento centralizado
     */
    async request(url, options = {}) {
        const finalOptions = {
            ...options,
            headers: {
                ...options.headers,
            }
        };

        if (!(options.body instanceof FormData)) {
            if (!finalOptions.headers['Content-Type']) {
                finalOptions.headers['Content-Type'] = 'application/json';
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, finalOptions);
            
            // Se a resposta estiver vazia (204 No Content), retornamos sucesso básico
            if (response.status === 204) return { success: true };

            const data = await response.json();

            if (!response.ok) {
                // Erro 401 indica que o cookie expirou ou não é válido
                if (response.status === 401 && !url.includes('/auth/login')) {
                    window.location.href = '/login.html';
                }
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Autenticação
     */
    async login(email, senha) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha }),
        });
    },

    /**
     * Eventos
     */
    async getEvents() {
        return this.request('/events');
    },

    async getEvent(id) {
        return this.request(`/events/${id}`);
    },

    async updateEvent(id, data) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async getSchedule(eventId) {
        return this.request(`/events/${eventId}/schedule`);
    },

    async uploadEventCover(eventId, formData) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/cover`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro no upload da capa');
        return data;
    },

    async postSchedule(eventId, data) {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return this.request(`/events/${eventId}/schedule`, {
            method: 'POST',
            body: body,
        });
    },

    async putSchedule(eventId, schId, data) {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return this.request(`/events/${eventId}/schedule/${schId}`, {
            method: 'PUT',
            body: body,
        });
    },

    async deleteSchedule(eventId, schId) {
        return this.request(`/events/${eventId}/schedule/${schId}`, {
            method: 'DELETE',
        });
    },

    async getGuests(eventId, page = 1, limit = 10, search = '') {
        const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
        return this.request(`/events/${eventId}/guests?page=${page}&limit=${limit}${searchParam}`);
    },

    async getGuest(eventId, guestId) {
        return this.request(`/events/${eventId}/guests/${guestId}`);
    },

    async getGlobalGuests(page = 1, limit = 10) {
        return this.request(`/guests?page=${page}&limit=${limit}`);
    },

    async getReport() {
        return this.request('/events/report');
    },

    async createGuest(eventId, guestData) {
        return this.request(`/events/${eventId}/guests`, {
            method: 'POST',
            body: JSON.stringify(guestData),
        });
    },

    async updateGuest(eventId, guestId, guestData) {
        return this.request(`/events/${eventId}/guests/${guestId}`, {
            method: 'PUT',
            body: JSON.stringify(guestData),
        });
    },

    async deleteGuest(eventId, guestId) {
        return this.request(`/events/${eventId}/guests/${guestId}`, {
            method: 'DELETE',
        });
    },

    async getCompanions(eventId, guestId) {
        return this.request(`/events/${eventId}/guests/${guestId}/companions`);
    },

    async postCompanion(eventId, guestId, data) {
        return this.request(`/events/${eventId}/guests/${guestId}/companions`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async deleteCompanion(eventId, guestId, compId) {
        return this.request(`/events/${eventId}/guests/${guestId}/companions/${compId}`, {
            method: 'DELETE',
        });
    },

    async getConfirmations(eventId) {
        return this.request(`/events/${eventId}/confirmations/all`);
    },

    async confirmGuest(eventId, guestId, status = 'CONFIRMADO') {
        return this.request(`/events/${eventId}/guests/${guestId}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        });
    },

    async unconfirmGuest(eventId, guestId) {
        return this.request(`/events/${eventId}/guests/${guestId}/confirm`, {
            method: 'DELETE',
        });
    },

    /**
     * QR Code
     */
    async generateQRCode(eventId, expiresAt) {
        return this.request(`/events/${eventId}/qrcode`, {
            method: 'POST',
            body: JSON.stringify({ expires_at: expiresAt }),
        });
    },

    async getQRCode(eventId) {
        return this.request(`/events/${eventId}/qrcode`);
    },

    async downloadQRCode(eventId) {
        // Para download, usamos fetch direto ou window.location se for blob
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/qrcode/download`, {
            headers: {
                // Cookies são enviados automaticamente
            }
        });
        if (!response.ok) throw new Error('Erro ao baixar QR Code');
        return await response.blob();
    },

    /**
     * Galeria
     */
    async getGallery(eventId, page = 1, limit = 12) {
        return this.request(`/events/${eventId}/gallery?page=${page}&limit=${limit}`);
    },

    async uploadEventPhoto(eventId, formData) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/gallery/photos`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro no upload');
        return data;
    },

    // Legado, mantido para compatibilidade se necessário
    async uploadPhoto(eventId, scheduleId, formData) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/schedule/${scheduleId}/photos`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro no upload');
        return data;
    },

    async deletePhoto(eventId, photoId) {
        return this.request(`/events/${eventId}/photos/${photoId}`, {
            method: 'DELETE',
        });
    },

    async getProfile() {
        return this.request('/auth/profile');
    },

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    /**
     * Genéricos para CRUD futuro
     */
    async post(url, body) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async put(url, body) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    async delete(url) {
        return this.request(url, {
            method: 'DELETE',
        });
    },

    /**
     * Public Guest API
     */
    async getPublicEvent(eventId, token) {
        return this.request(`/public/events/${eventId}?token=${token}`);
    },

    async getPublicGallery(eventId, token) {
        return this.request(`/public/events/${eventId}/gallery?token=${token}`);
    },

    async uploadPublicPhoto(eventId, token, formData) {
        // Envia para o novo path padronizado
        const response = await fetch(`${API_BASE_URL}/public/events/${eventId}/gallery/upload?token=${token}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro no upload');
        return data;
    },

    /**
     * Interação Social (Curtidas - Pública)
     */
    async likePhoto(eventId, photoId, token, visitorId) {
        return this.request(`/public/events/${eventId}/photos/${photoId}/like?token=${token}`, {
            method: 'POST',
            body: JSON.stringify({ visitor_id: visitorId })
        });
    },

    /**
     * Admin Destaques
     */
    async getTopPhotos(eventId) {
        return this.request(`/events/${eventId}/gallery/top`);
    }
};

