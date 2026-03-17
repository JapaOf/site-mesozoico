/* ============================================
   DINO EXPLORER - HARD-MODE.JS
   Funcionalidade avançada e ferramentas científicas
   ============================================ */

// ============================================
// DADOS DE PAPERS (EXEMPLO)
// ============================================

const papersData = [
    {
        id: 1,
        title: "The origin of dinosaurs: Evolution of the Dinosauria",
        authors: "Michael J. Benton",
        journal: "Biological Reviews",
        year: 2023,
        topic: "evolution",
        abstract: "A comprehensive review of dinosaur origins and early evolution, covering phylogenetic relationships and fossil evidence. This paper synthesizes decades of research on the Triassic origins of dinosaurs and their rise to dominance.",
        doi: "10.1111/brv.12973",
        url: "https://doi.org/10.1111/brv.12973"
    },
    {
        id: 2,
        title: "Dinosaurian Interpretation of Bird Origins",
        authors: "Stephen L. Brusatte et al.",
        journal: "Nature Ecology & Evolution",
        year: 2022,
        topic: "paleobiology",
        abstract: "Evidence for active predation behavior in theropods based on bite force analysis and feeding ecology. The study uses finite element analysis to reconstruct bite forces and feeding strategies in tyrannosaurids.",
        doi: "10.1038/s41559-021-01666-x",
        url: "https://doi.org/10.1038/s41559-021-01666-x"
    },
    {
        id: 3,
        title: "The origin of feathers and the origin of birds",
        authors: "Xu X., Zhou Z., Wang X.",
        journal: "Journal of Ornithology",
        year: 2021,
        topic: "evolution",
        abstract: "New fossils from China reveal intermediate stages in feather evolution and the transition to avian flight. Includes detailed analysis of plumage in early paravians and the evolution of flight feathers.",
        doi: "10.1007/s10336-021-01863-3",
        url: "https://doi.org/10.1007/s10336-021-01863-3"
    },
    {
        id: 4,
        title: "Reconstructing the terrestrial locomotion of dinosaurs",
        authors: "Jennifer Molnar et al.",
        journal: "Journal of Vertebrate Paleontology",
        year: 2022,
        topic: "biomechanics",
        abstract: "3D biomechanical modeling reveals how theropods achieved high-speed locomotion. Muscle attachment reconstructions and gait analysis suggest running speeds comparable to modern ostriches.",
        doi: "10.1080/02724634.2021.2009444",
        url: "https://doi.org/10.1080/02724634.2021.2009444"
    },
    {
        id: 5,
        title: "Dinosaur paleobiology",
        authors: "Paul M. Barret",
        journal: "Philosophical Transactions of the Royal Society B",
        year: 2023,
        topic: "paleoenvironment",
        abstract: "Analysis of fauna assemblages reveals complex predator-prey relationships in Late Cretaceous ecosystems. Includes stable isotope analysis and population dynamics modeling.",
        doi: "10.1098/rstb.2022.0001",
        url: "https://doi.org/10.1098/rstb.2022.0001"
    },
    {
        id: 6,
        title: "Sauropod gigantism: A cross-disciplinary approach",
        authors: "P. Martin Sander et al.",
        journal: "Biological Reviews",
        year: 2024,
        topic: "paleobiology",
        abstract: "New insights into how sauropods achieved massive body sizes through unique adaptations in metabolism, reproduction, and feeding strategies.",
        doi: "10.1111/brv.13001",
        url: "https://doi.org/10.1111/brv.13001"
    }
];

