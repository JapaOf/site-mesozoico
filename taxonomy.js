/* ============================================
   DINO EXPLORER - TAXONOMIA.JS
   Funcionalidade da página de taxonomia e filogenia
   ============================================ */

// ============================================
// ÁRVORE FILOGENÉTICA DADOS
// ============================================

const phylogeneticData = {
    name: 'Dinosauria',
    emoji: '🦖',
    description: 'Todos os dinossauros',
    period: 'Triássico Superior - Presente',
    children: [
        {
            name: 'Saurischia',
            emoji: '🦕',
            description: 'Dinossauros com bacia de réptil (púbis para frente)',
            period: 'Triássico Superior - Presente',
            children: [
                {
                    name: 'Sauropodomorpha',
                    emoji: '🦕',
                    description: 'Herbívoros gigantescos de pescoço longo',
                    period: 'Triássico Superior - Cretáceo Superior',
                    children: [
                        { 
                            name: 'Diplodocidae', 
                            emoji: '🦕',
                            description: 'Diplodocus, Apatosaurus',
                            leaf: true 
                        },
                        { 
                            name: 'Brachiosauridae', 
                            emoji: '🦕',
                            description: 'Brachiosaurus',
                            leaf: true 
                        },
                        { 
                            name: 'Titanosauria', 
                            emoji: '🦕',
                            description: 'Argentinosaurus',
                            leaf: true 
                        }
                    ]
                },
                {
                    name: 'Theropoda',
                    emoji: '🦖',
                    description: 'Carnívoros bípedes (inclui aves)',
                    period: 'Triássico Superior - Presente',
                    children: [
                        {
                            name: 'Carnosauria',
                            emoji: '🦖',
                            description: 'Grandes predadores',
                            children: [
                                { 
                                    name: 'Tyrannosauridae', 
                                    emoji: '🦖',
                                    description: 'Tyrannosaurus rex',
                                    leaf: true 
                                },
                                { 
                                    name: 'Allosauridae', 
                                    emoji: '🦖',
                                    description: 'Allosaurus',
                                    leaf: true 
                                },
                                { 
                                    name: 'Spinosauridae', 
                                    emoji: '🦞',
                                    description: 'Spinosaurus',
                                    leaf: true 
                                }
                            ]
                        },
                        {
                            name: 'Coelurosauria',
                            emoji: '🦖',
                            description: 'Terópodes menores e ágeis',
                            children: [
                                { 
                                    name: 'Dromaeosauridae', 
                                    emoji: '🦖',
                                    description: 'Velociraptor, Deinonychus',
                                    leaf: true 
                                },
                                { 
                                    name: 'Troodontidae', 
                                    emoji: '🦖',
                                    description: 'Troodon',
                                    leaf: true 
                                }
                            ]
                        },
                        {
                            name: 'Aves',
                            emoji: '🕊️',
                            description: 'Dinossauros avianos vivos',
                            children: [
                                { 
                                    name: 'Archaeopterygidae', 
                                    emoji: '🕊️',
                                    description: 'Archaeopteryx (extinto)',
                                    leaf: true 
                                },
                                { 
                                    name: 'Neornithes', 
                                    emoji: '🕊️',
                                    description: 'Todas as aves modernas',
                                    leaf: true 
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'Ornithischia',
            emoji: '🦕',
            description: 'Dinossauros com bacia de ave (púbis para trás)',
            period: 'Jurássico Inferior - Cretáceo Superior',
            children: [
                {
                    name: 'Ceratopsia',
                    emoji: '🦕',
                    description: 'Com chifres e frilos',
                    children: [
                        { 
                            name: 'Triceratopsidae', 
                            emoji: '🦕',
                            description: 'Triceratops',
                            leaf: true 
                        },
                        { 
                            name: 'Protoceratopidae', 
                            emoji: '🦕',
                            description: 'Protoceratops',
                            leaf: true 
                        }
                    ]
                },
                {
                    name: 'Hadrosauridae',
                    emoji: '🦕',
                    description: 'Com bico de pato',
                    children: [
                        { 
                            name: 'Lambeosaurinae', 
                            emoji: '🦕',
                            description: 'Parasaurolophus',
                            leaf: true 
                        },
                        { 
                            name: 'Hadrosaurinae', 
                            emoji: '🦕',
                            description: 'Edmontosaurus',
                            leaf: true 
                        }
                    ]
                },
                {
                    name: 'Thyreophora',
                    emoji: '🛡️',
                    description: 'Dinossauros com armadura',
                    children: [
                        { 
                            name: 'Stegosauridae', 
                            emoji: '🦕',
                            description: 'Stegosaurus',
                            leaf: true 
                        },
                        { 
                            name: 'Ankylosauridae', 
                            emoji: '🦕',
                            description: 'Ankylosaurus',
                            leaf: true 
                        }
                    ]
                },
                {
                    name: 'Ornithopoda',
                    emoji: '🦕',
                    description: 'Bípedes herbívoros',
                    children: [
                        { 
                            name: 'Iguanodontia', 
                            emoji: '🦕',
                            description: 'Iguanodon',
                            leaf: true 
                        }
                    ]
                }
            ]
        }
    ]
};

// ============================================
// RENDERIZAR ÁRVORE FILOGENÉTICA
// ============================================

function renderPhylogeneticTree(node, level = 0, isLast = true) {
    const hasChildren = node.children && node.children.length > 0;
    const toggleIcon = hasChildren ? '<span class="tree-toggle">▼</span>' : '<span class="tree-toggle" style="visibility:hidden;">▼</span>';
    
    // Construir linha de conexão
    let connector = '';
    if (level > 0) {
        connector = '<span class="tree-connector">' + (isLast ? '└─ ' : '├─ ') + '</span>';
    }
    
    // Tooltip com informações
    const tooltip = node.description ? ` title="${node.description}"` : '';
    
    let html = `
        <div class="tree-node" data-level="${level}" data-has-children="${hasChildren}">
            <div class="tree-node-content">
                ${'&nbsp;'.repeat(level * 3)}${connector}
                ${toggleIcon}
                <span class="tree-node-name"${tooltip}>
                    ${node.emoji} ${node.name}
                    ${node.period ? `<span class="tree-node-period">(${node.period})</span>` : ''}
                </span>
            </div>
    `;

    if (hasChildren) {
        html += '<div class="tree-children">';
        node.children.forEach((child, index) => {
            const isLastChild = index === node.children.length - 1;
            html += renderPhylogeneticTree(child, level + 1, isLastChild);
        });
        html += '</div>';
    }

    html += '</div>';
    return html;
}

// ============================================
// INTERATIVIDADE DA ÁRVORE
// ============================================

function setupTreeInteractivity() {
    const treeNodes = document.querySelectorAll('.tree-node');

    treeNodes.forEach(node => {
        const toggle = node.querySelector('.tree-toggle');
        const children = node.querySelector('.tree-children');

        if (children && toggle && toggle.textContent.trim() !== '') {
            // Adicionar evento de clique no toggle
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTree(node, children, toggle);
            });

            // Adicionar evento de clique no nome para expandir
            const nameEl = node.querySelector('.tree-node-name');
            if (nameEl) {
                nameEl.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('tree-toggle')) {
                        toggleTree(node, children, toggle);
                    }
                });
            }
        }
    });
}

function toggleTree(node, children, toggle) {
    const isCollapsed = children.classList.contains('tree-collapsed');
    
    if (isCollapsed) {
        children.classList.remove('tree-collapsed');
        toggle.textContent = '▼';
        toggle.classList.remove('collapsed');
    } else {
        children.classList.add('tree-collapsed');
        toggle.textContent = '▶';
        toggle.classList.add('collapsed');
    }
    
    // Animar suavemente
    if (!isCollapsed) {
        children.style.maxHeight = children.scrollHeight + 'px';
        setTimeout(() => {
            children.style.maxHeight = 'none';
        }, 300);
    } else {
        children.style.maxHeight = children.scrollHeight + 'px';
        setTimeout(() => {
            children.style.maxHeight = '0';
        }, 10);
    }
}

// ============================================
// CONTROLES DE ÁRVORE
// ============================================

function expandAll() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.remove('tree-collapsed');
        el.style.maxHeight = 'none';
    });
    document.querySelectorAll('.tree-toggle').forEach(el => {
        if (el.textContent.trim() !== '') {
            el.textContent = '▼';
            el.classList.remove('collapsed');
        }
    });
}

