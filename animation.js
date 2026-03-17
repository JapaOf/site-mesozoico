/* ============================================
   DINO EXPLORER - TIMELINE.JS
   Linha do tempo interativa com eventos
   ============================================ */

// ============================================
// DADOS DOS EVENTOS DA TIMELINE
// ============================================

const timelineEvents = {
    triassic: [
        {
            id: 'triassic-1',
            name: 'Início do Triássico',
            date: '252 Ma',
            type: 'geological',
            description: 'Início do período Triássico após a maior extinção em massa da história.',
            position: 0
        },
        {
            id: 'triassic-2',
            name: 'Primeiros Dinossauros',
            date: '230 Ma',
            type: 'evolution',
            description: 'Surgem os primeiros dinossauros como Eoraptor e Herrerasaurus.',
            position: 22
        },
        {
            id: 'triassic-3',
            name: 'Divergência Saurischia/Ornithischia',
            date: '225 Ma',
            type: 'evolution',
            description: 'Os dinossauros se dividem em dois grandes clados.',
            position: 27
        },
        {
            id: 'triassic-4',
            name: 'Extinção do Triássico',
            date: '201 Ma',
            type: 'extinction',
            description: 'Extinção em massa que marca o fim do Triássico.',
            position: 51
        }
    ],
    jurassic: [
        {
            id: 'jurassic-1',
            name: 'Início do Jurássico',
            date: '201 Ma',
            type: 'geological',
            description: 'Início do período Jurássico. Pangeia começa a se dividir.',
            position: 0
        },
        {
            id: 'jurassic-2',
            name: 'Saurópodes Gigantes',
            date: '180 Ma',
            type: 'evolution',
            description: 'Aparecem os primeiros saurópodes gigantes como Brachiosaurus.',
            position: 21
        },
        {
            id: 'jurassic-3',
            name: 'Primeiras Aves (Archaeopteryx)',
            date: '150 Ma',
            type: 'evolution',
            description: 'Archaeopteryx, o primeiro dinossauro com penas e asas.',
            position: 51
        },
        {
            id: 'jurassic-4',
            name: 'Fim do Jurássico',
            date: '145 Ma',
            type: 'geological',
            description: 'Transição para o período Cretáceo.',
            position: 56
        }
    ],
    cretaceous: [
        {
            id: 'cretaceous-1',
            name: 'Início do Cretáceo',
            date: '145 Ma',
            type: 'geological',
            description: 'Início do período Cretáceo. Continentes se separam.',
            position: 0
        },
        {
            id: 'cretaceous-2',
            name: 'Plantas com Flores',
            date: '130 Ma',
            type: 'evolution',
            description: 'Surgem as primeiras angiospermas (plantas com flores).',
            position: 15
        },
        {
            id: 'cretaceous-3',
            name: 'Apogeu dos Ceratopsídeos',
            date: '100 Ma',
            type: 'evolution',
            description: 'Diversificação dos dinossauros com chifres como Triceratops.',
            position: 45
        },
        {
            id: 'cretaceous-4',
            name: 'T. rex no Apogeu',
            date: '68 Ma',
            type: 'evolution',
            description: 'Tyrannosaurus rex domina como predador ápice.',
            position: 77
        },
        {
            id: 'cretaceous-5',
            name: 'Extinção K-Pg',
            date: '66 Ma',
            type: 'extinction',
            description: 'Impacto do asteroide que extingue os dinossauros não-avianos.',
            position: 79
        }
    ]
};

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let currentFilters = {
    period: '',
    continent: '',
    type: ''
};

let currentPage = 1;
const eventsPerPage = 10;

// ============================================
// CARREGAR EVENTOS
// ============================================

function loadTimelineEvents(period = null) {
    if (period) {
        const container = document.getElementById(`${period}-events`);
        if (!container) return;
        
        const events = timelineEvents[period] || [];
        renderEvents(container, events, period);
    } else {
        // Carregar todos os períodos
        Object.keys(timelineEvents).forEach(period => {
            const container = document.getElementById(`${period}-events`);
            if (container) {
                renderEvents(container, timelineEvents[period], period);
            }
        });
    }
    
    updateStats();
}

function renderEvents(container, events, period) {
    if (events.length === 0) {
        container.innerHTML = '<div class="no-events">Nenhum evento encontrado para este período.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = `timeline-event-item ${event.type}`;
        eventEl.style.left = `${event.position}%`;
        eventEl.setAttribute('data-event-id', event.id);
        eventEl.setAttribute('data-period', period);
        
        eventEl.innerHTML = `
            <div class="event-marker" style="background: ${getEventColor(event.type)};"></div>
            <div class="event-tooltip">
                <h4>${event.name}</h4>
                <p class="event-date">${event.date}</p>
                <p class="event-desc">${event.description}</p>
            </div>
        `;
        
        eventEl.addEventListener('click', () => showEventModal(event.id));
        container.appendChild(eventEl);
    });
}

function getEventColor(type) {
    const colors = {
        'evolution': '#4CAF50',
        'extinction': '#f44336',
        'geological': '#2196F3',
        'climate': '#FF9800',
        'discovery': '#9C27B0'
    };
    return colors[type] || '#999';
}