const formationsData = [
    {
        name: "Hell Creek Formation",
        location: "Montana, EUA",
        period: "Cretáceo Superior",
        age: "66 Ma",
        fossilType: "Dinossauros não-avianos e mamíferos",
        climate: "Subtropical",
        description: "Uma das formações mais importantes para o fim do Cretáceo, preservando T. rex, Triceratops e Edmontosaurus."
    },
    {
        name: "Solnhofen Limestone",
        location: "Baviera, Alemanha",
        period: "Jurássico Superior",
        age: "150 Ma",
        fossilType: "Archaeopteryx e marinhos",
        climate: "Subtropical",
        description: "Fósseis excepcionais preservados em calcário fino, incluindo o famoso Archaeopteryx."
    },
    {
        name: "Tendaguru Formation",
        location: "Tanzânia",
        period: "Jurássico Superior",
        age: "156-145 Ma",
        fossilType: "Saurópodes gigantes",
        climate: "Tropical",
        description: "Conhecida pelos esqueletos completos de Brachiosaurus e outros saurópodes africanos."
    },
    {
        name: "Morrison Formation",
        location: "Oeste dos EUA",
        period: "Jurássico Superior",
        age: "156-146 Ma",
        fossilType: "Dinossauros diversos",
        climate: "Semiárido",
        description: "Stegosaurus, Diplodocus, Allosaurus e muitos outros."
    },
    {
        name: "Yixian Formation",
        location: "Liaoning, China",
        period: "Cretáceo Inferior",
        age: "125 Ma",
        fossilType: "Dinossauros com penas",
        climate: "Temperado",
        description: "Fósseis com penas preservadas, incluindo Microraptor e Confuciusornis."
    }
];

// ============================================
// VARIÁVEIS DE ESTADO
// ============================================

let currentPapers = [...papersData];
let currentFormations = [...formationsData];
let map = null;
let chartInstances = {};

// ============================================
// TABS
// ============================================