function collapseAll() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.add('tree-collapsed');
        el.style.maxHeight = '0';
    });
    document.querySelectorAll('.tree-toggle').forEach(el => {
        if (el.textContent.trim() !== '') {
            el.textContent = '▶';
            el.classList.add('collapsed');
        }
    });
}

function resetTree() {
    // Recolher todos primeiro
    collapseAll();
    
    // Expandir apenas o primeiro nível
    document.querySelectorAll('.tree-node > .tree-children').forEach(el => {
        el.classList.remove('tree-collapsed');
        el.style.maxHeight = 'none';
        const parentToggle = el.parentElement.querySelector('.tree-toggle');
        if (parentToggle) {
            parentToggle.textContent = '▼';
            parentToggle.classList.remove('collapsed');
        }
    });
}

// Configurar botões
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('expand-all')?.addEventListener('click', expandAll);
    document.getElementById('collapse-all')?.addEventListener('click', collapseAll);
    document.getElementById('reset-tree')?.addEventListener('click', resetTree);
});

// ============================================
// ACCORDION
// ============================================

function toggleAccordion(header) {
    const item = header.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const icon = header.querySelector('.accordion-icon');
    
    // Fechar outros accordions
    const allItems = document.querySelectorAll('.accordion-item');
    allItems.forEach(el => {
        if (el !== item && el.classList.contains('active')) {
            el.classList.remove('active');
            const otherContent = el.querySelector('.accordion-content');
            const otherIcon = el.querySelector('.accordion-icon');
            if (otherContent) {
                otherContent.style.maxHeight = '0';
                otherContent.style.padding = '0 20px';
            }
            if (otherIcon) otherIcon.textContent = '▶';
        }
    });

    // Toggle atual
    item.classList.toggle('active');
    
    if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.padding = '20px';
        icon.textContent = '▼';
    } else {
        content.style.maxHeight = '0';
        content.style.padding = '0 20px';
        icon.textContent = '▶';
    }
}

