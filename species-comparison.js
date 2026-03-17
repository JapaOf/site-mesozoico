/* ============================================
   DINO EXPLORER - SPECIES-COMPARISON.JS
   Funcionalidade da página de comparação de espécies
   ============================================ */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let allSpecies = [];
let comparisonSpecies = [];
let chartInstances = {};

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
        
        console.log('✅ Espécies carregadas:', allSpecies.length);
        
        initializeComparison();
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showWarning('Erro ao carregar dados. Tente novamente mais tarde.');
    }
}

// ============================================
// INICIALIZAR COMPARAÇÃO
// ============================================

function initializeComparison() {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get('ids');

    if (!ids) {
        console.warn('⚠️ Nenhuma espécie selecionada para comparação');
        showWarning('Nenhuma espécie selecionada. Volte à listagem e escolha até 3 espécies para comparar.');
        return;
    }

    const speciesIds = ids.split(',').filter(id => id.trim() !== '');

    if (speciesIds.length === 0) {
        console.warn('⚠️ IDs de espécies inválidos');
        showWarning('IDs de espécies inválidos.');
        return;
    }

    if (speciesIds.length > 3) {
        console.warn('⚠️ Máximo de 3 espécies excedido');
        showWarning('Máximo de 3 espécies para comparação. Apenas as primeiras 3 serão consideradas.');
    }

    comparisonSpecies = speciesIds
        .slice(0, 3) // Limitar a 3 espécies
        .map(id => allSpecies.find(s => s.id === id.trim()))
        .filter(species => species !== undefined);

    if (comparisonSpecies.length === 0) {
        console.warn('⚠️ Nenhuma espécie encontrada');
        showWarning('Nenhuma espécie encontrada com os IDs fornecidos.');
        return;
    }

    if (comparisonSpecies.length < 2) {
        console.warn('⚠️ Selecione pelo menos 2 espécies');
        showWarning('Selecione pelo menos 2 espécies para comparação.');
        return;
    }

    console.log('✅ Comparando', comparisonSpecies.length, 'espécies:', 
        comparisonSpecies.map(s => s.name).join(' vs '));
    
    renderComparison();
    trackComparison();
}

// ============================================
// RENDERIZAR COMPARAÇÃO
// ============================================

function renderComparison() {
    // Esconder warning e mostrar container
    document.getElementById('comparison-warning').style.display = 'none';
    document.getElementById('comparison-container').style.display = 'block';

    // Atualizar contador
    document.getElementById('comparison-count-number').textContent = comparisonSpecies.length;

    // Renderizar todas as seções
    renderComparisonGrid();
    renderComparisonTable();
    renderComparisonCharts();
    renderInterestingFacts();
    renderScientificAnalysis();
    renderDiscoveryTimeline();
    renderSimilaritiesAndDifferences();
    
    // Inicializar animações
    addComparisonAnimations();
}