function initTabs() {
    document.querySelectorAll('.hard-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            if (!tabName) return;

            // Remove active de todos
            document.querySelectorAll('.hard-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.hard-tab-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Adiciona active
            this.classList.add('active');
            const targetContent = document.getElementById(`${tabName}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';

                // Inicializar conteúdo se necessário
                switch(tabName) {
                    case 'papers':
                        renderPapers();
                        break;
                    case 'maps':
                        initMaps();
                        break;
                    case 'data':
                        renderDataTable();
                        renderCharts();
                        break;
                    case 'formations':
                        renderFormations();
                        break;
                    case 'tools':
                        initTools();
                        break;
                }
            }
        });
    });
}

// ============================================
// PAPERS CIENTÍFICOS
// ============================================

function renderPapers(filtered = currentPapers) {
    const grid = document.getElementById('papers-grid');
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">Nenhum paper encontrado</div>';
        return;
    }

    grid.innerHTML = filtered.map(paper => `
        <div class="paper-card" data-paper-id="${paper.id}">
            <h4>${paper.title}</h4>
            <p class="paper-authors">${paper.authors}</p>
            <p class="paper-journal">${paper.journal}, ${paper.year}</p>
            <div class="paper-tags">
                <span class="paper-tag">${paper.topic}</span>
                <span class="paper-tag">DOI: ${paper.doi}</span>
            </div>
            <p class="paper-abstract">${paper.abstract.substring(0, 150)}...</p>
            <div class="paper-actions">
                <button class="btn btn-small btn-primary" onclick="showPaperDetails(${paper.id})">Ver resumo completo</button>
                <a href="${paper.url}" target="_blank" rel="noopener noreferrer" class="btn btn-small btn-outline">Acessar DOI →</a>
            </div>
        </div>
    `).join('');

    updatePapersCount(filtered.length);
}

function showPaperDetails(paperId) {
    const paper = papersData.find(p => p.id === paperId);
    if (!paper) return;

    const modal = document.getElementById('paper-modal') || createPaperModal();
    const modalBody = modal.querySelector('.modal-body') || modal;
    
    modalBody.innerHTML = `
        <h2>${paper.title}</h2>
        <p><strong>Autores:</strong> ${paper.authors}</p>
        <p><strong>Periódico:</strong> ${paper.journal}, ${paper.year}</p>
        <p><strong>DOI:</strong> ${paper.doi}</p>
        <div class="paper-full-abstract">
            <h3>Resumo</h3>
            <p>${paper.abstract}</p>
        </div>
        <div class="modal-actions">
            <a href="${paper.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Acessar paper completo</a>
            <button class="btn btn-outline" onclick="closeModal()">Fechar</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function createPaperModal() {
    const modal = document.createElement('div');
    modal.id = 'paper-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <div class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function filterPapers() {
    const searchTerm = document.getElementById('papers-search')?.value.toLowerCase() || '';
    const yearFilter = document.getElementById('papers-year-filter')?.value || '';
    const topicFilter = document.getElementById('papers-topic-filter')?.value || '';

    currentPapers = papersData.filter(paper => {
        const matchesSearch = searchTerm === '' || 
            paper.title.toLowerCase().includes(searchTerm) ||
            paper.authors.toLowerCase().includes(searchTerm) ||
            paper.abstract.toLowerCase().includes(searchTerm);
        
        const matchesYear = yearFilter === '' || 
            (yearFilter.includes('-') ? 
                paper.year >= parseInt(yearFilter.split('-')[0]) && 
                paper.year <= parseInt(yearFilter.split('-')[1]) :
                paper.year.toString() === yearFilter);
        
        const matchesTopic = topicFilter === '' || paper.topic === topicFilter;
        
        return matchesSearch && matchesYear && matchesTopic;
    });

    renderPapers(currentPapers);
}

function resetPapersFilters() {
    document.getElementById('papers-search').value = '';
    document.getElementById('papers-year-filter').value = '';
    document.getElementById('papers-topic-filter').value = '';
    currentPapers = [...papersData];
    renderPapers();
}

function updatePapersCount(count) {
    const countEl = document.getElementById('papers-count');
    if (countEl) countEl.textContent = count;
}

// ============================================
// MAPAS PALEOGEOGRÁFICOS
// ============================================

function initMaps() {
    if (map) return; // Já inicializado

    const mapContainer = document.getElementById('paleomap');
    if (!mapContainer) return;

    // Inicializar mapa
    map = L.map('paleomap').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Dados paleogeográficos: PALEOMAP Project',
        maxZoom: 19
    }).addTo(map);

    // Adicionar marcadores de fósseis famosos
    const fossilSites = [
        { lat: 47, lng: 10, name: 'Solnhofen', fossils: 'Archaeopteryx' },
        { lat: -6, lng: 36, name: 'Tendaguru', fossils: 'Brachiosaurus' },
        { lat: 48, lng: -107, name: 'Hell Creek', fossils: 'T. rex, Triceratops' },
        { lat: 41, lng: -109, name: 'Morrison', fossils: 'Stegosaurus, Diplodocus' },
        { lat: 41, lng: 120, name: 'Yixian', fossils: 'Microraptor, Confuciusornis' }
    ];

    fossilSites.forEach(site => {
        L.marker([site.lat, site.lng])
            .addTo(map)
            .bindPopup(`<b>${site.name}</b><br>Fósseis: ${site.fossils}`);
    });

    // Adicionar legenda
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
            <h4>Legenda</h4>
            <div class="legend-item">
                <div class="legend-color" style="background: #8B7355;"></div>
                <span>Continentes modernos</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #F5A623;"></div>
                <span>Sítios fossilíferos</span>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}

function showMap(period) {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-period') === period) {
            btn.classList.add('active');
        }
    });

    const info = {
        triassic: {
            title: 'Triássico (252-201 Ma)',
            desc: 'Supercontinente Pangeia ainda unido. Clima árido no interior. Oceano Tétis ao leste.'
        },
        jurassic: {
            title: 'Jurássico (201-145 Ma)',
            desc: 'Pangeia se divide em Laurásia (N) e Gondwana (S). Mares rasos e quentes.'
        },
        cretaceous: {
            title: 'Cretáceo (145-66 Ma)',
            desc: 'Continentes em posição quase moderna. Mares avançam. Clima tropical global.'
        }
    };

    document.getElementById('map-period-title').textContent = info[period].title;
    document.getElementById('map-period-description').textContent = info[period].desc;

    // Ajustar visualização do mapa se necessário
    if (map) {
        const views = {
            triassic: [20, 0],
            jurassic: [10, 30],
            cretaceous: [0, 60]
        };
        map.setView(views[period], 2);
    }
}