// Inicializar accordions
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            toggleAccordion(this);
        });
        
        // Inicializar ícones
        const icon = header.querySelector('.accordion-icon');
        if (icon) icon.textContent = '▶';
    });
    
    // Inicializar conteúdos como colapsados
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.maxHeight = '0';
        content.style.padding = '0 20px';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
    });
});

// ============================================
// TABS
// ============================================

function switchTab(tabId) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Desativar todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ativar tab selecionada
    const selectedContent = document.getElementById(tabId + '-content');
    if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
    }
    
    // Ativar botão correspondente
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

// Inicializar tabs
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Ativar primeira tab por padrão
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        firstTab.click();
    }
});

// ============================================
// TOOLTIPS
// ============================================

function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const tooltipText = el.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
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
                animation: fadeIn 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = el.getBoundingClientRect();
            tooltip.style.top = rect.top - 30 + 'px';
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            
            el.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
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

function addTaxonomyAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
        
        .tree-node {
            animation: slideIn 0.3s ease-out forwards;
            opacity: 0;
            animation-delay: calc(var(--node-level, 0) * 0.05s);
        }
        
        .accordion-item {
            animation: fadeIn 0.5s ease-out forwards;
            opacity: 0;
        }
        
        .accordion-item:nth-child(1) { animation-delay: 0.1s; }
        .accordion-item:nth-child(2) { animation-delay: 0.2s; }
        .accordion-item:nth-child(3) { animation-delay: 0.3s; }
        .accordion-item:nth-child(4) { animation-delay: 0.4s; }
        .accordion-item:nth-child(5) { animation-delay: 0.5s; }
    `;
    document.head.appendChild(style);
    
    // Aplicar nível para delays
    document.querySelectorAll('.tree-node').forEach((node, index) => {
        node.style.setProperty('--node-level', index);
    });
}

// ============================================
// PESQUISA NA ÁRVORE
// ============================================

function searchTree() {
    const searchTerm = document.getElementById('tree-search')?.value.toLowerCase() || '';
    
    if (!searchTerm) {
        // Se busca vazia, mostrar tudo
        document.querySelectorAll('.tree-node').forEach(node => {
            node.style.display = 'block';
        });
        return;
    }
    
    document.querySelectorAll('.tree-node').forEach(node => {
        const nodeName = node.querySelector('.tree-node-name')?.textContent.toLowerCase() || '';
        const matches = nodeName.includes(searchTerm);
        
        node.style.display = matches ? 'block' : 'none';
        
        // Se um nó corresponde, mostrar seus pais
        if (matches) {
            let parent = node.parentElement;
            while (parent && !parent.classList.contains('phylogenetic-tree')) {
                if (parent.classList.contains('tree-node')) {
                    parent.style.display = 'block';
                }
                parent = parent.parentElement;
            }
        }
    });
}

// Adicionar busca se existir
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('tree-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchTree, 300));
    }
});

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
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦖 Página de taxonomia carregada!');
    
    // Renderizar árvore filogenética
    const treeContainer = document.getElementById('phylogenetic-tree');
    if (treeContainer) {
        treeContainer.innerHTML = renderPhylogeneticTree(phylogeneticData);
        setupTreeInteractivity();
        
        // Inicializar com primeiro nível expandido
        setTimeout(() => {
            document.querySelectorAll('.tree-node > .tree-children').forEach(el => {
                el.classList.remove('tree-collapsed');
                const toggle = el.parentElement.querySelector('.tree-toggle');
                if (toggle) toggle.textContent = '▼';
            });
        }, 100);
    }
    
    // Inicializar componentes
    initMobileMenu();
    initTooltips();
    addTaxonomyAnimations();
    
    // Rastrear visualização
    trackPageView();
});

function trackPageView() {
    console.log('📊 Página de taxonomia visualizada');
    // Aqui você pode integrar com analytics
}

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.toggleAccordion = toggleAccordion;
window.switchTab = switchTab;
window.expandAll = expandAll;
window.collapseAll = collapseAll;
window.resetTree = resetTree;
window.searchTree = searchTree;

// ============================================
// FIM DO ARQUIVO
// ============================================