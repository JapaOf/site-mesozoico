/* ============================================
   DINO EXPLORER - MAIN.JS
   Funcionalidade principal do site
   ============================================ */

// ============================================
// TEMA - DARK/LIGHT TOGGLE
// ============================================

const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Detectar preferência do sistema
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

// Aplicar tema salvo
applyTheme(savedTheme);

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        if (themeToggle) themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

// ============================================
// MENU MOBILE
// ============================================

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (menuToggle) menuToggle.innerHTML = '☰';
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '☰';
        }
    });
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

window.addEventListener('scroll', () => {
    const header = document.querySelector('.navbar');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('navbar-scrolled');
        } else {
            header.classList.remove('navbar-scrolled');
        }
    }
});

// ============================================
// NAVEGAÇÃO E ROUTING
// ============================================

function navigateTo(path) {
    const routes = {
        'species': 'species-list.html', // Corrigido: removido 'pages/'
        'timeline': 'timeline.html',
        'taxonomia': 'taxonomia.html',
        'birds': 'birds-dinosaurs.html',
        'hard-mode': 'hard-mode.html',
        'comparison': 'species-comparison.html',
        'index': 'index.html'
    };

    if (routes[path]) {
        window.location.href = routes[path];
    } else {
        console.warn(`Rota desconhecida: ${path}`);
    }
}

// ============================================
// FILTRAR POR PERÍODO (com navegação)
// ============================================

function filterByPeriod(period) {
    // Navegar para timeline e passar período como parâmetro
    window.location.href = `timeline.html?period=${period}`;
}

// ============================================
// CARREGAR DADOS JSON
// ============================================

async function loadData(file) {
    try {
        // Tentar caminho na raiz primeiro, depois em /data/
        let response = await fetch(`${file}.json`).catch(() => null);
        if (!response || !response.ok) {
            response = await fetch(`data/${file}.json`);
        }
        
        if (!response.ok) throw new Error(`Erro ao carregar ${file}.json`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return null;
    }
}

// Carregar dados na inicialização (opcional)
(async () => {
    // Carregar apenas em páginas que precisam
    if (document.querySelector('[data-species-list]')) {
        const species = await loadData('species');
        console.log('Espécies carregadas:', species);
    }
    
    if (document.querySelector('[data-timeline]')) {
        const periods = await loadData('periods');
        console.log('Períodos carregados:', periods);
    }
    
    if (document.querySelector('[data-taxonomy]')) {
        const clados = await loadData('clados');
        console.log('Clados carregados:', clados);
    }
})();

// ============================================
// SCROLL SUAVE
// ============================================

document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Atualizar URL sem recarregar
            history.pushState(null, null, targetId);
        }
    });
});

// ============================================
// LAZY LOADING DE IMAGENS
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    img.src = src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// ANALYTICS SIMPLES
// ============================================

function trackEvent(eventName, eventData = {}) {
    // Adicionar timestamp e URL
    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    console.log('📊 Evento:', event);
    
    // Armazenar eventos localmente (opcional)
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push(event);
    
    // Manter apenas últimos 50 eventos
    if (events.length > 50) events.shift();
    localStorage.setItem('analytics_events', JSON.stringify(events));
    
    // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventData);
    }
}

// Rastrear cliques em botões e links importantes
document.querySelectorAll('.btn, .nav-link, [data-track]').forEach(element => {
    element.addEventListener('click', (e) => {
        const trackData = {
            element: e.target.textContent?.trim() || 'unknown',
            href: e.target.href || 'none',
            id: e.target.id || 'none',
            class: e.target.className
        };
        
        trackEvent('click', trackData);
    });
});

// Rastrear tempo na página
let pageLoadTime = Date.now();
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - pageLoadTime) / 1000);
    trackEvent('page_exit', {
        timeSpent: `${timeSpent}s`,
        page: window.location.pathname
    });
});

// ============================================
// SCROLL TO TOP BUTTON
// ============================================

function createScrollToTopButton() {
    const btn = document.createElement('button');
    btn.id = 'scroll-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color, #0066cc);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 24px;
        display: none;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.style.display = 'block';
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        } else {
            btn.style.opacity = '0';
            btn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (window.scrollY <= 500) {
                    btn.style.display = 'none';
                }
            }, 300);
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        trackEvent('scroll_to_top');
    });
}

// ============================================
// DETECTAR DISPOSITIVO
// ============================================

function detectDevice() {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android|Tablet/i.test(ua);
    
    if (isMobile) {
        document.body.classList.add('is-mobile');
    }
    
    if (isTablet) {
        document.body.classList.add('is-tablet');
    }
    
    return { isMobile, isTablet };
}

// ============================================
// MOSTRAR MODAL
// ============================================

function showModal(content, title = 'Informação') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.style.display = 'block';
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// ============================================
// COPIAR TEXTO PARA ÁREA DE TRANSFERÊNCIA
// ============================================

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showModal('Texto copiado para a área de transferência!', 'Sucesso');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showModal('Texto copiado para a área de transferência!', 'Sucesso');
    } catch (err) {
        console.error('Erro ao copiar:', err);
        alert('Não foi possível copiar o texto');
    }
    
    document.body.removeChild(textarea);
}

// ============================================
// COMPARTILHAR PÁGINA
// ============================================

function sharePage() {
    const shareData = {
        title: document.title,
        text: document.querySelector('meta[name="description"]')?.content || 'Dino Explorer - Explore a Era Mesozoica',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        copyToClipboard(window.location.href);
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦖 Dino Explorer inicializado!');
    
    // Detectar dispositivo
    detectDevice();
    
    // Criar botão scroll to top (se não existir)
    if (!document.getElementById('scroll-to-top')) {
        createScrollToTopButton();
    }
    
    // Adicionar classe à página atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.body.classList.add(`page-${currentPage.replace('.html', '')}`);
    
    // Destacar link ativo no menu
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
    
    // Inicializar tooltips
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = el.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = el.getBoundingClientRect();
            tooltip.style.top = rect.top - 30 + 'px';
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            
            el.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
        });
    });
    
    // Rastrear visualização da página
    trackEvent('page_view', {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer || 'direct'
    });
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.navigateTo = navigateTo;
window.filterByPeriod = filterByPeriod;
window.trackEvent = trackEvent;
window.showModal = showModal;
window.copyToClipboard = copyToClipboard;
window.sharePage = sharePage;
window.loadData = loadData;

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Erro global:', e.error);
    trackEvent('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
    });
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada:', e.reason);
    trackEvent('unhandled_rejection', {
        reason: e.reason?.toString() || 'unknown'
    });
});