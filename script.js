// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for Smooth Reveals
const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, revealOptions);

// Initialize Reveal Animations
document.querySelectorAll('.feature-card, .stat-item, .hero h1, .hero p, .hero-btns').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    revealObserver.observe(el);
});

// Counter Animation Logic
const startCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix');
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16);
    let current = 0;

    const update = () => {
        current += increment;
        if (current < target) {
            const displaySuffix = suffix !== null ? suffix : (target === 99 ? '%' : '+');
            el.innerText = Math.ceil(current) + displaySuffix;
            requestAnimationFrame(update);
        } else {
            const displaySuffix = suffix !== null ? suffix : (target === 99 ? '%' : '+');
            el.innerText = target + displaySuffix;
        }
    };
    update();
};

// Update Intersection Observer to handle counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(counter => {
    counterObserver.observe(counter);
});

// Add CSS for active state via JS to keep it clean
const style = document.createElement('style');
style.textContent = `
    .feature-card.active, .stat-item.active, .hero h1.active, .hero p.active, .hero-btns.active {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Button Click Feedback
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
    });
    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'translateY(-2px) scale(1)';
    });
});

// Smart Dashboard routing: prefer Dashboard once ever accessed or bot invited
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    const dashLinks = Array.from(document.querySelectorAll('a')).filter(a => a.textContent.trim().toLowerCase() === 'dashboard');
    dashLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const hasDash = (() => { try { return localStorage.getItem('has_dashboard') === '1'; } catch { return false; } })();
            const postAfterInvite = (() => { try { return localStorage.getItem('post_after_invite') === 'dashboard'; } catch { return false; } })();
            const goDashboard = () => { window.location.href = 'dashboard.html'; };
            const goInvite = () => { window.location.href = 'dashboard'; };
            if (postAfterInvite) { try { localStorage.removeItem('post_after_invite'); } catch {} goDashboard(); return; }
            let timedOut = false;
            const config = window.FRONTEND_CONFIG || (typeof CONFIG !== 'undefined' ? CONFIG : null);
            const backendUrl = config ? config.BACKEND_URL : 'https://backend-nine-tau-82.vercel.app';
            const to = setTimeout(() => { timedOut = true; hasDash ? goDashboard() : goInvite(); }, 3500);
            try {
                const res = await fetch(`${backendUrl}/api/bot/guilds/list`, { cache: 'no-store' });
                clearTimeout(to);
                if (!res.ok) return hasDash ? goDashboard() : goInvite();
                const data = await res.json().catch(() => []);
                const hasServers = Array.isArray(data) && data.length > 0;
                if (hasServers) return goDashboard();
                if (hasDash) return goDashboard();
                return goInvite();
            } catch {
                clearTimeout(to);
                return hasDash ? goDashboard() : goInvite();
            }
        });
    });
});

window.addEventListener('load', updateAuthUI);

function updateAuthUI() {
    console.log('Updating Auth UI...');
    const navBtns = document.getElementById('nav-auth-btns') || document.querySelector('.nav-btns');
    if (!navBtns) {
        console.error('Auth button container not found!');
        return;
    }
    
    const userStr = localStorage.getItem('agency_chat_user');
    const config = window.FRONTEND_CONFIG || (typeof CONFIG !== 'undefined' ? CONFIG : null);
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (!user || typeof user !== 'object') throw new Error('Invalid user data');
            
            console.log('User found:', user.name || 'Unknown');
            if (navBtns.querySelector('.user-auth-pill')) return;

            const avatar = user.avatar || 'logo.png';
            const name = user.name || 'User';

            navBtns.innerHTML = `
                <div class="user-auth-pill">
                    <div class="user-info-group">
                        <img src="${avatar}" class="user-avatar" alt="Avatar">
                        <span class="user-name">${name}</span>
                    </div>
                    <button onclick="logout()" class="logout-pill-btn">
                        <i class="fas fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </div>
            `;
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('agency_chat_user');
        }
    } else {
        console.log('No user found, showing login button');
        if (navBtns.querySelector('.login-btn')) return;

        if (config && config.BACKEND_URL) {
            console.log('Using config backend URL:', config.BACKEND_URL);
            navBtns.innerHTML = `
                <a href="#" onclick="window.location.href = '${config.BACKEND_URL}/api/auth/discord?state=dashboard'" class="btn btn-primary login-btn">Login</a>
            `;
        } else {
            console.log('Using fallback backend URL');
            navBtns.innerHTML = `
                <a href="https://backend-nine-tau-82.vercel.app/api/auth/discord?state=dashboard" class="btn btn-primary login-btn">Login</a>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem('agency_chat_user');
    window.location.reload();
}
