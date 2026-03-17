/* ============================================
   DINO EXPLORER - SPECIES.JS
   Funcionalidade da página de detalhe da espécie
   ============================================ */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let allSpecies = [];
let currentSpecies = null;
let currentImageIndex = 0;
let galleryImages = [];

// Elementos DOM
const urlParams = new URLSearchParams(window.location.search);
const speciesId = urlParams.get('id') || 'trex';

// ============================================
// CARREGAR DADOS
// ============================================

async function loadSpeciesData() {
    try {
        // Tentar carregar da raiz primeiro, depois do diretório data
        let response = await fetch('species.json').catch(() => null);
        if (!response || !response.ok) {
            response = await fetch('data/species.json');
        }
        
        if (!response.ok) throw new Error('Erro ao carregar species.json');
        
        const data = await response.json();
        allSpecies = data.species || data;
        
        // Buscar espécie atual
        currentSpecies = allSpecies.find(s => s.id === speciesId);
        if (!currentSpecies) {
            console.warn(`⚠️ Espécie ${speciesId} não encontrada, usando primeira`);
            currentSpecies = allSpecies[0];
        }

        console.log('✅ Espécie carregada:', currentSpecies.name);
        
        // Renderizar tudo
        renderSpecies();
        setupGallery();
        trackPageView();
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showError('Erro ao carregar dados da espécie');
    }
}

