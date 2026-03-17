/* ============================================
   DINO EXPLORER - SPECIES-LIST.JS
   Funcionalidade da página de listagem de espécies
   ============================================ */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let allSpecies = [];
let filteredSpecies = [];
let selectedForComparison = [];
let currentView = 'grid';
let currentPage = 1;
const itemsPerPage = 12;

// Elementos DOM
const searchInput = document.getElementById('search-input');
const periodFilter = document.getElementById('period-filter');
const cladeFilter = document.getElementById('clade-filter');
const dietFilter = document.getElementById('diet-filter');
const sizeFilter = document.getElementById('size-filter');
const sortFilter = document.getElementById('sort-filter');
const resetBtn = document.getElementById('reset-filters');
const clearAllBtn = document.getElementById('clear-all-filters');
const compareBtn = document.getElementById('start-comparison');
const clearComparisonBtn = document.getElementById('clear-comparison');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// ============================================
// CARREGAR DADOS
// ============================================

async function loadAllSpecies() {
    try {
        // Tentar carregar da raiz primeiro, depois do diretório data
        let response = await fetch('species.json').catch(() => null);
        if (!response || !response.ok) {
            response = await fetch('data/species.json');
        }
        
        if (!response.ok) throw new Error('Erro ao carregar species.json');
        
        const data = await response.json();
        allSpecies = data.species || data;
        filteredSpecies = [...allSpecies];
        
        console.log('✅ Espécies carregadas:', allSpecies.length);
        
        updateStats();
        updatePagination();
        renderSpecies();
        setupComparisonSlots();
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showError('Erro ao carregar dados. Tente novamente mais tarde.');
    }
}

function showError(message) {
    const grid = document.getElementById('species-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-message">
                <span class="error-icon">❌</span>
                <h3>Erro ao carregar</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
    }
}

// ============================================
// RENDERIZAR ESPÉCIES
// ============================================

function renderSpecies() {
    document.getElementById('species-count').textContent = filteredSpecies.length;
    document.getElementById('total-species').textContent = allSpecies.length;

    if (filteredSpecies.length === 0) {
        showNoResults();
        return;
    }

    hideNoResults();

    // Paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSpecies = filteredSpecies.slice(startIndex, endIndex);

    if (currentView === 'grid') {
        renderGridView(paginatedSpecies);
    } else if (currentView === 'list') {
        renderListView(paginatedSpecies);
    } else if (currentView === 'table') {
        renderTableView(paginatedSpecies);
    }

    updatePagination();
}

// ============================================
// UTILITÁRIOS DE IMAGEM
// ============================================

function getSpeciesImageUrl(species) {
    if (species.image) {
        return species.image;
    }
    // Tentar caminhos diferentes
    const possiblePaths = [
        `images/species/${species.id}.jpg`,
        `images/species/${species.id}.png`,
        `images/species/${species.id}.webp`,
        `img/species/${species.id}.jpg`
    ];
    return possiblePaths[0];
}

function getImageHtml(species) {
    const imageUrl = getSpeciesImageUrl(species);
    return `
        <div class="species-image-container">
            <img 
                src="${imageUrl}" 
                alt="${species.name}"
                loading="lazy"
                class="species-image"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >
            <div class="image-placeholder" style="display: none; font-size: 48px; align-items: center; justify-content: center;">
                🦖
            </div>
        </div>
    `;
}

// ============================================
// GRID VIEW
// ============================================