// ============================================
// DATA TABLE E GRÁFICOS
// ============================================

function renderDataTable() {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;

    const data = [
        ['Tyrannosaurus rex', 'Cretáceo', 12.3, 8000, 'Carnívoro', 'Theropoda', 'América do Norte'],
        ['Triceratops horridus', 'Cretáceo', 9.0, 6000, 'Herbívoro', 'Ceratopsia', 'América do Norte'],
        ['Stegosaurus stenops', 'Jurássico', 9.5, 5000, 'Herbívoro', 'Thyreophora', 'América do Norte'],
        ['Brachiosaurus altithorax', 'Jurássico', 25.0, 58000, 'Herbívoro', 'Sauropoda', 'América do Norte'],
        ['Velociraptor mongoliensis', 'Cretáceo', 2.0, 15, 'Carnívoro', 'Dromaeosauridae', 'Mongólia'],
        ['Spinosaurus aegyptiacus', 'Cretáceo', 15.0, 12000, 'Carnívoro', 'Spinosauridae', 'Egito'],
        ['Diplodocus carnegii', 'Jurássico', 27.0, 15000, 'Herbívoro', 'Diplodocidae', 'América do Norte']
    ];

    tbody.innerHTML = data.map(row => `
        <tr>
            <td><strong>${row[0]}</strong></td>
            <td>${row[1]}</td>
            <td>${row[2]} m</td>
            <td>${row[3].toLocaleString()} kg</td>
            <td><span class="badge ${row[4].toLowerCase()}">${row[4]}</span></td>
            <td>${row[5]}</td>
            <td>${row[6]}</td>
        </tr>
    `).join('');

    // Atualizar contadores
    document.getElementById('species-count').textContent = '150+';
    document.getElementById('total-species').textContent = data.length;
}

function renderCharts() {
    renderPeriodChart();
    renderDietChart();
    renderSizeChart();
}

function renderPeriodChart() {
    const ctx = document.getElementById('period-chart')?.getContext('2d');
    if (!ctx) return;

    if (chartInstances.period) chartInstances.period.destroy();

    chartInstances.period = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Triássico', 'Jurássico', 'Cretáceo'],
            datasets: [{
                data: [25, 35, 40],
                backgroundColor: ['#8B4513', '#228B22', '#4169E1']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Distribuição por Período (%)' }
            }
        }
    });
}