function showError(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h2>Erro ao carregar</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Tentar novamente</button>
                <a href="species-list.html" class="btn btn-outline">Voltar para lista</a>
            </div>
        `;
    }
}

// ============================================
// RENDERIZAR ESPÉCIE
// ============================================

function renderSpecies() {
    if (!currentSpecies) return;

    // Atualizar título da página
    document.title = `${currentSpecies.name} - Dino Explorer`;

    // Hero Section
    document.getElementById('species-common-name').textContent = currentSpecies.name;
    document.getElementById('species-scientific-name').textContent = currentSpecies.scientificName || '';
    document.getElementById('species-name-breadcrumb').textContent = currentSpecies.name;

    // Quick Info
    document.getElementById('species-period').textContent = formatPeriod(currentSpecies.period);
    document.getElementById('species-size').textContent = currentSpecies.size?.length || '-';
    document.getElementById('species-location').textContent = currentSpecies.location || '-';

    // Escala
    document.getElementById('species-length').textContent = currentSpecies.size?.length || '-';
    document.getElementById('species-height').textContent = currentSpecies.size?.height || currentSpecies.size?.length || '-';
    document.getElementById('species-weight').textContent = currentSpecies.size?.weight || '-';
    document.getElementById('dinosaur-height').textContent = currentSpecies.size?.height || currentSpecies.size?.length || '-';

    // Ficha Técnica
    renderTechnicalSheet();

    // Paleoarte
    renderPaleoartComparison();

    // Esqueleto vs Reconstrução
    renderSkeletonReconstruction();

    // Controvérsias
    renderControversies();

    // Referências
    renderReferences();

    // Navegação
    renderNavigation();

    // Animações
    if (window.AOS) {
        AOS.refresh();
    }
}

// ============================================
// FICHA TÉCNICA
// ============================================

function renderTechnicalSheet() {
    // Informações Gerais
    setElementText('detail-scientific-name', currentSpecies.scientificName);
    setElementText('detail-period', formatPeriod(currentSpecies.period));
    setElementText('detail-epoch', currentSpecies.epoch);
    setElementText('detail-age', currentSpecies.dateRange);

    // Taxonomia
    setElementText('detail-clade', currentSpecies.clade);
    setElementText('detail-family', currentSpecies.family);

    // Morfometria
    setElementText('detail-length', currentSpecies.size?.length);
    setElementText('detail-height', currentSpecies.size?.height || currentSpecies.size?.length);
    setElementText('detail-weight', currentSpecies.size?.weight);

    // Localização
    setElementText('detail-location', currentSpecies.location);
    setElementText('detail-formation', currentSpecies.formation);
    setElementText('detail-rock-type', currentSpecies.rockType);

    // Descoberta
    setElementText('detail-discovery-year', currentSpecies.discoveryYear);
    setElementText('detail-discoverer', currentSpecies.discoverer);
    setElementText('detail-fossil-type', currentSpecies.fossilType);
    setElementText('detail-holotype', currentSpecies.holotype);

    // Ecologia
    setElementText('detail-diet', currentSpecies.diet);
    setElementText('detail-locomotion', currentSpecies.locomotion);
    setElementText('detail-habitat', currentSpecies.habitat);
    setElementText('detail-behavior', currentSpecies.behavior);

    // Paleoecologia
    setElementText('paleoecology-climate', currentSpecies.climate);
    setElementText('paleoecology-continents', currentSpecies.continents);
    setElementText('paleoecology-vegetation', currentSpecies.vegetation);
    setElementText('paleoecology-fauna', currentSpecies.fauna);
}

function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value || '-';
    }
}

// ============================================
// PALEOARTE
// ============================================

function renderPaleoartComparison() {
    // Dados específicos da espécie ou fallback
    const changes = {
        '1990s': currentSpecies.paleoart?.['1990s'] || 'Posição horizontal, sem penas, movimento lento',
        '2000s': currentSpecies.paleoart?.['2000s'] || 'Posição mais ereta, penas em alguns, movimento moderado',
        '2020s': currentSpecies.paleoart?.['2020s'] || 'Posição totalmente ereta, penas comuns, movimento dinâmico'
    };

    setElementText('change-1990s', changes['1990s']);
    setElementText('change-2000s', changes['2000s']);
    setElementText('change-2020s', changes['2020s']);

    // Features antigas
    const ancientFeatures = currentSpecies.ancientFeatures || [
        'Posição de lagarto',
        'Sem penas (na maioria)',
        'Movimento lento',
        'Cauda arrastando'
    ];

    updateList('ancient-features', ancientFeatures);

    // Features modernas
    const modernFeatures = currentSpecies.modernFeatures || [
        'Posição mais ereta',
        'Penas em muitos',
        'Movimento dinâmico',
        'Cauda elevada'
    ];

    updateList('modern-features', modernFeatures);
}

function updateList(elementId, items) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }
}

// ============================================
// ESQUELETO vs RECONSTRUÇÃO
// ============================================

function renderSkeletonReconstruction() {
    const skeletonFeatures = currentSpecies.skeletonFeatures || [
        'Crânio robusto',
        'Coluna vertebral flexível',
        'Membros poderosos',
        'Garras/unhas presentes'
    ];

    updateList('skeleton-features-list', skeletonFeatures);

    const reconstructionFeatures = currentSpecies.reconstructionFeatures || [
        'Músculos massivos',
        'Pele e escamas',
        'Postura dinâmica',
        'Movimentos ágeis'
    ];

    updateList('reconstruction-features-list', reconstructionFeatures);

    // Anatomia detalhes
    const anatomy = currentSpecies.anatomy || {};
    setElementText('anatomy-skull', anatomy.skull || 'Crânio grande com mandíbula poderosa, adaptado para capturar presas.');
    setElementText('anatomy-spine', anatomy.spine || 'Coluna vertebral longa e flexível para movimento e equilíbrio.');
    setElementText('anatomy-limbs', anatomy.limbs || 'Membros bem desenvolvidos com garras para locomoção e captura.');
    setElementText('anatomy-tail', anatomy.tail || 'Cauda longa usada para equilíbrio e possivelmente para comunicação.');
}

// ============================================
// CONTROVÉRSIAS
// ============================================

function renderControversies() {
    const controversies = currentSpecies.controversies || [
        {
            title: 'Metabolismo',
            description: 'Como era o metabolismo? Ectotérmico, endotérmico ou mesotérmico?',
            sides: {
                'Teoria 1': 'Ectotérmico (sangue frio)',
                'Teoria 2': 'Endotérmico (sangue quente)'
            }
        },
        {
            title: 'Comportamento de Caça',
            description: 'Era predador ativo ou necrófago oportunista?',
            sides: {
                'Argumento 1': 'Predador ativo (velocidade e agilidade)',
                'Argumento 2': 'Oportunista (economia de energia)'
            }
        }
    ];

    const container = document.getElementById('controversies-container');
    if (!container) return;

    container.innerHTML = controversies.map(c => `
        <div class="controversy-item">
            <h4>🤔 ${c.title}</h4>
            <p class="controversy-desc">${c.description}</p>
            <div class="controversy-sides">
                ${Object.entries(c.sides).map(([key, value]) => `
                    <div class="controversy-side">
                        <span class="side-label">${key}:</span>
                        <span class="side-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ============================================
// REFERÊNCIAS
// ============================================

function renderReferences() {
    const references = currentSpecies.references || [
        {
            title: 'The origin of dinosaurs',
            authors: 'Benton, M.J.',
            journal: 'Nature (2010)',
            url: 'https://doi.org/10.1038/nature'
        },
        {
            title: 'Dinosaur paleobiology',
            authors: 'Brusatte, S.L.',
            journal: 'Annual Review (2018)',
            url: 'https://doi.org/10.1146/annurev'
        }
    ];

    const container = document.getElementById('references-list');
    if (!container) return;

    container.innerHTML = references.map(ref => `
        <div class="reference-item">
            <p><strong>${ref.title}</strong></p>
            <p>Autores: ${ref.authors}</p>
            <p>${ref.journal}</p>
            ${ref.url ? `<a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="btn btn-small btn-primary">Ler artigo →</a>` : ''}
        </div>
    `).join('');
}

// ============================================
// GALERIA DE IMAGENS
// ============================================

function setupGallery() {
    galleryImages = currentSpecies.gallery || [
        { type: '🦴', label: 'Esqueleto' },
        { type: '🎨', label: 'Reconstrução' },
        { type: '🌍', label: 'Ambiente' },
        { type: '🦕', label: 'Comparação' }
    ];

    renderGallery();
    setupGalleryControls();
}

function renderGallery() {
    const gallery = document.getElementById('gallery-grid');
    if (!gallery) return;

    gallery.innerHTML = galleryImages.map((img, index) => `
        <div class="gallery-item" onclick="openGallery(${index})">
            <div class="gallery-placeholder">${img.type}</div>
            <p>${img.label}</p>
        </div>
    `).join('');
}

function setupGalleryControls() {
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const closeBtn = document.getElementById('gallery-close');

    if (prevBtn) prevBtn.addEventListener('click', () => navigateGallery(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateGallery(1));
    if (closeBtn) closeBtn.addEventListener('click', closeGallery);

    // Teclado
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('gallery-modal');
        if (!modal || modal.style.display !== 'block') return;

        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowLeft') navigateGallery(-1);
        if (e.key === 'ArrowRight') navigateGallery(1);
    });
}

function openGallery(index) {
    currentImageIndex = index;
    const modal = document.getElementById('gallery-modal');
    const image = document.getElementById('gallery-full-image');
    const caption = document.getElementById('gallery-caption');

    if (modal && image && caption) {
        image.textContent = galleryImages[index].type;
        image.style.fontSize = '120px';
        caption.textContent = galleryImages[index].label;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function navigateGallery(direction) {
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < galleryImages.length) {
        currentImageIndex = newIndex;
        openGallery(currentImageIndex);
    }
}

function closeGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ============================================
// NAVEGAÇÃO ENTRE ESPÉCIES
// ============================================

function renderNavigation() {
    if (allSpecies.length === 0) return;

    const currentIndex = allSpecies.findIndex(s => s.id === currentSpecies.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allSpecies.length - 1;
    const nextIndex = currentIndex < allSpecies.length - 1 ? currentIndex + 1 : 0;

    const prevBtn = document.getElementById('prev-species');
    const nextBtn = document.getElementById('next-species');

    if (prevBtn) {
        prevBtn.onclick = () => {
            window.location.href = `species.html?id=${allSpecies[prevIndex].id}`;
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            window.location.href = `species.html?id=${allSpecies[nextIndex].id}`;
        };
    }
}

// ============================================
// BUSCAR PAPERS
// ============================================

function searchPapers() {
    const speciesName = currentSpecies.scientificName || currentSpecies.name;
    const searchQuery = encodeURIComponent(`${speciesName} dinosaur paleontology`);
    
    // Abrir Google Scholar em nova aba
    window.open(`https://scholar.google.com/scholar?q=${searchQuery}`, '_blank');
    
    trackEvent('paper_search', { species: currentSpecies.id });
}

// ============================================
// COMPARTILHAMENTO
// ============================================

function shareSpecies() {
    const shareData = {
        title: `${currentSpecies.name} - Dino Explorer`,
        text: `Descubra mais sobre ${currentSpecies.name}, um dinossauro do período ${formatPeriod(currentSpecies.period)}!`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        copyToClipboard(window.location.href);
        showToast('Link copiado para a área de transferência!');
    }
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatPeriod(period) {
    const periods = {
        'triassic': 'Triássico',
        'jurassic': 'Jurássico',
        'cretaceous': 'Cretáceo'
    };
    return periods[period] || period || '-';
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

function trackEvent(eventName, data = {}) {
    console.log('📊 Evento:', eventName, data);
    // Aqui você pode integrar com analytics
}

function trackPageView() {
    trackEvent('species_view', {
        species: currentSpecies.id,
        name: currentSpecies.name,
        period: currentSpecies.period
    });
}

// ============================================
// MENU MOBILE
// ============================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (menuToggle) menuToggle.innerHTML = '☰';
            });
        });
    }
}

