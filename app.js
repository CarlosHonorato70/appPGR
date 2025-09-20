// Sistema de Gestão de PGR - app.js
// ...
// [Conteúdo existente do arquivo]

// Lista das seções que sempre ficam disponíveis
const alwaysEnabledSections = ['gestao-unidades', 'perfis-usuario'];

// Lista das seções que requerem unidade selecionada
const sectionsRequiringUnit = [
    'dashboard', 'checklist-pgr', 'inventario-riscos', 
    'plano-acao', 'gestao-documentos', 'relatorios-dashboards', 'notificacoes'
];

// Verifica se a seção requer unidade selecionada
function sectionRequiresUnit(sectionId) {
    return sectionsRequiringUnit.includes(sectionId);
}

// Verifica se a seção sempre deve estar habilitada
function isAlwaysEnabled(sectionId) {
    return alwaysEnabledSections.includes(sectionId);
}

// Atualiza o estado das abas de navegação baseado na unidade ativa
window.updateNavigationStates = function() {
    const currentUnit = unidadeWorkManager.getCurrentUnidade();
    const hasUnit = !!currentUnit;
    document.querySelectorAll('.nav-link').forEach(function (link) {
        const id = link.getAttribute('href').replace('#', '');
        if (isAlwaysEnabled(id)) {
            link.classList.remove('disabled');
            link.style.opacity = '1';
            link.style.cursor = 'pointer';
        } else if (sectionRequiresUnit(id)) {
            if (hasUnit) {
                link.classList.remove('disabled');
                link.style.opacity = '1';
                link.style.cursor = 'pointer';
            } else {
                link.classList.add('disabled');
                link.style.opacity = '0.5';
                link.style.cursor = 'not-allowed';
            }
        }
    });
};

// Evento de click nos links de navegação com controle de unidade
document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
        const id = link.getAttribute('href').replace('#', '');
        if (!isAlwaysEnabled(id) && sectionRequiresUnit(id)) {
            const currentUnit = unidadeWorkManager.getCurrentUnidade();
            if (!currentUnit) {
                e.preventDefault();
                window.updateNavigationStates();
                alert('Selecione uma unidade para acessar esta funcionalidade.');
                return false;
            }
        }
        // Navegação normal, ativa a seção correspondente
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    });
});

// Inicializa estados das abas ao iniciar o sistema
function inicializarSistema() {
    inicializarNavegacaoSeletorUnidade();
    window.updateNavigationStates();
}
// ...
// [Resto do conteúdo do arquivo]