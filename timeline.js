/* ============================================
   DINO EXPLORER - TIMELINE.JS
   Linha do tempo interativa com eventos e filtros
   ============================================ */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let timelineEvents = [];
let filteredEvents = [];
let currentModalEvent = null;

// Elementos DOM
const urlParams = new URLSearchParams(window.location.search);
const periodParam = urlParams.get('period');

const modal = document.getElementById('event-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');

const periodFilter = document.getElementById('period-filter');
const continentFilter = document.getElementById('continent-filter');
const eventTypeFilter = document.getElementById('event-type-filter');
const resetBtn = document.getElementById('reset-filters');

// ============================================
// CARREGAR DADOS
// ============================================

async function loadTimelineData() {
    try {
        // Tentar carregar da raiz primeiro, depois do diretório data
        let response = await fetch('timeline-events.json').catch(() => null);
        if (!response || !response.ok) {
            response = await fetch('data/timeline-events.json');
        }
        
        if (!response.ok) throw new Error('Erro ao carregar timeline-events.json');
        
        const data = await response.json();
        timelineEvents = data.events || data;
        filteredEvents = [...timelineEvents];
        
        console.log('✅ Eventos carregados:', timelineEvents.length);
        
        // Se veio de um filtro, aplicar
        if (periodParam && periodFilter) {
            periodFilter.value = periodParam;
        }
        
        renderEvents();
        updateStats();
        setupPeriodScroll();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showError('Erro ao carregar eventos da timeline');
    }
}

function showError(message) {
    const container = document.querySelector('.timeline-section');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 60px 20px;">
                <span class="error-icon" style="font-size: 48px;">❌</span>
                <h3>Erro ao carregar</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
    }
}

// ============================================
// RENDERIZAR EVENTOS
// ============================================

function renderEvents() {
    const events = filterEvents();
    filteredEvents = events;

    // Limpar eventos existentes
    document.getElementById('triassic-events').innerHTML = '';
    document.getElementById('jurassic-events').innerHTML = '';
    document.getElementById('cretaceous-events').innerHTML = '';

    if (events.length === 0) {
        showNoEvents();
        return;
    }

    events.forEach(event => {
        const eventCard = createEventCard(event);
        const targetElement = document.getElementById(`${event.period}-events`);
        
        if (targetElement) {
            targetElement.appendChild(eventCard);
        }
    });

    updateEventPositions();
}

function showNoEvents() {
    const message = '<div class="no-events">Nenhum evento encontrado para os filtros selecionados.</div>';
    document.getElementById('triassic-events').innerHTML = message;
    document.getElementById('jurassic-events').innerHTML = message;
    document.getElementById('cretaceous-events').innerHTML = message;
}

// ============================================
// CRIAR CARD DE EVENTO
// ============================================

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = `timeline-event ${event.type}`;
    card.setAttribute('data-event-id', event.id);
    card.setAttribute('data-period', event.period);
    card.setAttribute('data-age', event.age);
    
    // Posicionamento baseado na idade
    const position = calculateEventPosition(event);
    card.style.left = `${position}%`;
    
    card.innerHTML = `
        <div class="event-marker"></div>
        <div class="event-tooltip">
            <div class="event-age">${formatAge(event.ageRange || event.age)}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-description">${truncateText(event.description, 100)}</div>
            <span class="event-type ${event.type}">${event.type.toUpperCase()}</span>
        </div>
    `;

    card.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventModal(event);
    });

    // Adicionar hover effect
    card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
    });

    return card;
}

function calculateEventPosition(event) {
    const periodRanges = {
        'triassic': { start: 252, end: 201 },
        'jurassic': { start: 201, end: 145 },
        'cretaceous': { start: 145, end: 66 }
    };

    const range = periodRanges[event.period];
    if (!range) return 50;

    const age = event.age || parseFloat(event.ageRange);
    if (!age) return 50;

    // Calcular posição percentual dentro do período
    const periodDuration = range.start - range.end;
    const offset = range.start - age;
    return (offset / periodDuration) * 100;
}