// ============================================
// ANIMAÇÕES
// ============================================

function addSpeciesAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .detail-card, .paleoart-card, .skeleton-card, .reconstruction-card {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
        }
        
        .detail-card:nth-child(1) { animation-delay: 0.1s; }
        .detail-card:nth-child(2) { animation-delay: 0.2s; }
        .detail-card:nth-child(3) { animation-delay: 0.3s; }
        .detail-card:nth-child(4) { animation-delay: 0.4s; }
        .detail-card:nth-child(5) { animation-delay: 0.5s; }
        .detail-card:nth-child(6) { animation-delay: 0.6s; }
    `;
    document.head.appendChild(style);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦖 Página de espécie carregada!');
    
    // Inicializar componentes
    initMobileMenu();
    addSpeciesAnimations();
    
    // Carregar dados
    loadSpeciesData();
    
    // Configurar botões
    const shareBtn = document.getElementById('share-species');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareSpecies);
    }
    
    const searchBtn = document.getElementById('search-papers-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchPapers);
    }
    
    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.goToSpecies = (id) => {
    window.location.href = `species.html?id=${id}`;
};

window.openGallery = openGallery;
window.closeGallery = closeGallery;
window.navigateGallery = navigateGallery;
window.searchPapers = searchPapers;
window.shareSpecies = shareSpecies;

// ============================================
// FIM DO ARQUIVO
// ============================================