/**
 * Shared logic for all authenticated pages
 */
document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Initialization
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Toggle Dark Mode (if button exists)
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    const userAvatar = document.getElementById('user-avatar');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear token cookie
            document.cookie = 'token=; Max-Age=0; path=/;';
            window.location.href = '/login.html';
        });
    }

    // Dynamic scale and fade effects on entrance
    document.querySelectorAll('.animate-fade-in').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 100);
    });

    // Handle session check (ping)
    // Optional: api.getEvents() or similar to verify cookie
});

/**
 * Toast System - Global
 */
window.showToast = function(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container shadow-[0px_20px_60px_rgba(173,43,12,0.15)]';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type} animate-in`;
    
    const icon = type === 'success' ? 'check_circle' : 'error';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div class="text-sm font-bold flex-grow font-manrope">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};

/**
 * Visitor ID - Persistent for Likes
 */
window.getVisitorId = function() {
    let vid = localStorage.getItem('visitor_id');
    if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('visitor_id', vid);
    }
    return vid;
};