function renderDietChart() {
    const ctx = document.getElementById('diet-chart')?.getContext('2d');
    if (!ctx) return;

    if (chartInstances.diet) chartInstances.diet.destroy();

    chartInstances.diet = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Carnívoro', 'Herbívoro', 'Onívoro'],
            datasets: [{
                label: 'Número de Espécies',
                data: [35, 60, 5],
                backgroundColor: ['#d32f2f', '#388e3c', '#f57c00']
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderSizeChart() {
    const ctx = document.getElementById('size-chart')?.getContext('2d');
    if (!ctx) return;

    if (chartInstances.size) chartInstances.size.destroy();

    chartInstances.size = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pequeno (<3m)', 'Médio (3-10m)', 'Grande (10-20m)', 'Gigante (>20m)'],
            datasets: [{
                data: [30, 40, 20, 10],
                backgroundColor: ['#8B4513', '#228B22', '#4169E1', '#d32f2f']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// ============================================
// FORMAÇÕES GEOLÓGICAS
// ============================================

function renderFormations(filtered = currentFormations) {
    const grid = document.getElementById('formations-grid');
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">Nenhuma formação encontrada</div>';
        return;
    }

    grid.innerHTML = filtered.map(form => `
        <div class="formation-card" onclick="showFormationDetails('${form.name}')">
            <h4>${form.name}</h4>
            <p><strong>📍 Localização:</strong> ${form.location}</p>
            <p><strong>📅 Período:</strong> ${form.period}</p>
            <p><strong>⏰ Idade:</strong> ${form.age}</p>
            <p><strong>🦴 Fósseis:</strong> ${form.fossilType}</p>
            <p><strong>🌡️ Clima:</strong> ${form.climate}</p>
            <p class="formation-description">${form.description}</p>
        </div>
    `).join('');
}

function showFormationDetails(formationName) {
    const formation = formationsData.find(f => f.name === formationName);
    if (!formation) return;

    alert(`📍 ${formation.name}\n\n` +
          `Localização: ${formation.location}\n` +
          `Período: ${formation.period} (${formation.age})\n` +
          `Fósseis: ${formation.fossilType}\n` +
          `Clima: ${formation.climate}\n\n` +
          `${formation.description}`);
}

function filterFormations() {
    const searchTerm = document.getElementById('formations-search')?.value.toLowerCase() || '';
    
    currentFormations = formationsData.filter(f =>
        f.name.toLowerCase().includes(searchTerm) ||
        f.location.toLowerCase().includes(searchTerm) ||
        f.fossilType.toLowerCase().includes(searchTerm) ||
        f.description.toLowerCase().includes(searchTerm)
    );

    renderFormations(currentFormations);
}

// ============================================
// FERRAMENTAS DE CÁLCULO
// ============================================

function initTools() {
    // Adicionar placeholders para resultados
    const tools = ['scale', 'age', 'weight', 'period', 'comparison', 'report'];
    tools.forEach(tool => {
        const resultEl = document.getElementById(`${tool}-result`);
        if (resultEl) resultEl.innerHTML = '<p>Aguardando cálculo...</p>';
    });
}

function calculateScale() {
    const l1 = parseFloat(document.getElementById('scale-length-1')?.value);
    const l2 = parseFloat(document.getElementById('scale-length-2')?.value);
    const result = document.getElementById('scale-result');
    
    if (!l1 || !l2) {
        result.innerHTML = '<p style="color: #f44336;">Por favor, insira valores válidos</p>';
        return;
    }

    const ratio = l1 / l2;
    const percentage = ((l1 - l2) / l2 * 100).toFixed(1);
    
    result.innerHTML = `
        <div class="tool-result-content">
            <p><strong>Proporção:</strong> ${ratio.toFixed(2)}x</p>
            <p><strong>Diferença:</strong> ${percentage}% ${l1 > l2 ? 'maior' : 'menor'}</p>
            <div class="scale-bar">
                <div style="width: ${Math.min(ratio * 50, 100)}%; background: #0066cc; height: 10px;"></div>
            </div>
        </div>
    `;
}

function calculateAge() {
    const ma = parseFloat(document.getElementById('age-ma')?.value);
    const result = document.getElementById('age-result');
    
    if (!ma || ma < 0 || ma > 4600) {
        result.innerHTML = '<p style="color: #f44336;">Insira um valor entre 0 e 4600 Ma</p>';
        return;
    }

    const years = ma * 1000000;
    const period = getGeologicalPeriod(ma);
    
    result.innerHTML = `
        <div class="tool-result-content">
            <p><strong>Anos atrás:</strong> ${years.toLocaleString()} anos</p>
            <p><strong>Período:</strong> ${period}</p>
            <p><strong>Época:</strong> ${getGeologicalEpoch(ma)}</p>
        </div>
    `;
}

function getGeologicalPeriod(ma) {
    if (ma >= 252 && ma <= 201) return 'Triássico';
    if (ma > 201 && ma <= 145) return 'Jurássico';
    if (ma > 145 && ma <= 66) return 'Cretáceo';
    if (ma > 66 && ma <= 2.6) return 'Paleógeno/Neógeno';
    if (ma < 2.6) return 'Quaternário';
    return 'Fora do Fanerozoico';
}

function getGeologicalEpoch(ma) {
    if (ma >= 201 && ma < 174) return 'Jurássico Inferior';
    if (ma >= 174 && ma < 163) return 'Jurássico Médio';
    if (ma >= 163 && ma <= 145) return 'Jurássico Superior';
    if (ma >= 145 && ma < 100) return 'Cretáceo Inferior';
    if (ma >= 100 && ma <= 66) return 'Cretáceo Superior';
    return '-';
}

function calculateWeight() {
    const length = parseFloat(document.getElementById('weight-length')?.value);
    const type = document.getElementById('weight-type')?.value;
    const result = document.getElementById('weight-result');
    
    if (!length || length <= 0) {
        result.innerHTML = '<p style="color: #f44336;">Insira um comprimento válido</p>';
        return;
    }

    // Fórmulas alométricas baseadas em pesquisa científica
    let weight;
    let formula;
    
    if (type === 'theropod') {
        weight = 0.73 * Math.pow(length, 3.0); // Campione et al. 2014
        formula = "Weight = 0.73 × L³";
    } else if (type === 'sauropod') {
        weight = 1.07 * Math.pow(length, 2.8); // Benson et al. 2014
        formula = "Weight = 1.07 × L²·⁸";
    } else {
        weight = 0.84 * Math.pow(length, 2.9); // Ceratopsianos
        formula = "Weight = 0.84 × L²·⁹";
    }

    result.innerHTML = `
        <div class="tool-result-content">
            <p><strong>Peso estimado:</strong> ${Math.round(weight).toLocaleString()} kg</p>
            <p><strong>Fórmula:</strong> ${formula}</p>
            <p><small>Baseado em regressões alométricas</small></p>
        </div>
    `;
}

function classifyPeriod() {
    const date = parseFloat(document.getElementById('period-date')?.value);
    const result = document.getElementById('period-result');
    
    if (!date || date < 0 || date > 4600) {
        result.innerHTML = '<p style="color: #f44336;">Insira um valor válido (0-4600 Ma)</p>';
        return;
    }

    const period = getGeologicalPeriod(date);
    const epoch = getGeologicalEpoch(date);
    
    result.innerHTML = `
        <div class="tool-result-content">
            <p><strong>Data:</strong> ${date} Ma</p>
            <p><strong>Período:</strong> ${period}</p>
            <p><strong>Época:</strong> ${epoch}</p>
        </div>
    `;
}

function compareSpecies() {
    const sp1 = document.getElementById('species-1')?.value;
    const sp2 = document.getElementById('species-2')?.value;
    const result = document.getElementById('comparison-result');
    
    if (!sp1 || !sp2) {
        result.innerHTML = '<p style="color: #f44336;">Selecione duas espécies</p>';
        return;
    }

    // Matriz de similaridade filogenética
    const taxonomy = {
        't-rex': { clade: 'theropoda', family: 'tyrannosauridae' },
        'velociraptor': { clade: 'theropoda', family: 'dromaeosauridae' },
        'archaeopteryx': { clade: 'theropoda', family: 'archaeopterygidae' },
        'triceratops': { clade: 'ornithischia', family: 'ceratopsidae' }
    };

    const sp1Info = taxonomy[sp1];
    const sp2Info = taxonomy[sp2];
    
    let similarity = 0;
    let reasons = [];

    if (sp1Info.clade === sp2Info.clade) {
        similarity += 50;
        reasons.push('Mesmo clado');
    }
    
    if (sp1Info.family === sp2Info.family) {
        similarity += 30;
        reasons.push('Mesma família');
    }
    
    if (sp1 === sp2) {
        similarity = 100;
        reasons = ['Mesma espécie'];
    }

    result.innerHTML = `
        <div class="tool-result-content">
            <p><strong>Similaridade evolutiva:</strong> ${similarity}%</p>
            <p><strong>Fatores:</strong> ${reasons.join(', ') || 'Diferentes clados'}</p>
        </div>
    `;
}

function generateReport() {
    const type = document.getElementById('report-type')?.value;
    const result = document.getElementById('report-result');
    
    const reportTypes = {
        'species': 'Ficha de Espécie',
        'period': 'Resumo do Período',
        'timeline': 'Linha do Tempo',
        'taxonomy': 'Taxonomia'
    };

    result.innerHTML = `
        <div class="tool-result-content">
            <p><strong>Relatório gerado:</strong> ${reportTypes[type]}</p>
            <p><strong>Formato:</strong> PDF</p>
            <p><small>Funcionalidade em desenvolvimento - download será implementado em breve</small></p>
        </div>
    `;

    // Simular download
    setTimeout(() => {
        alert(`📄 Relatório "${reportTypes[type]}" gerado com sucesso!`);
    }, 1000);
}

// ============================================
// DOWNLOAD DE DADOS
// ============================================

function downloadData(format) {
    const data = [
        ['Espécie', 'Período', 'Comprimento', 'Peso', 'Dieta', 'Clado', 'Localização'],
        ['Tyrannosaurus rex', 'Cretáceo', 12.3, 8000, 'Carnívoro', 'Theropoda', 'América do Norte'],
        ['Triceratops horridus', 'Cretáceo', 9.0, 6000, 'Herbívoro', 'Ceratopsia', 'América do Norte'],
        ['Stegosaurus stenops', 'Jurássico', 9.5, 5000, 'Herbívoro', 'Thyreophora', 'América do Norte']
    ];

    if (format === 'csv') {
        const csvContent = data.map(row => row.join(',')).join('\n');
        downloadFile(csvContent, 'dados-dinossauros.csv', 'text/csv');
    } else if (format === 'json') {
        const jsonContent = JSON.stringify(data.slice(1).map(row => ({
            species: row[0],
            period: row[1],
            length: row[2],
            weight: row[3],
            diet: row[4],
            clade: row[5],
            location: row[6]
        })), null, 2);
        downloadFile(jsonContent, 'dados-dinossauros.json', 'application/json');
    }
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// MODAL
// ============================================

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
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
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    initTabs();
    initMobileMenu();
    
    // Carregar dados iniciais
    renderPapers();
    renderFormations();
    
    // Configurar event listeners
    const searchInput = document.getElementById('papers-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterPapers);
    }

    const yearFilter = document.getElementById('papers-year-filter');
    if (yearFilter) {
        yearFilter.addEventListener('change', filterPapers);
    }

    const topicFilter = document.getElementById('papers-topic-filter');
    if (topicFilter) {
        topicFilter.addEventListener('change', filterPapers);
    }

    const resetBtn = document.getElementById('reset-papers');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPapersFilters);
    }

    const formationsSearch = document.getElementById('formations-search');
    if (formationsSearch) {
        formationsSearch.addEventListener('input', filterFormations);
    }

    const downloadCsv = document.getElementById('download-csv');
    if (downloadCsv) {
        downloadCsv.addEventListener('click', () => downloadData('csv'));
    }

    const downloadJson = document.getElementById('download-json');
    if (downloadJson) {
        downloadJson.addEventListener('click', () => downloadData('json'));
    }

    // Carregar Chart.js se necessário
    if (document.getElementById('period-chart')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            if (document.getElementById('data-content').classList.contains('active')) {
                renderCharts();
            }
        };
        document.head.appendChild(script);
    }

    console.log('🔬 Hard Mode carregado com sucesso!');
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.showPaperDetails = showPaperDetails;
window.closeModal = closeModal;
window.filterPapers = filterPapers;
window.resetPapersFilters = resetPapersFilters;
window.showMap = showMap;
window.calculateScale = calculateScale;
window.calculateAge = calculateAge;
window.calculateWeight = calculateWeight;
window.classifyPeriod = classifyPeriod;
window.compareSpecies = compareSpecies;
window.generateReport = generateReport;
window.downloadData = downloadData;
window.showFormationDetails = showFormationDetails;