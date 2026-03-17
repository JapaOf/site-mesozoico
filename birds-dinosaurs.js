/* ============================================
   DINO EXPLORER - BIRDS-DINOSAURS.JS
   Funcionalidade da página de aves vs dinossauros
   ============================================ */

// ============================================
// ANATOMY TABS
// ============================================

function initAnatomyTabs() {
    document.querySelectorAll('.anatomy-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const anatomy = this.getAttribute('data-anatomy');

            // Remove active de todos
            document.querySelectorAll('.anatomy-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.anatomy-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Adiciona active
            this.classList.add('active');
            const selectedContent = document.getElementById(`${anatomy}-content`);
            if (selectedContent) {
                selectedContent.classList.add('active');
                selectedContent.style.display = 'block';
            }
        });
    });
}

// ============================================
// QUIZ
// ============================================

function checkAnswer(btn, answer) {
    const quizItem = btn.closest('.quiz-item');
    if (!quizItem) return;

    const allBtns = quizItem.querySelectorAll('.quiz-btn');
    const feedbackDiv = quizItem.querySelector('.quiz-feedback') || createFeedbackElement(quizItem);

    // Remove classes anteriores e reabilita visualmente
    allBtns.forEach(b => {
        b.classList.remove('correct', 'incorrect');
        b.disabled = true;
        b.style.opacity = '0.7';
    });

    // Feedback baseado na resposta
    let isCorrect = false;
    let feedbackMessage = '';

    if (answer === 'archaeopteryx' || answer === 'theropod' || answer === 'both' || answer === 'correct') {
        isCorrect = true;
        btn.classList.add('correct');
        btn.style.background = '#4CAF50';
        btn.style.color = 'white';
        feedbackMessage = getFeedbackMessage(answer);
    } else {
        btn.classList.add('incorrect');
        btn.style.background = '#f44336';
        btn.style.color = 'white';
        feedbackMessage = getFeedbackMessage('wrong');
    }

    // Mostrar feedback
    feedbackDiv.innerHTML = `
        <div class="feedback-message ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}" 
             style="padding: 10px; border-radius: 4px; margin-top: 10px; background: ${isCorrect ? '#e8f5e8' : '#ffebee'};">
            <strong>${isCorrect ? '✓ Correto!' : '✗ Incorreto'}</strong>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${feedbackMessage}</p>
        </div>
    `;

    // Armazenar resposta
    quizItem.setAttribute('data-answered', 'true');
}

function createFeedbackElement(quizItem) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'quiz-feedback';
    quizItem.appendChild(feedbackDiv);
    return feedbackDiv;
}

function getFeedbackMessage(answerType) {
    const messages = {
        'archaeopteryx': 'Archaeopteryx é o fóssil transicional perfeito - tem características de dinossauro (dentes, cauda longa, garras) e de ave (penas, asas)!',
        'theropod': 'Velociraptor é um terópode - tem todos os características de dinossauro: dentes, garras, cauda longa e estrutura corporal típica.',
        'both': 'Exato! Ossos ocos e esterno quilhado são características de terópodes, e as aves são terópodes!',
        'correct': 'Perfeito! Filogeneticamente, as aves SÃO dinossauros - especificamente terópodes avianos!',
        'wrong': 'Revise as evidências: estrutura óssea, penas, genética e fósseis transicionais como Archaeopteryx mostram que aves são dinossauros.'
    };
    return messages[answerType] || 'Tente novamente!';
}

// ============================================
// RESET QUIZ
// ============================================

function resetQuiz() {
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.removeAttribute('data-answered');
        
        // Reabilitar botões
        item.querySelectorAll('.quiz-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.background = '';
            btn.style.color = '';
            btn.classList.remove('correct', 'incorrect');
        });
        
        // Remover feedback
        const feedback = item.querySelector('.quiz-feedback');
        if (feedback) feedback.remove();
    });
    
    alert('Quiz reiniciado! Tente novamente.');
}

// ============================================
// TOOLTIP INFO
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
// HIGHLIGHT FOSSIL CARDS
// ============================================