// ============================================
// FILTROS
// ============================================

function initFilters() {
    const periodFilter = document.getElementById('period-filter');
    const continentFilter = document.getElementById('continent-filter');
    const typeFilter = document.getElementById('event-type-filter');
    const resetBtn = document.getElementById('reset-filters');
    
    if (periodFilter) {
        periodFilter.addEventListener('change', () => {
            currentFilters.period = periodFilter.value;
            applyFilters();
        });
    }
    
    if (continentFilter) {
        continentFilter.addEventListener('change', () => {
            currentFilters.continent = continentFilter.value;
            applyFilters();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            currentFilters.type = typeFilter.value;
            applyFilters();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

function applyFilters() {
    // Mostrar/esconder períodos baseado no filtro
    document.querySelectorAll('.period-timeline').forEach(period => {
        const periodName = period.getAttribute('data-period');
        
        if (currentFilters.period && currentFilters.period !== periodName) {
            period.style.display = 'none';
        } else {
            period.style.display = 'block';
        }
    });
    
    // Filtrar eventos por tipo
    if (currentFilters.type) {
        document.querySelectorAll('.timeline-event-item').forEach(event => {
            if (event.classList.contains(currentFilters.type)) {
                event.style.display = 'block';
            } else {
                event.style.display = 'none';
            }
        });
    } else {
        document.querySelectorAll('.timeline-event-item').forEach(event => {
            event.style.display = 'block';
        });
    }
    
    updateStats();
}

function resetFilters() {
    currentFilters = {
        period: '',
        continent: '',
        type: ''
    };
    
    // Resetar selects
    document.getElementById('period-filter').value = '';
    document.getElementById('continent-filter').value = '';
    document.getElementById('event-type-filter').value = '';
    
    // Mostrar todos os períodos e eventos
    document.querySelectorAll('.period-timeline').forEach(period => {
        period.style.display = 'block';
    });
    
    document.querySelectorAll('.timeline-event-item').forEach(event => {
        event.style.display = 'block';
    });
    
    updateStats();
}

// ============================================
// ESTATÍSTICAS
// ============================================

function updateStats() {
    const totalEvents = document.querySelectorAll('.timeline-event-item').length;
    const visibleEvents = document.querySelectorAll('.timeline-event-item[style="display: block;"]').length;
    const visiblePeriods = document.querySelectorAll('.period-timeline[style="display: block;"]').length;
    
    document.getElementById('event-count').textContent = visibleEvents;
    document.getElementById('species-count').textContent = visibleEvents; // Temporário
    document.getElementById('period-selected').textContent = 
        currentFilters.period ? 
        currentFilters.period.charAt(0).toUpperCase() + currentFilters.period.slice(1) : 
        'Todos';
}

// ============================================
// MODAL DE EVENTO
// ============================================

function showEventModal(eventId) {
    // Encontrar o evento em todos os períodos
    let event = null;
    let period = null;
    
    for (const [p, events] of Object.entries(timelineEvents)) {
        const found = events.find(e => e.id === eventId);
        if (found) {
            event = found;
            period = p;
            break;
        }
    }
    
    if (!event) return;
    
    const modal = document.getElementById('event-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>${event.name}</h2>
        <p class="modal-date"><strong>Data:</strong> ${event.date}</p>
        <p class="modal-period"><strong>Período:</strong> ${period}</p>
        <p class="modal-type"><strong>Tipo:</strong> ${event.type}</p>
        <div class="modal-description">
            <p>${event.description}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// ============================================
// MAPAS PALEOGEOGRÁFICOS
// ============================================

function showMap(period) {
    // Atualizar botões
    document.querySelectorAll('.map-controls .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.map-controls .btn[data-period="${period}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Esconder todos os mapas
    document.querySelectorAll('.map-placeholder').forEach(map => {
        map.classList.remove('active');
    });
    
    // Mostrar mapa selecionado
    const selectedMap = document.getElementById(`map-${period}`);
    if (selectedMap) selectedMap.classList.add('active');
}

// ============================================
// FILTRO POR PERÍODO
// ============================================

function filterByPeriod(period) {
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) {
        periodFilter.value = period;
        currentFilters.period = period;
        applyFilters();
    }
}

// ============================================
// PAGINAÇÃO (para listas de eventos)
// ============================================

function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next') {
        currentPage++;
    }
    
    updatePagination();
}

function updatePagination() {
    // Esta função será expandida quando tivermos listas paginadas
    document.getElementById('page-info').textContent = `Página ${currentPage}`;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Carregar eventos
    loadTimelineEvents();
    
    // Inicializar filtros
    initFilters();
    
    // Configurar botão reset
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Configurar modal
    const modal = document.getElementById('event-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Inicializar estatísticas
    updateStats();
    
    console.log('⏳ Timeline.js carregado com sucesso!');
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.showEventModal = showEventModal;
window.filterByPeriod = filterByPeriod;
window.showMap = showMap;
window.changePage = changePage;