// ============================================
// OBTER URL DA IMAGEM
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
    return possiblePaths[0]; // Retorna o primeiro caminho como fallback
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
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            >
            <div class="image-placeholder" style="display: none; font-size: 48px;">🦖</div>
        </div>
    `;
}

// ============================================
// RENDERIZAR GRID VISUAL
// ============================================

function renderComparisonGrid() {
    const grid = document.getElementById('comparison-grid');
    if (!grid) return;
    
    grid.innerHTML = comparisonSpecies.map(species => `
        <div class="comparison-column">
            <div class="species-card">
                <div class="species-header">
                    <h3>${species.name}</h3>
                    <p class="species-scientific">${species.scientificName || ''}</p>
                </div>

                <div class="species-visual">
                    ${getImageHtml(species)}
                </div>

                <div class="species-stats">
                    <div class="stat-row">
                        <span class="stat-label">Período:</span>
                        <span class="stat-value">${formatPeriod(species.period)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Época:</span>
                        <span class="stat-value">${species.epoch || '-'}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Comprimento:</span>
                        <span class="stat-value">${species.size?.length || '-'}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Peso:</span>
                        <span class="stat-value">${species.size?.weight || '-'}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Dieta:</span>
                        <span class="stat-value diet-badge ${(species.diet || '').toLowerCase()}">${species.diet || '-'}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Locomoção:</span>
                        <span class="stat-value">${species.locomotion || '-'}</span>
                    </div>
                </div>

                <div class="species-actions">
                    <a href="species.html?id=${species.id}" class="btn btn-small">Ver detalhes</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// RENDERIZAR TABELA DE COMPARAÇÃO
// ============================================

function renderComparisonTable() {
    const thead = document.getElementById('comparison-table-header');
    const tbody = document.getElementById('comparison-table-body');

    if (!thead || !tbody) return;

    // Limpar e montar cabeçalho
    thead.innerHTML = '<th class="attribute-column">Atributo</th>' +
        comparisonSpecies.map(s => `<th>${s.name}</th>`).join('');

    // Dados para comparar
    const attributes = [
        {
            label: 'Nome Científico',
            key: 'scientificName',
            default: '-'
        },
        {
            label: 'Período',
            get: (s) => formatPeriod(s.period),
            default: '-'
        },
        {
            label: 'Época',
            key: 'epoch',
            default: '-'
        },
        {
            label: 'Data (Ma)',
            key: 'dateRange',
            default: '-'
        },
        {
            label: 'Clado',
            key: 'clade',
            default: '-'
        },
        {
            label: 'Localização',
            key: 'location',
            default: '-'
        },
        {
            label: 'Formação Geológica',
            key: 'formation',
            default: '-'
        },
        {
            label: 'Tipo de Rocha',
            key: 'rockType',
            default: '-'
        },
        {
            label: 'Ano de Descoberta',
            key: 'discoveryYear',
            default: '-'
        },
        {
            label: 'Descobridor',
            key: 'discoverer',
            default: '-'
        },
        {
            label: 'Tipo de Fóssil',
            key: 'fossilType',
            default: '-'
        },
        {
            label: 'Comprimento',
            get: (s) => s.size?.length || '-',
            default: '-'
        },
        {
            label: 'Altura',
            get: (s) => s.size?.height || '-',
            default: '-'
        },
        {
            label: 'Peso',
            get: (s) => s.size?.weight || '-',
            default: '-'
        },
        {
            label: 'Dieta',
            key: 'diet',
            default: '-'
        },
        {
            label: 'Locomoção',
            key: 'locomotion',
            default: '-'
        },
        {
            label: 'Habitat',
            key: 'habitat',
            default: '-'
        },
        {
            label: 'Clima',
            key: 'climate',
            default: '-'
        },
        {
            label: 'Continentes',
            key: 'continents',
            default: '-'
        },
        {
            label: 'Vegetação',
            key: 'vegetation',
            default: '-'
        }
    ];

    // Montar linhas
    tbody.innerHTML = attributes.map(attr => {
        const label = attr.label;
        const values = comparisonSpecies.map(species => {
            let value;
            if (attr.get) {
                value = attr.get(species);
            } else if (attr.key) {
                value = species[attr.key];
            }
            return value || attr.default;
        });

        return `
            <tr>
                <td class="attribute-column">${label}</td>
                ${values.map(v => `<td><span class="attribute-value">${v}</span></td>`).join('')}
            </tr>
        `;
    }).join('');
}

// ============================================
// FUNÇÕES DE EXTRAÇÃO DE VALORES
// ============================================

function extractLength(lengthStr) {
    if (!lengthStr) return 0;
    const match = lengthStr.match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

function extractWeight(weightStr) {
    if (!weightStr) return 0;
    // Remover pontos de milhar e converter
    const cleanStr = weightStr.replace(/\./g, '').replace(',', '.');
    const match = cleanStr.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    
    const weight = parseFloat(match[1]);
    // Converter para kg se estiver em toneladas
    if (weightStr.toLowerCase().includes('ton')) {
        return weight * 1000;
    }
    return weight;
}

// ============================================
// RENDERIZAR GRÁFICOS
// ============================================

function renderComparisonCharts() {
    renderSizeComparison();
    renderWeightComparison();
    renderPeriodComparison();
    renderDietComparison();
}

function renderSizeComparison() {
    const sizeBars = document.getElementById('size-bars');
    if (!sizeBars) return;
    
    const lengths = comparisonSpecies.map(s => extractLength(s.size?.length));
    const maxLength = Math.max(...lengths, 1);

    sizeBars.innerHTML = comparisonSpecies.map((species, index) => {
        const length = lengths[index];
        const percentage = (length / maxLength) * 100;
        const color = getSpeciesColor(index);

        return `
            <div class="bar-item">
                <span class="bar-label">${species.name}</span>
                <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%; background: ${color};">
                        ${length.toFixed(1)}m
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderWeightComparison() {
    const weightBars = document.getElementById('weight-bars');
    if (!weightBars) return;
    
    const weights = comparisonSpecies.map(s => extractWeight(s.size?.weight));
    const maxWeight = Math.max(...weights, 1);

    weightBars.innerHTML = comparisonSpecies.map((species, index) => {
        const weight = weights[index];
        const percentage = (weight / maxWeight) * 100;
        const color = getSpeciesColor(index);
        const displayWeight = weight > 1000 ? 
            (weight / 1000).toFixed(1) + ' ton' : 
            Math.round(weight).toLocaleString() + ' kg';

        return `
            <div class="bar-item">
                <span class="bar-label">${species.name}</span>
                <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%; background: ${color};">
                        ${displayWeight}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPeriodComparison() {
    const periodComparison = document.getElementById('period-comparison');
    if (!periodComparison) return;
    
    const periodOrder = {
        'triassic': 0,
        'jurassic': 1,
        'cretaceous': 2
    };

    periodComparison.innerHTML = comparisonSpecies.map(species => {
        const periodValue = periodOrder[species.period] || 0;
        const width = ((periodValue + 1) / 3) * 100;
        const color = getPeriodColor(species.period);

        return `
            <div class="period-item">
                <div class="period-label">
                    <span>${species.name}</span>
                    <span class="period-badge" style="background: ${color};">${formatPeriod(species.period)}</span>
                </div>
                <div class="period-timeline">
                    <div class="period-bar" style="width: ${width}%; background: ${color}33;">
                        <span>${species.dateRange || species.epoch || ''}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderDietComparison() {
    const dietComparison = document.getElementById('diet-comparison');
    if (!dietComparison) return;
    
    dietComparison.innerHTML = comparisonSpecies.map(species => `
        <div class="diet-item">
            <span class="diet-species">${species.name}</span>
            <span class="diet-badge ${(species.diet || '').toLowerCase()}">${species.diet || '-'}</span>
        </div>
    `).join('');
}

// ============================================
// FATOS INTERESSANTES
// ============================================

function renderInterestingFacts() {
    const factsGrid = document.getElementById('facts-grid');
    if (!factsGrid) return;
    
    const facts = comparisonSpecies.map(species => [
        {
            icon: '📅',
            text: `Descoberto em ${species.discoveryYear || '?'} por ${species.discoverer || 'desconhecido'}`
        },
        {
            icon: '📍',
            text: `Encontrado em ${species.location || 'local desconhecido'} (Formação ${species.formation || '?'})`
        },
        {
            icon: '📏',
            text: `Altura: ${species.size?.height || '?'}, Comprimento: ${species.size?.length || '?'}`
        },
        {
            icon: '🌡️',
            text: `Clima: ${species.climate || '?'}, Habitat: ${species.habitat || '?'}`
        }
    ]).flat();

    factsGrid.innerHTML = facts.map(fact => `
        <div class="fact-card">
            <div class="fact-icon">${fact.icon}</div>
            <div class="fact-text">${fact.text}</div>
        </div>
    `).join('');
}

// ============================================
// ANÁLISE CIENTÍFICA
// ============================================

function renderScientificAnalysis() {
    const analysisGrid = document.getElementById('analysis-grid');
    if (!analysisGrid) return;
    
    const analyses = [
        {
            icon: '🧬',
            title: 'Classificação Filogenética',
            content: generatePhylogeneticAnalysis()
        },
        {
            icon: '🌍',
            title: 'Adaptações Ecológicas',
            content: generateEcologicalAnalysis()
        },
        {
            icon: '🦴',
            title: 'Anatomia Comparada',
            content: generateAnatomyAnalysis()
        },
        {
            icon: '🧪',
            title: 'Controvérsias Científicas',
            content: generateControversyAnalysis()
        }
    ];

    analysisGrid.innerHTML = analyses.map(analysis => `
        <div class="analysis-card">
            <div class="analysis-icon">${analysis.icon}</div>
            <h4>${analysis.title}</h4>
            <p>${analysis.content}</p>
        </div>
    `).join('');
}

function generatePhylogeneticAnalysis() {
    if (comparisonSpecies.length < 2) return 'Dados insuficientes para análise filogenética.';
    
    const sameClade = comparisonSpecies.every(s => s.clade === comparisonSpecies[0].clade);
    
    if (sameClade) {
        return `Todas as espécies pertencem ao clado ${comparisonSpecies[0].clade}. ` +
               `Isso indica que compartilham um ancestral comum mais recente entre si do que com outros grupos.`;
    } else {
        const clades = [...new Set(comparisonSpecies.map(s => s.clade))];
        return `As espécies pertencem a diferentes clados: ${clades.join(', ')}. ` +
               `Isso indica que divergiram evolutivamente há milhões de anos.`;
    }
}

function generateEcologicalAnalysis() {
    const diets = [...new Set(comparisonSpecies.map(s => s.diet))];
    const habitats = [...new Set(comparisonSpecies.map(s => s.habitat))];
    
    return `Dietas: ${diets.join(', ')}. Habitats: ${habitats.join(', ')}. ` +
           `Essas diferenças ecológicas sugerem ocupação de nichos distintos.`;
}

function generateAnatomyAnalysis() {
    const locomotions = [...new Set(comparisonSpecies.map(s => s.locomotion))];
    
    return `Locomoção: ${locomoções.join(', ')}. ` +
           `As diferenças na estrutura corporal refletem adaptações a diferentes modos de vida.`;
}

function generateControversyAnalysis() {
    const controversies = comparisonSpecies
        .map(s => s.controversy)
        .filter(c => c && c !== '');
    
    if (controversies.length === 0) {
        return 'Não há controvérsias científicas significativas registradas para estas espécies.';
    }
    
    return controversies.join(' ');
}

// ============================================
// TIMELINE DE DESCOBERTA
// ============================================

function renderDiscoveryTimeline() {
    const timeline = document.getElementById('discovery-timeline');
    if (!timeline) return;
    
    const sortedByYear = [...comparisonSpecies]
        .filter(s => s.discoveryYear)
        .sort((a, b) => a.discoveryYear - b.discoveryYear);

    if (sortedByYear.length === 0) {
        timeline.innerHTML = '<p>Informações de descoberta não disponíveis.</p>';
        return;
    }

    timeline.innerHTML = sortedByYear.map(species => `
        <div class="timeline-item">
            <div class="timeline-year">${species.discoveryYear}</div>
            <div class="timeline-content">
                <h4>${species.name}</h4>
                <p><strong>Descobridor:</strong> ${species.discoverer || 'Desconhecido'}</p>
                <p><strong>Local:</strong> ${species.location || 'Desconhecido'}</p>
                <p><strong>Formação:</strong> ${species.formation || 'Desconhecida'}</p>
            </div>
        </div>
    `).join('');
}

// ============================================
// SIMILARIDADES E DIFERENÇAS
// ============================================

function renderSimilaritiesAndDifferences() {
    const similaritiesList = document.getElementById('similarities-list');
    const differencesList = document.getElementById('differences-list');

    if (!similaritiesList || !differencesList) return;

    const similarities = [];
    const differences = [];

    if (comparisonSpecies.length >= 2) {
        const s1 = comparisonSpecies[0];
        const s2 = comparisonSpecies[1];

        // Período
        if (s1.period === s2.period) {
            similarities.push(`Ambos viveram no período ${formatPeriod(s1.period)}`);
        } else {
            differences.push(`${s1.name} viveu no ${formatPeriod(s1.period)}, enquanto ${s2.name} viveu no ${formatPeriod(s2.period)}`);
        }

        // Dieta
        if (s1.diet === s2.diet) {
            similarities.push(`Ambos eram ${s1.diet.toLowerCase()}`);
        } else {
            differences.push(`${s1.name} era ${s1.diet.toLowerCase()}, enquanto ${s2.name} era ${s2.diet.toLowerCase()}`);
        }

        // Localização
        if (s1.location === s2.location) {
            similarities.push(`Ambos foram descobertos em ${s1.location}`);
        } else {
            differences.push(`${s1.name} foi descoberto em ${s1.location}, enquanto ${s2.name} foi descoberto em ${s2.location}`);
        }

        // Locomoção
        if (s1.locomotion === s2.locomotion) {
            similarities.push(`Ambos eram ${s1.locomotion.toLowerCase()}`);
        } else {
            differences.push(`${s1.name} era ${s1.locomotion.toLowerCase()}, enquanto ${s2.name} era ${s2.locomotion.toLowerCase()}`);
        }

        // Tamanho
        const len1 = extractLength(s1.size?.length);
        const len2 = extractLength(s2.size?.length);
        
        if (len1 > 0 && len2 > 0) {
            if (Math.abs(len1 - len2) < 3) {
                similarities.push(`Ambos tinham tamanho similar (aproximadamente ${Math.round((len1 + len2) / 2)}m)`);
            } else {
                const maior = len1 > len2 ? s1.name : s2.name;
                const menor = len1 > len2 ? s2.name : s1.name;
                const diferenca = Math.abs(len1 - len2);
                differences.push(`${maior} era ${diferenca.toFixed(1)}m maior que ${menor}`);
            }
        }
    }

    if (comparisonSpecies.length === 3) {
        const s3 = comparisonSpecies[2];
        
        // Verificar se todas têm a mesma dieta
        if (comparisonSpecies.every(s => s.diet === comparisonSpecies[0].diet)) {
            similarities.push(`Todos os três eram ${comparisonSpecies[0].diet.toLowerCase()}`);
        }

        // Verificar períodos comuns
        const periods = new Set(comparisonSpecies.map(s => s.period));
        if (periods.size === 1) {
            similarities.push(`Todos os três viveram no período ${formatPeriod(comparisonSpecies[0].period)}`);
        }
    }

    similaritiesList.innerHTML = similarities.length > 0
        ? similarities.map(s => `<li><span class="similarity-icon">✓</span> ${s}</li>`).join('')
        : '<li class="no-items">Nenhuma similaridade significativa encontrada</li>';

    differencesList.innerHTML = differences.length > 0
        ? differences.map(d => `<li><span class="difference-icon">✗</span> ${d}</li>`).join('')
        : '<li class="no-items">Nenhuma diferença significativa encontrada</li>';
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

function getSpeciesColor(index) {
    const colors = ['#d32f2f', '#388e3c', '#1976d2'];
    return colors[index] || '#666';
}

function getPeriodColor(period) {
    const colors = {
        'triassic': '#8B4513',
        'jurassic': '#228B22',
        'cretaceous': '#4169E1'
    };
    return colors[period] || '#666';
}

function showWarning(message = 'Nenhuma comparação selecionada.') {
    const warning = document.getElementById('comparison-warning');
    const container = document.getElementById('comparison-container');
    
    if (warning) {
        warning.style.display = 'block';
        const messageEl = warning.querySelector('p');
        if (messageEl) messageEl.textContent = message;
    }
    
    if (container) container.style.display = 'none';
}

// ============================================
// IMPRESSÃO
// ============================================

function initPrintButton() {
    const printBtn = document.getElementById('print-comparison');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const pageTitle = `Comparação de ${comparisonSpecies.length} Espécies - Dino Explorer`;
            const originalTitle = document.title;
            document.title = pageTitle;
            
            window.print();
            
            document.title = originalTitle;
        });
    }
}

// ============================================
// NOVA COMPARAÇÃO
// ============================================

function initResetButton() {
    const resetBtn = document.getElementById('reset-comparison');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Deseja iniciar uma nova comparação? Você será redirecionado para a listagem de espécies.')) {
                window.location.href = 'species-list.html';
            }
        });
    }
}

// ============================================
// COMPARTILHAMENTO
// ============================================

function generateShareLink() {
    const ids = comparisonSpecies.map(s => s.id).join(',');
    const baseUrl = window.location.origin;
    return `${baseUrl}/species-comparison.html?ids=${ids}`;
}

function copyShareLink() {
    const link = generateShareLink();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('Link de comparação copiado!');
        }).catch(() => {
            prompt('Link de comparação:', link);
        });
    } else {
        prompt('Link de comparação:', link);
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
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ============================================
// TEMAS DE ANIMAÇÃO
// ============================================

function addComparisonAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                width: 0;
                opacity: 0;
            }
            to {
                width: var(--target-width);
                opacity: 1;
            }
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, 20px); }
            20% { opacity: 1; transform: translate(-50%, 0); }
            80% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        
        .bar {
            animation: slideIn 0.8s ease-out forwards;
        }
        
        .comparison-column {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
        }
        
        .comparison-column:nth-child(1) { animation-delay: 0.1s; }
        .comparison-column:nth-child(2) { animation-delay: 0.2s; }
        .comparison-column:nth-child(3) { animation-delay: 0.3s; }
        
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
    `;
    document.head.appendChild(style);
}

// ============================================
// ATALHOS DE TECLADO
// ============================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + P: Imprimir
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            document.getElementById('print-comparison')?.click();
        }

        // Alt + R: Nova comparação
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            document.getElementById('reset-comparison')?.click();
        }

        // Alt + C: Copiar link
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            copyShareLink();
        }
    });
}

// ============================================
// RASTREAMENTO DE COMPARAÇÕES
// ============================================

function trackComparison() {
    const comparisonData = {
        timestamp: new Date().toISOString(),
        speciesCount: comparisonSpecies.length,
        species: comparisonSpecies.map(s => ({
            id: s.id,
            name: s.name,
            period: s.period,
            diet: s.diet
        }))
    };

    // Armazenar no localStorage para análise posterior
    try {
        let comparisons = JSON.parse(localStorage.getItem('dinoComparisons')) || [];
        comparisons.push(comparisonData);
        
        // Manter apenas os últimos 20 registros
        if (comparisons.length > 20) {
            comparisons = comparisons.slice(-20);
        }
        
        localStorage.setItem('dinoComparisons', JSON.stringify(comparisons));
        console.log('📊 Comparação rastreada:', comparisonData);
    } catch (error) {
        console.warn('Não foi possível rastrear comparação:', error);
    }
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
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦖 Página de comparação carregada!');
    
    // Inicializar componentes
    initMobileMenu();
    initPrintButton();
    initResetButton();
    initKeyboardShortcuts();
    
    // Carregar dados
    loadAllSpecies();
    
    // Adicionar botão de compartilhamento
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-outline share-btn';
    shareBtn.innerHTML = '🔗 Compartilhar';
    shareBtn.onclick = copyShareLink;
    shareBtn.style.marginLeft = '10px';
    
    const headerActions = document.querySelector('.comparison-header-actions');
    if (headerActions) {
        headerActions.appendChild(shareBtn);
    }
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.copyShareLink = copyShareLink;
window.showToast = showToast;

// ============================================
// FIM DO ARQUIVO
// ============================================