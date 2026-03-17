/* ============================================
   DINO EXPLORER - THEME-TOGGLE.JS
   Gerenciamento de tema claro/escuro reutilizável
   ============================================ */

// ============================================
// CONSTANTES
// ============================================

const THEME_KEY = 'dino-theme';
const DARK_CLASS = 'dark-theme';
const LIGHT_CLASS = 'light-theme';

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let themeToggle = document.getElementById('theme-toggle');
let themeMenuItems = document.querySelectorAll('[data-theme]');

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Aplica o tema especificado
 * @param {string} theme - 'dark' ou 'light'
 */
function applyTheme(theme) {
    // Validar tema
    if (theme !== 'dark' && theme !== 'light') {
        console.warn(`Tema inválido: ${theme}, usando light como fallback`);
        theme = 'light';
    }

    // Aplicar classes ao body
    if (theme === 'dark') {
        document.body.classList.add(DARK_CLASS);
        document.body.classList.remove(LIGHT_CLASS);
    } else {
        document.body.classList.add(LIGHT_CLASS);
        document.body.classList.remove(DARK_CLASS);
    }

    // Atualizar atributo data-theme para CSS
    document.documentElement.setAttribute('data-theme', theme);

    // Salvar preferência
    localStorage.setItem(THEME_KEY, theme);

    // Atualizar botão de toggle
    updateToggleButton(theme);

    // Atualizar itens de menu com data-theme
    updateThemeMenuItems(theme);

    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));

    console.log(`🎨 Tema alterado para: ${theme}`);
}

/**
 * Atualiza o ícone do botão de toggle
 * @param {string} theme - Tema atual
 */
function updateToggleButton(theme) {
    if (!themeToggle) {
        themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
    }

    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', `Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`);
    themeToggle.setAttribute('title', `Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`);
}

/**
 * Atualiza itens de menu com atributo data-theme
 * @param {string} theme - Tema atual
 */
function updateThemeMenuItems(theme) {
    themeMenuItems = document.querySelectorAll('[data-theme]');
    themeMenuItems.forEach(item => {
        const itemTheme = item.getAttribute('data-theme');
        if (itemTheme === theme) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

/**
 * Retorna o tema atual
 * @returns {string} 'dark' ou 'light'
 */
function getCurrentTheme() {
    return document.body.classList.contains(DARK_CLASS) ? 'dark' : 'light';
}

// ============================================
// DETECÇÃO DE PREFERÊNCIA DO SISTEMA
// ============================================

/**
 * Detecta preferência de tema do sistema
 * @returns {string} 'dark' ou 'light'
 */
function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Inicializa o tema baseado em preferências
 */
function initializeTheme() {
    // Verificar preferência salva
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedTheme) {
        // Usar tema salvo
        applyTheme(savedTheme);
    } else {
        // Usar preferência do sistema
        const systemTheme = getSystemPreference();
        applyTheme(systemTheme);
    }
}

// ============================================
// OBSERVAR MUDANÇAS NA PREFERÊNCIA DO SISTEMA
// ============================================

/**
 * Configura observador para mudanças na preferência do sistema
 */
function setupSystemPreferenceObserver() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e) => {
        // Só mudar automaticamente se não houver preferência salva
        if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    };

    // Adicionar listener compatível com navegadores antigos
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handler);
    }
}

// ============================================
// CSS VARIABLES PARA TEMAS
// ============================================

/**
 * Injeta variáveis CSS para temas
 */
function injectThemeVariables() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --text-primary: #333333;
            --text-secondary: #666666;
            --border-color: #dddddd;
            --primary-color: #0066cc;
            --primary-hover: #0052a3;
            --card-bg: #ffffff;
            --card-shadow: 0 2px 10px rgba(0,0,0,0.1);
            --hover-bg: #f0f0f0;
            --success-color: #4CAF50;
            --warning-color: #ff9800;
            --error-color: #f44336;
            transition: background-color 0.3s, color 0.3s, border-color 0.3s;
        }

        [data-theme="dark"], body.dark-theme {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --border-color: #404040;
            --primary-color: #4d94ff;
            --primary-hover: #0066cc;
            --card-bg: #2d2d2d;
            --card-shadow: 0 2px 10px rgba(0,0,0,0.3);
            --hover-bg: #3d3d3d;
            --success-color: #81c784;
            --warning-color: #ffb74d;
            --error-color: #e57373;
        }

        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
        }

        /* Animações de transição */
        .theme-transition {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// ATALHO DE TECLADO
// ============================================

/**
 * Configura atalho de teclado para alternar tema
 */
function setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + T para alternar tema
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Ctrl/Cmd + Shift + D para tema escuro
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            applyTheme('dark');
        }
        
        // Ctrl/Cmd + Shift + L para tema claro
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            applyTheme('light');
        }
    });
}

// ============================================
// PERSISTÊNCIA DE PREFERÊNCIA
// ============================================

/**
 * Salva preferência de tema explicitamente
 * @param {string} theme - 'dark' ou 'light'
 */
function saveThemePreference(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

/**
 * Limpa preferência salva e volta à preferência do sistema
 */
function resetToSystemPreference() {
    localStorage.removeItem(THEME_KEY);
    const systemTheme = getSystemPreference();
    applyTheme(systemTheme);
}

// ============================================
// ESTATÍSTICAS DE USO
// ============================================

/**
 * Rastreia mudanças de tema para analytics
 * @param {string} theme - Novo tema
 */
function trackThemeChange(theme) {
    console.log('📊 Tema alterado para:', theme);
    
    // Armazenar estatísticas locais
    try {
        let stats = JSON.parse(localStorage.getItem('themeStats') || '{"changes":0,"lastChange":null}');
        stats.changes++;
        stats.lastChange = new Date().toISOString();
        stats[`${theme}Count`] = (stats[`${theme}Count`] || 0) + 1;
        localStorage.setItem('themeStats', JSON.stringify(stats));
    } catch (error) {
        console.warn('Não foi possível salvar estatísticas de tema:', error);
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Injetar variáveis CSS
    injectThemeVariables();

    // Inicializar tema
    initializeTheme();

    // Configurar botão de toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Configurar itens de menu com data-theme
    document.querySelectorAll('[data-theme]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const theme = item.getAttribute('data-theme');
            if (theme) {
                applyTheme(theme);
            }
        });
    });

    // Configurar observador de preferência do sistema
    setupSystemPreferenceObserver();

    // Configurar atalho de teclado
    setupKeyboardShortcut();

    // Adicionar classe de transição após carregar
    setTimeout(() => {
        document.body.classList.add('theme-transition');
    }, 100);

    console.log('🎨 Theme toggle inicializado!');
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.themeUtils = {
    applyTheme,
    toggleTheme,
    getCurrentTheme,
    resetToSystemPreference,
    saveThemePreference
};

window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;
window.resetToSystemPreference = resetToSystemPreference;

// ============================================
// FIM DO ARQUIVO
// ============================================