function initFossilCards() {
    document.querySelectorAll('.fossil-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('click', function() {
            const fossilName = this.querySelector('h3')?.textContent || 'Fóssil';
            showFossilInfo(fossilName);
        });
    });
}

function showFossilInfo(fossilName) {
    const info = {
        'Archaeopteryx lithographica': 'Descoberto na Alemanha em 1861. Viveu há 150 milhões de anos. É o fóssil transicional mais famoso da história.',
        'Microraptor': 'Descoberto na China. Tinha quatro asas e penas iridescentes. Viveu há 125 milhões de anos.',
        'Anchiornis': 'Pequeno terópode com penas preservadas. Viveu há 160 milhões de anos na China.',
        'Confuciusornis': 'Uma das aves mais antigas sem dentes. Viveu há 130 milhões de anos.',
        'Enantiornithes': 'Grupo diverso de aves primitivas que viveram no Cretáceo.',
        'Hesperornis': 'Ave mergulhadora do Cretáceo, ainda com dentes, mas sem capacidade de voo.'
    };
    
    const message = info[fossilName] || `${fossilName} é um importante fóssil transicional na evolução das aves.`;
    alert(`📌 ${fossilName}\n\n${message}`);
}

// ============================================
// EXPANDIR/CONTRUIR SEÇÕES
// ============================================

function toggleSection(sectionId, button) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const isExpanded = section.classList.toggle('expanded');
    button.innerHTML = isExpanded ? 'Ver menos ↑' : 'Ver mais ↓';
    
    if (isExpanded) {
        section.style.maxHeight = section.scrollHeight + 'px';
    } else {
        section.style.maxHeight = '200px';
    }
}

// ============================================
// COMPARTILHAR
// ============================================

function sharePage() {
    if (navigator.share) {
        navigator.share({
            title: 'Aves vs Dinossauros - Dino Explorer',
            text: 'Descubra por que as aves SÃO dinossauros! Evidências científicas e fósseis transicionais.',
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback para navegadores sem Web Share API
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copiado para a área de transferência!');
        }).catch(() => {
            prompt('Copie este link:', window.location.href);
        });
    }
}

// ============================================
// TIMELINE INTERATIVA SIMPLES
// ============================================

function initMiniTimeline() {
    const timelineItems = document.querySelectorAll('.fossil-timeline-marker');
    
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            const parentCard = this.closest('.fossil-card');
            if (parentCard) {
                parentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight temporário
                parentCard.style.transition = 'background 0.3s';
                parentCard.style.background = '#fff3cd';
                setTimeout(() => {
                    parentCard.style.background = '';
                }, 1000);
            }
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
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    initAnatomyTabs();
    initTooltips();
    initFossilCards();
    initMiniTimeline();
    initMobileMenu();
    
    // Configurar botão de reset do quiz (se existir)
    const resetQuizBtn = document.getElementById('reset-quiz');
    if (resetQuizBtn) {
        resetQuizBtn.addEventListener('click', resetQuiz);
    }
    
    // Configurar botão de compartilhar (se existir)
    const shareBtn = document.getElementById('share-page');
    if (shareBtn) {
        shareBtn.addEventListener('click', sharePage);
    }
    
    // Adicionar evento de clique nas abas via atributo data-anatomy
    document.querySelectorAll('[data-anatomy]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const anatomy = this.getAttribute('data-anatomy');
            if (anatomy) {
                e.preventDefault();
                
                // Simular clique na aba correspondente
                const targetTab = document.querySelector(`.anatomy-tab-btn[data-anatomy="${anatomy}"]`);
                if (targetTab) {
                    targetTab.click();
                }
            }
        });
    });
    
    // Inicializar tooltips para fósseis
    document.querySelectorAll('.fossil-card h3').forEach(title => {
        title.setAttribute('data-tooltip', 'Clique para mais informações');
    });
    
    console.log('🦖 Página de aves vs dinossauros carregada!');
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.checkAnswer = checkAnswer;
window.resetQuiz = resetQuiz;
window.toggleSection = toggleSection;
window.sharePage = sharePage;
window.showFossilInfo = showFossilInfo;