function renderGridView(species) {
    const grid = document.getElementById('species-grid');
    grid.style.display = 'grid';
    document.getElementById('species-list').style.display = 'none';
    document.getElementById('species-table-wrapper').style.display = 'none';

    if (!grid) return;

    grid.innerHTML = species.map(species => `
        <div class="species-card" data-species-id="${species.id}">
            <div class="species-card-image">
                ${getImageHtml(species)}
            </div>
            <div class="species-card-content">
                <h3 class="species-card-name">${species.name}</h3>
                <p class="species-card-scientific">${species.scientificName || ''}</p>
                
                <div class="species-card-info">
                    <div class="species-card-info-item">
                        <span>Período:</span>
                        <span class="species-card-info-value">${formatPeriod(species.period)}</span>
                    </div>
                    <div class="species-card-info-item">
                        <span>Tamanho:</span>
                        <span class="species-card-info-value">${species.size?.length || '-'}</span>
                    </div>
                    <div class="species-card-info-item">
                        <span>Dieta:</span>
                        <span class="species-card-info-value diet-badge ${(species.diet || '').toLowerCase()}">${species.diet || '-'}</span>
                    </div>
                </div>

                <div class="species-card-action">
                    <button class="btn btn-small btn-primary" onclick="goToSpecies('${species.id}')">Ver Detalhes</button>
                    <button class="btn btn-small btn-outline compare-toggle" onclick="toggleComparison('${species.id}')" 
                            data-selected="${selectedForComparison.includes(species.id)}">
                        ${selectedForComparison.includes(species.id) ? '✓' : '+'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// LIST VIEW
// ============================================

function renderListView(species) {
    const list = document.getElementById('species-list');
    list.style.display = 'flex';
    document.getElementById('species-grid').style.display = 'none';
    document.getElementById('species-table-wrapper').style.display = 'none';

    if (!list) return;

    list.innerHTML = species.map(species => `
        <div class="species-list-item" data-species-id="${species.id}">
            <div class="species-list-image">
                ${getImageHtml(species)}
            </div>
            
            <div class="species-list-info">
                <h3>${species.name}</h3>
                <p class="species-list-scientific">${species.scientificName || ''}</p>
                <p class="species-list-description">${species.description || ''}</p>
            </div>

            <div class="species-list-stats">
                <div class="species-list-stat">
                    <span class="species-list-stat-label">Período</span>
                    <span class="species-list-stat-value">${formatPeriod(species.period)}</span>
                </div>
                <div class="species-list-stat">
                    <span class="species-list-stat-label">Tamanho</span>
                    <span class="species-list-stat-value">${species.size?.length || '-'}</span>
                </div>
                <div class="species-list-stat">
                    <span class="species-list-stat-label">Peso</span>
                    <span class="species-list-stat-value">${species.size?.weight || '-'}</span>
                </div>
            </div>

            <div class="species-list-actions">
                <button class="btn btn-small btn-primary" onclick="goToSpecies('${species.id}')">Ver</button>
                <button class="btn btn-small ${selectedForComparison.includes(species.id) ? 'btn-success' : 'btn-outline'}" 
                        onclick="toggleComparison('${species.id}')">
                    ${selectedForComparison.includes(species.id) ? '✓' : '+'}
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// TABLE VIEW
// ============================================

function renderTableView(species) {
    document.getElementById('species-grid').style.display = 'none';
    document.getElementById('species-list').style.display = 'none';
    document.getElementById('species-table-wrapper').style.display = 'block';

    const tbody = document.getElementById('species-table-body');
    if (!tbody) return;

    tbody.innerHTML = species.map(species => `
        <tr>
            <td>
                <a href="javascript:goToSpecies('${species.id}')" class="table-link">${species.name}</a>
            </td>
            <td>${formatPeriod(species.period)}</td>
            <td>${species.size?.length || '-'}</td>
            <td>${species.size?.weight || '-'}</td>
            <td><span class="diet-badge ${(species.diet || '').toLowerCase()}">${species.diet || '-'}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="goToSpecies('${species.id}')">Ver</button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// FILTROS
// ============================================

function applyFilters() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const period = periodFilter?.value || '';
    const clade = cladeFilter?.value || '';
    const diet = dietFilter?.value || '';
    const size = sizeFilter?.value || '';
    const sort = sortFilter?.value || 'name';

    filteredSpecies = allSpecies.filter(species => {
        // Busca textual
        const matchSearch = searchTerm === '' || 
            species.name.toLowerCase().includes(searchTerm) ||
            (species.scientificName && species.scientificName.toLowerCase().includes(searchTerm)) ||
            (species.description && species.description.toLowerCase().includes(searchTerm));

        // Período
        const matchPeriod = period === '' || species.period === period;

        // Clado
        const matchClade = clade === '' || 
            (species.clade && species.clade.toLowerCase().includes(clade));

        // Dieta
        const matchDiet = diet === '' || 
            (species.diet && species.diet.toLowerCase().includes(diet));

        // Tamanho
        let matchSize = true;
        if (size !== '') {
            const length = parseFloat(species.size?.length) || 0;
            if (size === 'pequeno' && (length >= 3 || length === 0)) matchSize = false;
            if (size === 'medio' && (length < 3 || length >= 10)) matchSize = false;
            if (size === 'grande' && (length < 10 || length >= 20)) matchSize = false;
            if (size === 'gigante' && length < 20) matchSize = false;
        }

        return matchSearch && matchPeriod && matchClade && matchDiet && matchSize;
    });

    // Ordenação
    sortSpecies(sort);

    // Resetar para primeira página
    currentPage = 1;
    renderSpecies();
}

function sortSpecies(sortType) {
    switch(sortType) {
        case 'name':
            filteredSpecies.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            filteredSpecies.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'period':
            const periodOrder = { triassic: 1, jurassic: 2, cretaceous: 3 };
            filteredSpecies.sort((a, b) => periodOrder[a.period] - periodOrder[b.period]);
            break;
        case 'period_desc':
            const periodOrderDesc = { triassic: 3, jurassic: 2, cretaceous: 1 };
            filteredSpecies.sort((a, b) => periodOrderDesc[a.period] - periodOrderDesc[b.period]);
            break;
        case 'size_desc':
            filteredSpecies.sort((a, b) => (parseFloat(b.size?.length) || 0) - (parseFloat(a.size?.length) || 0));
            break;
        case 'size_asc':
            filteredSpecies.sort((a, b) => (parseFloat(a.size?.length) || 0) - (parseFloat(b.size?.length) || 0));
            break;
        case 'weight_desc':
            filteredSpecies.sort((a, b) => (parseFloat(b.size?.weight) || 0) - (parseFloat(a.size?.weight) || 0));
            break;
        case 'weight_asc':
            filteredSpecies.sort((a, b) => (parseFloat(a.size?.weight) || 0) - (parseFloat(b.size?.weight) || 0));
            break;
        default:
            filteredSpecies.sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Event listeners para filtros
if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
if (periodFilter) periodFilter.addEventListener('change', applyFilters);
if (cladeFilter) cladeFilter.addEventListener('change', applyFilters);
if (dietFilter) dietFilter.addEventListener('change', applyFilters);
if (sizeFilter) sizeFilter.addEventListener('change', applyFilters);
if (sortFilter) sortFilter.addEventListener('change', applyFilters);

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (periodFilter) periodFilter.value = '';
        if (cladeFilter) cladeFilter.value = '';
        if (dietFilter) dietFilter.value = '';
        if (sizeFilter) sizeFilter.value = '';
        if (sortFilter) sortFilter.value = 'name';
        applyFilters();
    });
}

// Debounce para busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// VISTA: TOGGLE
// ============================================

document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        currentView = this.getAttribute('data-view');
        
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        renderSpecies();
    });
});

function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        }
    });
    renderSpecies();
}

// ============================================
// PAGINAÇÃO
// ============================================

function updatePagination() {
    const totalPages = Math.ceil(filteredSpecies.length / itemsPerPage) || 1;
    
    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredSpecies.length / itemsPerPage);
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    
    renderSpecies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// NAVEGAÇÃO
// ============================================

function goToSpecies(speciesId) {
    window.location.href = `species.html?id=${speciesId}`;
}

// ============================================
// COMPARAÇÃO
// ============================================

function toggleComparison(speciesId) {
    const index = selectedForComparison.indexOf(speciesId);
    
    if (index > -1) {
        selectedForComparison.splice(index, 1);
    } else if (selectedForComparison.length < 3) {
        selectedForComparison.push(speciesId);
    } else {
        showToast('Máximo 3 espécies para comparação!', 'warning');
        return;
    }

    updateComparisonUI();
    // Re-renderizar para atualizar botões
    renderSpecies();
}

function updateComparisonUI() {
    // Limpar slots
    for (let i = 1; i <= 3; i++) {
        const slot = document.getElementById(`comparison-slot-${i}`);
        if (slot) {
            slot.innerHTML = '<div class="slot-placeholder">➕ Selecione uma espécie</div>';
            slot.classList.remove('slot-selected');
        }
    }

    // Preencher slots
    selectedForComparison.forEach((speciesId, index) => {
        const species = allSpecies.find(s => s.id === speciesId);
        const slot = document.getElementById(`comparison-slot-${index + 1}`);
        
        if (slot && species) {
            slot.innerHTML = `
                <div class="slot-species-info">
                    <div class="slot-species-image">
                        <span class="slot-emoji">${getSpeciesEmoji(species)}</span>
                    </div>
                    <div class="slot-species-name">${species.name}</div>
                    <button class="slot-remove-btn" onclick="toggleComparison('${speciesId}')" title="Remover">✕</button>
                </div>
            `;
            slot.classList.add('slot-selected');
        }
    });

    // Ativar botão de comparação
    if (compareBtn) {
        compareBtn.disabled = selectedForComparison.length < 2;
    }
}

function getSpeciesEmoji(species) {
    const emojiMap = {
        'trex': '🦖',
        'triceratops': '🦕',
        'stegosaurus': '🦕',
        'velociraptor': '🦖',
        'brachiosaurus': '🦕',
        'spinosaurus': '🦖'
    };
    return emojiMap[species.id] || '🦖';
}

function setupComparisonSlots() {
    for (let i = 1; i <= 3; i++) {
        const slot = document.getElementById(`comparison-slot-${i}`);
        if (slot) {
            slot.addEventListener('click', () => selectComparisonSlot(i));
        }
    }
}

function selectComparisonSlot(slotNumber) {
    if (selectedForComparison.length >= 3) {
        showToast('Máximo de 3 espécies atingido!', 'warning');
        return;
    }
    
    // Abrir modal de seleção ou destacar cards
    document.querySelectorAll('.species-card').forEach(card => {
        card.classList.add('selectable');
    });
    
    showToast('Clique em uma espécie para adicionar', 'info');
}

if (clearComparisonBtn) {
    clearComparisonBtn.addEventListener('click', () => {
        selectedForComparison = [];
        updateComparisonUI();
        renderSpecies();
    });
}

if (compareBtn) {
    compareBtn.addEventListener('click', () => {
        if (selectedForComparison.length >= 2) {
            const ids = selectedForComparison.join(',');
            window.location.href = `species-comparison.html?ids=${ids}`;
        }
    });
}

// ============================================
// ESTATÍSTICAS
// ============================================

function updateStats() {
    const periods = { triassic: 0, jurassic: 0, cretaceous: 0 };
    const diets = { carnivoro: 0, herbivoro: 0, onivoro: 0 };
    const sizes = { pequeno: 0, medio: 0, grande: 0, gigante: 0 };

    allSpecies.forEach(species => {
        // Período
        if (species.period) periods[species.period]++;

        // Dieta
        const diet = (species.diet || '').toLowerCase();
        if (diet.includes('carnívoro') || diet.includes('carnivoro')) {
            diets.carnivoro++;
        } else if (diet.includes('herbívoro') || diet.includes('herbivoro')) {
            diets.herbivoro++;
        } else if (diet.includes('onívoro') || diet.includes('onivoro')) {
            diets.onivoro++;
        }

        // Tamanho
        const length = parseFloat(species.size?.length) || 0;
        if (length < 3) sizes.pequeno++;
        else if (length < 10) sizes.medio++;
        else if (length < 20) sizes.grande++;
        else sizes.gigante++;
    });

    const totalSpecies = allSpecies.length;

    // Atualizar valores
    document.getElementById('stat-triassic-value').textContent = periods.triassic;
    document.getElementById('stat-jurassic-value').textContent = periods.jurassic;
    document.getElementById('stat-cretaceous-value').textContent = periods.cretaceous;

    document.getElementById('stat-carnivore-value').textContent = diets.carnivoro;
    document.getElementById('stat-herbivore-value').textContent = diets.herbivoro;
    document.getElementById('stat-omnivore-value').textContent = diets.onivoro;

    document.getElementById('stat-small-value').textContent = sizes.pequeno;
    document.getElementById('stat-medium-value').textContent = sizes.medio;
    document.getElementById('stat-large-value').textContent = sizes.grande;

    // Atualizar barras
    setBarWidth('stat-triassic-bar', (periods.triassic / totalSpecies) * 100);
    setBarWidth('stat-jurassic-bar', (periods.jurassic / totalSpecies) * 100);
    setBarWidth('stat-cretaceous-bar', (periods.cretaceous / totalSpecies) * 100);

    setBarWidth('stat-carnivore-bar', (diets.carnivoro / totalSpecies) * 100);
    setBarWidth('stat-herbivore-bar', (diets.herbivoro / totalSpecies) * 100);
    setBarWidth('stat-omnivore-bar', (diets.onivoro / totalSpecies) * 100);

    setBarWidth('stat-small-bar', (sizes.pequeno / totalSpecies) * 100);
    setBarWidth('stat-medium-bar', (sizes.medio / totalSpecies) * 100);
    setBarWidth('stat-large-bar', (sizes.grande / totalSpecies) * 100);
}

function setBarWidth(elementId, percentage) {
    const bar = document.getElementById(elementId);
    if (bar) {
        bar.style.width = `${Math.min(percentage, 100)}%`;
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

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#333'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// NO RESULTS
// ============================================

function showNoResults() {
    document.getElementById('no-results').style.display = 'block';
    document.getElementById('species-grid').style.display = 'none';
    document.getElementById('species-list').style.display = 'none';
    document.getElementById('species-table-wrapper').style.display = 'none';
}

function hideNoResults() {
    document.getElementById('no-results').style.display = 'none';
}

if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (periodFilter) periodFilter.value = '';
        if (cladeFilter) cladeFilter.value = '';
        if (dietFilter) dietFilter.value = '';
        if (sizeFilter) sizeFilter.value = '';
        if (sortFilter) sortFilter.value = 'name';
        applyFilters();
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
// LAZY LOADING OBSERVER
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    });
}

// ============================================
// ANIMAÇÕES
// ============================================

function addListAnimations() {
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
        
        .species-card {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
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
        
        .species-card:nth-child(1) { animation-delay: 0.05s; }
        .species-card:nth-child(2) { animation-delay: 0.1s; }
        .species-card:nth-child(3) { animation-delay: 0.15s; }
        .species-card:nth-child(4) { animation-delay: 0.2s; }
        .species-card:nth-child(5) { animation-delay: 0.25s; }
        .species-card:nth-child(6) { animation-delay: 0.3s; }
        .species-card:nth-child(7) { animation-delay: 0.35s; }
        .species-card:nth-child(8) { animation-delay: 0.4s; }
        
        .selectable {
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .selectable:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦖 Página de espécies carregada!');
    
    // Inicializar componentes
    initMobileMenu();
    addListAnimations();
    setupComparisonSlots();
    
    // Carregar dados
    loadAllSpecies();
    
    // Configurar paginação
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage('prev'));
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => changePage('next'));
    }
    
    // Rastrear visualização
    trackPageView();
});

function trackPageView() {
    console.log('📊 Página de espécies visualizada');
    // Aqui você pode integrar com analytics
}

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.goToSpecies = goToSpecies;
window.toggleComparison = toggleComparison;
window.setView = setView;
window.changePage = changePage;
window.selectComparisonSlot = selectComparisonSlot;

// ============================================
// FIM DO ARQUIVO
// ============================================