function formatAge(age) {
    if (!age) return '';
    if (typeof age === 'number') return `${age} Ma`;
    return age;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function updateEventPositions() {
    // Recalcular posições para responsividade
    document.querySelectorAll('.timeline-event').forEach(event => {
        const eventId = event.getAttribute('data-event-id');
        const originalEvent = timelineEvents.find(e => e.id === eventId);
        if (originalEvent) {
            const position = calculateEventPosition(originalEvent);
            event.style.left = `${position}%`;
        }
    });
}

// ============================================
// MODAL DE EVENTO
// ============================================

function showEventModal(event) {
    currentModalEvent = event;
    
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-header">
            <span class="event-type ${event.type}">${event.type.toUpperCase()}</span>
            <h2>${event.title}</h2>
        </div>
        
        <div class="modal-meta">
            <p><strong>Período:</strong> ${formatPeriod(event.period)}</p>
            <p><strong>Idade:</strong> ${formatAge(event.ageRange || event.age)}</p>
            ${event.location ? `<p><strong>Localização:</strong> 📍 ${event.location}</p>` : ''}
            ${event.continents ? `<p><strong>Continentes:</strong> ${formatContinents(event.continents)}</p>` : ''}
        </div>

        <div class="modal-content">
            <h3>Significância</h3>
            <p>${event.significance || event.description}</p>

            <h3>Detalhes</h3>
            <p>${event.detailedDescription || event.description}</p>
        </div>

        ${event.species ? `
            <div class="modal-species">
                <h3>Espécies Envolvidas</h3>
                <ul class="species-list">
                    ${event.species.map(s => `
                        <li>
                            <span class="species-icon">🦖</span>
                            <span>${s}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}

        ${event.references ? `
            <div class="modal-references">
                <h3>Referências</h3>
                <ul class="references-list">
                    ${event.references.map(ref => `
                        <li>
                            <a href="${ref.url}" target="_blank" rel="noopener noreferrer">
                                📄 ${ref.title}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}

        ${event.relatedEvents ? `
            <div class="modal-related">
                <h3>Eventos Relacionados</h3>
                <div class="related-events">
                    ${event.relatedEvents.map(id => {
                        const related = timelineEvents.find(e => e.id === id);
                        return related ? `
                            <button class="related-event-btn" onclick="showEventModalById('${id}')">
                                ${related.title}
                            </button>
                        ` : '';
                    }).join('')}
                </div>
            </div>
        ` : ''}
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showEventModalById(eventId) {
    const event = timelineEvents.find(e => e.id === eventId);
    if (event) {
        showEventModal(event);
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Configurar fechamento do modal
if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Fechar com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('show')) {
        closeModal();
    }
});

// ============================================
// FILTROS
// ============================================

function filterEvents() {
    const period = periodFilter?.value || '';
    const continent = continentFilter?.value || '';
    const eventType = eventTypeFilter?.value || '';

    return timelineEvents.filter(event => {
        const matchPeriod = !period || event.period === period;
        const matchContinent = !continent || 
            (event.continents && event.continents.includes(continent));
        const matchType = !eventType || event.type === eventType;

        return matchPeriod && matchContinent && matchType;
    });
}

function applyFilters() {
    renderEvents();
    updateStats();
    updatePeriodSelected();
    highlightActiveFilters();
}

function resetFilters() {
    if (periodFilter) periodFilter.value = '';
    if (continentFilter) continentFilter.value = '';
    if (eventTypeFilter) eventTypeFilter.value = '';
    applyFilters();
}

// Event listeners para filtros
if (periodFilter) periodFilter.addEventListener('change', applyFilters);
if (continentFilter) continentFilter.addEventListener('change', applyFilters);
if (eventTypeFilter) eventTypeFilter.addEventListener('change', applyFilters);

if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
}

function highlightActiveFilters() {
    [periodFilter, continentFilter, eventTypeFilter].forEach(filter => {
        if (filter && filter.value) {
            filter.style.borderColor = 'var(--primary-color)';
        } else if (filter) {
            filter.style.borderColor = '';
        }
    });
}

// ============================================
// ATUALIZAR ESTATÍSTICAS
// ============================================

function updateStats() {
    const filteredEvents = filterEvents();
    const speciesSet = new Set();

    filteredEvents.forEach(event => {
        if (event.species) {
            event.species.forEach(species => speciesSet.add(species));
        }
    });

    const eventCount = document.getElementById('event-count');
    const speciesCount = document.getElementById('species-count');
    const totalEvents = document.getElementById('total-events');

    if (eventCount) eventCount.textContent = filteredEvents.length;
    if (speciesCount) speciesCount.textContent = speciesSet.size;
    if (totalEvents) totalEvents.textContent = timelineEvents.length;
}

function updatePeriodSelected() {
    const period = periodFilter?.value || '';
    const periodNames = {
        'triassic': 'Triássico',
        'jurassic': 'Jurássico',
        'cretaceous': 'Cretáceo',
    };

    const selected = period ? periodNames[period] || period : 'Todos';
    const periodSelected = document.getElementById('period-selected');
    if (periodSelected) periodSelected.textContent = selected;
}

