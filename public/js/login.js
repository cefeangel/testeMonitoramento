document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Limpa erro anterior
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        // Feedback de carregamento
        submitBtn.disabled = true;
        submitBtn.textContent = 'Carregando...';

        try {
            const result = await api.login(email, senha);
            
            if (result.success) {
                // Redireciona para o dashboard
                // O token já foi setado no cookie HttpOnly pelo backend
                window.location.href = '/dashboard.html';
            } else {
                throw new Error(result.message || 'Credenciais inválidas');
            }
        } catch (error) {
            errorMessage.textContent = error.message === 'Failed to fetch' 
                ? 'Servidor offline. Verifique sua conexão.' 
                : error.message;
            errorMessage.classList.remove('hidden');
            
            // Animação de erro (shake simples)
            loginForm.parentElement.classList.add('animate-shake');
            setTimeout(() => loginForm.parentElement.classList.remove('animate-shake'), 400);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar no Sistema';
        }
    });

    // Remove erro ao recomeçar a digitar
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            errorMessage.classList.add('hidden');
        });
    });
});
