document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('settings-form');
    const nomeInput = document.getElementById('admin-nome');
    const emailInput = document.getElementById('admin-email');
    const senhaInput = document.getElementById('admin-senha');
    const initialsDisplay = document.getElementById('initials-display');
    const togglePw = document.getElementById('toggle-pw');
    const saveBtn = document.getElementById('save-btn');

    // Toggle Password Visibility
    togglePw.addEventListener('click', () => {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        togglePw.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Load initial data
    try {
        const res = await api.getProfile();
        if (res.success) {
            nomeInput.value = res.data.nome || '';
            emailInput.value = res.data.email || '';
            initialsDisplay.textContent = (res.data.nome || 'A').charAt(0).toUpperCase();
        }
    } catch (err) {
        console.error('Falha ao carregar perfil:', err);
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const originalText = saveBtn.textContent;
        const profileData = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim()
        };

        if (senhaInput.value.trim() !== '') {
            if (senhaInput.value.length < 6) {
                showToast('A senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }
            profileData.senha = senhaInput.value;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Salvando...';

            const res = await api.updateProfile(profileData);
            if (res.success) {
                showToast('Perfil atualizado com sucesso!');
                initialsDisplay.textContent = profileData.nome.charAt(0).toUpperCase();
                senhaInput.value = ''; // Clear password field
            }
        } catch (err) {
            showToast(err.message || 'Erro ao atualizar perfil', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    });
});