// ============================================
// TIMELINE HORIZONTAL CLICÁVEL
// ============================================

function setupPeriodScroll() {
    document.querySelectorAll('.timeline-point[data-period]').forEach(point => {
        point.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            if (period !== 'now' && periodFilter) {
                periodFilter.value = period;
                applyFilters();
                
                // Scroll suave para o período
                const periodSection = document.querySelector(`[data-period="${period}"]`);
                if (periodSection) {
                    periodSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ============================================
// MAPA PALEOGEOGRÁFICO
// ============================================

function initPaleoMap() {
    const mapBtns = document.querySelectorAll('.map-controls .btn');
    const maps = document.querySelectorAll('.map-placeholder');

    mapBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            // Remove active de todos os mapas
            maps.forEach(map => map.classList.remove('active'));
            
            // Adiciona active ao mapa correto
            const targetMap = document.getElementById(`map-${period}`);
            if (targetMap) {
                targetMap.classList.add('active');
            }
            
            // Atualiza estado dos botões
            mapBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Atualizar informações do mapa
            updateMapInfo(period);
        });
    });

    // Ativar primeiro mapa por padrão
    const firstMapBtn = document.querySelector('.map-controls .btn');
    if (firstMapBtn) {
        firstMapBtn.classList.add('active');
        updateMapInfo(firstMapBtn.getAttribute('data-period'));
    }
}

function updateMapInfo(period) {
    const info = {
        'triassic': {
            title: 'Triássico (252-201 Ma)',
            desc: 'Supercontinente Pangeia unido. Oceano Tétis a leste. Clima árido no interior.'
        },
        'jurassic': {
            title: 'Jurássico (201-145 Ma)',
            desc: 'Pangeia se divide em Laurásia (N) e Gondwana (S). Mares rasos e quentes.'
        },
        'cretaceous': {
            title: 'Cretáceo (145-66 Ma)',
            desc: 'Continentes em posição quase moderna. Mares avançam. Clima tropical global.'
        }
    };

    const titleEl = document.getElementById('map-period-title');
    const descEl = document.getElementById('map-period-description');

    if (titleEl) titleEl.textContent = info[period]?.title || '';
    if (descEl) descEl.textContent = info[period]?.desc || '';
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
    return periods[period] || period;
}

function formatContinents(continents) {
    if (!continents) return '';
    if (Array.isArray(continents)) {
        return continents.map(c => formatContinent(c)).join(', ');
    }
    return continents;
}

function formatContinent(continent) {
    const names = {
        'north-america': 'América do Norte',
        'south-america': 'América do Sul',
        'europe': 'Europa',
        'africa': 'África',
        'asia': 'Ásia',
        'australia': 'Oceania',
        'antarctica': 'Antártida'
    };
    return names[continent] || continent;
}

function setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateEventPositions();
        }, 250);
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

function addTimelineAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .timeline-event {
            animation: slideIn 0.5s ease-out forwards;
            opacity: 0;
        }

        .timeline-event:nth-child(1) { animation-delay: 0.1s; }
        .timeline-event:nth-child(2) { animation-delay: 0.2s; }
        .timeline-event:nth-child(3) { animation-delay: 0.3s; }
        .timeline-event:nth-child(4) { animation-delay: 0.4s; }
        .timeline-event:nth-child(5) { animation-delay: 0.5s; }
        .timeline-event:nth-child(6) { animation-delay: 0.6s; }

        .event-marker {
            animation: pulse 2s infinite;
        }

        .modal.show {
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// RASTREAMENTO
// ============================================

function trackEventView(event) {
    console.log('📊 Evento visualizado:', event.title);
    // Aqui você pode integrar com analytics
}

// Sobrescrever showEventModal para incluir tracking
const originalShowEventModal = showEventModal;
showEventModal = function(event) {
    originalShowEventModal(event);
    trackEventView(event);
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦖 Timeline carregada!');
    
    // Inicializar componentes
    initMobileMenu();
    initPaleoMap();
    addTimelineAnimations();
    setupResizeHandler();
    
    // Carregar dados
    loadTimelineData();
    
    // Atualizar estatísticas iniciais
    updateStats();
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.showEventModalById = showEventModalById;
window.closeModal = closeModal;
window.resetFilters = resetFilters;
window.applyFilters = applyFilters;

// ============================================
// FIM DO ARQUIVO
// ============================================