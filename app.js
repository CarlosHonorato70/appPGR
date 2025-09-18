document.addEventListener('DOMContentLoaded', () => {
    // --- Funções Auxiliares ---
    const getStoredData = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };

    const setStoredData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

    // --- 1. Navegação e Inicialização ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    // Mapeia qual função de inicialização pertence a cada seção
    const sectionInitializers = {
        'gestao-unidades': initGestaoUnidades,
        'checklist-pgr': initChecklist,
        'inventario-riscos': initInventarioRiscos,
        'plano-acao': initPlanoAcao,
        'gestao-documentos': initGestaoDocumentos,
        'dashboard': updateDashboard,
        'notificacoes': updateDashboard // Notificações são atualizadas junto com o dashboard
    };

    // Guarda o estado para não reinicializar uma seção que já foi carregada
    const initializedSections = new Set();

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Esconde todas as seções e remove a classe 'active' dos links
            navLinks.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            // Ativa o link e a seção clicada
            link.classList.add('active');
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Se a seção tem uma função de inicialização e ainda não foi inicializada, execute-a
            if (sectionInitializers[targetId] && !initializedSections.has(targetId)) {
                sectionInitializers[targetId]();
                initializedSections.add(targetId);
            } else if (targetId === 'dashboard' || targetId === 'notificacoes') {
                // Sempre atualiza o dashboard e as notificações ao visitá-los
                updateDashboard();
            }
        });
    });

    // --- Funções Genéricas para CRUD ---
    const setupCrud = (options) => {
        const { formId, tableId, storageKey, getFormData, rowHtml } = options;
        const form = document.getElementById(formId);
        const table = document.getElementById(tableId);
        const tableBody = table.querySelector('tbody');

        const render = () => {
            const items = getStoredData(storageKey);
            tableBody.innerHTML = '';
            items.forEach(item => {
                const row = tableBody.insertRow();
                row.dataset.id = item.id;
                row.innerHTML = rowHtml(item);
            });
        };

        table.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item')) {
                const idToDelete = e.target.dataset.id;
                if (confirm('Tem certeza que deseja excluir este item?')) {
                    let currentItems = getStoredData(storageKey);
                    currentItems = currentItems.filter(item => item.id !== idToDelete);
                    setStoredData(storageKey, currentItems);
                    render();
                    updateDashboard();
                }
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = getFormData(form);
            const items = getStoredData(storageKey);
            items.push(newItem);
            setStoredData(storageKey, items);
            form.reset();
            render();
            updateDashboard();
        });

        render(); // Renderização inicial
    };

    // --- 2. Gestão de Unidades ---
    function initGestaoUnidades() {
        setupCrud({
            formId: 'form-unidade',
            tableId: 'unidades-cadastradas-table',
            storageKey: 'pgr_unidades',
            getFormData: () => ({
                id: generateUniqueId(),
                nomeUnidade: document.getElementById('nomeUnidade').value,
                cnpjUnidade: document.getElementById('cnpjUnidade').value,
                responsavelLegalUnidade: document.getElementById('responsavelLegalUnidade').value,
            }),
            rowHtml: (item) => `
                <td>${item.nomeUnidade}</td>
                <td>${item.cnpjUnidade}</td>
                <td>${item.responsavelLegalUnidade}</td>
                <td><button data-id="${item.id}" class="delete-item">Excluir</button></td>
            `
        });
    }

    // --- 3. Checklist Interativo do PGR ---
    function initChecklist() {
        const checklistTableBody = document.querySelector('#checklist-table tbody');
        const checklistTable = document.getElementById('checklist-table');
        const addChecklistItemButton = document.getElementById('add-checklist-item');

        const renderChecklist = () => {
            let checklistItems = getStoredData('pgr_checklist');
            if (checklistItems.length === 0) {
                checklistItems = [
                    { id: generateUniqueId(), descricao: 'Avaliação de Ruído', status: 'pendente', evidencias: '', responsavel: 'Eng. Segurança', prazo: '2025-10-01', risco: 'medio', medidas: '' },
                    { id: generateUniqueId(), descricao: 'Verificação de Extintores', status: 'pendente', evidencias: '', responsavel: 'Téc. Manutenção', prazo: '2025-09-25', risco: 'alto', medidas: '' },
                ];
                setStoredData('pgr_checklist', checklistItems);
            }
            checklistTableBody.innerHTML = '';
            checklistItems.forEach(item => {
                const row = checklistTableBody.insertRow();
                row.dataset.id = item.id;
                row.innerHTML = `
                    <td><textarea class="checklist-descricao">${item.descricao}</textarea></td>
                    <td><select class="checklist-status"><option value="verificado" ${item.status === 'verificado' ? 'selected' : ''}>Verificado</option><option value="pendente" ${item.status === 'pendente' ? 'selected' : ''}>Pendente</option><option value="na" ${item.status === 'na' ? 'selected' : ''}>N/A</option></select></td>
                    <td><textarea class="checklist-evidencias">${item.evidencias}</textarea></td>
                    <td><input type="text" class="checklist-responsavel" value="${item.responsavel}"></td>
                    <td><input type="date" class="checklist-prazo" value="${item.prazo}"></td>
                    <td><select class="checklist-risco"><option value="baixo" ${item.risco === 'baixo' ? 'selected' : ''}>Baixo</option><option value="medio" ${item.risco === 'medio' ? 'selected' : ''}>Médio</option><option value="alto" ${item.risco === 'alto' ? 'selected' : ''}>Alto</option></select></td>
                    <td><textarea class="checklist-medidas">${item.medidas}</textarea></td>
                    <td><button class="save-checklist-item" data-id="${item.id}">Salvar</button><button class="delete-checklist-item" data-id="${item.id}">Excluir</button></td>
                `;
            });
        };

        checklistTable.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (e.target.classList.contains('save-checklist-item')) {
                const row = e.target.closest('tr');
                let items = getStoredData('pgr_checklist');
                const itemIndex = items.findIndex(i => i.id === id);
                if (itemIndex > -1) {
                    items[itemIndex] = {
                        id,
                        descricao: row.querySelector('.checklist-descricao').value,
                        status: row.querySelector('.checklist-status').value,
                        evidencias: row.querySelector('.checklist-evidencias').value,
                        responsavel: row.querySelector('.checklist-responsavel').value,
                        prazo: row.querySelector('.checklist-prazo').value,
                        risco: row.querySelector('.checklist-risco').value,
                        medidas: row.querySelector('.checklist-medidas').value,
                    };
                    setStoredData('pgr_checklist', items);
                    alert('Item salvo com sucesso!');
                    updateDashboard();
                }
            } else if (e.target.classList.contains('delete-checklist-item')) {
                if (confirm('Tem certeza que deseja excluir este item?')) {
                    let items = getStoredData('pgr_checklist');
                    items = items.filter(i => i.id !== id);
                    setStoredData('pgr_checklist', items);
                    renderChecklist();
                    updateDashboard();
                }
            }
        });

        addChecklistItemButton.addEventListener('click', () => {
            const newItem = {
                id: generateUniqueId(),
                descricao: 'Novo Item',
                status: 'pendente',
                evidencias: '',
                responsavel: '',
                prazo: '',
                risco: 'medio',
                medidas: '',
            };
            const items = getStoredData('pgr_checklist');
            items.push(newItem);
            setStoredData('pgr_checklist', items);
            renderChecklist();
        });

        renderChecklist();
    }

    // --- 4. Inventário de Riscos ---
    function initInventarioRiscos() {
        const riskTypes = [
            { key: 'fisicos', formId: 'form-riscos-fisicos', tableId: 'riscos-fisicos-table', fields: ['tipoRiscoFisico', 'fonteRiscoFisico', 'exposicaoFisico', 'medidasControleFisico'], row: item => `<td>${item.tipoRiscoFisico}</td><td>${item.fonteRiscoFisico}</td><td>${item.exposicaoFisico}</td><td>${item.medidasControleFisico}</td>` },
            { key: 'quimicos', formId: 'form-riscos-quimicos', tableId: 'riscos-quimicos-table', fields: ['tipoRiscoQuimico', 'localRiscoQuimico', 'medidasControleQuimico'], row: item => `<td>${item.tipoRiscoQuimico}</td><td>${item.localRiscoQuimico}</td><td>${item.medidasControleQuimico}</td>` },
            { key: 'biologicos', formId: 'form-riscos-biologicos', tableId: 'riscos-biologicos-table', fields: ['agenteRiscoBiologico', 'tarefaRiscoBiologico', 'medidasControleBiologico'], row: item => `<td>${item.agenteRiscoBiologico}</td><td>${item.tarefaRiscoBiologico}</td><td>${item.medidasControleBiologico}</td>` },
            { key: 'ergonomicos', formId: 'form-riscos-ergonomicos', tableId: 'riscos-ergonomicos-table', fields: ['tipoRiscoErgonomico', 'atividadeRiscoErgonomico', 'medidasControleErgonomico'], row: item => `<td>${item.tipoRiscoErgonomico}</td><td>${item.atividadeRiscoErgonomico}</td><td>${item.medidasControleErgonomico}</td>` },
            { key: 'acidentes', formId: 'form-riscos-acidentes', tableId: 'riscos-acidentes-table', fields: ['tipoRiscoAcidente', 'localRiscoAcidente', 'medidasControleAcidente'], row: item => `<td>${item.tipoRiscoAcidente}</td><td>${item.localRiscoAcidente}</td><td>${item.medidasControleAcidente}</td>` },
        ];

        riskTypes.forEach(type => {
            setupCrud({
                formId: type.formId,
                tableId: type.tableId,
                storageKey: `pgr_riscos_${type.key}`,
                getFormData: () => {
                    const data = { id: generateUniqueId() };
                    type.fields.forEach(field => {
                        data[field] = document.getElementById(field).value;
                    });
                    return data;
                },
                rowHtml: (item) => `${type.row(item)}<td><button data-id="${item.id}" class="delete-item">Excluir</button></td>`
            });
        });
    }

    // --- 5. Plano de Ação ---
    function initPlanoAcao() {
        setupCrud({
            formId: 'form-plano-acao',
            tableId: 'acoes-registradas-table',
            storageKey: 'pgr_acoes',
            getFormData: () => ({
                id: generateUniqueId(),
                descricaoAcao: document.getElementById('descricaoAcao').value,
                responsavelAcao: document.getElementById('responsavelAcao').value,
                prazoAcao: document.getElementById('prazoAcao').value,
                statusAcao: document.getElementById('statusAcao').value,
                nivelRiscoAssociado: document.getElementById('nivelRiscoAssociado').value,
            }),
            rowHtml: (item) => {
                const statusClass = { 'pendente': 'status-pending', 'em-progresso': 'status-pending', 'concluido': 'status-verified', 'atrasado': 'status-high' }[item.statusAcao] || 'status-na';
                const riscoClass = { 'baixo': 'status-low', 'medio': 'status-medium', 'alto': 'status-high' }[item.nivelRiscoAssociado] || 'status-na';
                return `
                    <td>${item.descricaoAcao}</td>
                    <td>${item.responsavelAcao}</td>
                    <td>${item.prazoAcao}</td>
                    <td><span class="status-badge ${statusClass}">${item.statusAcao.replace('-', ' ')}</span></td>
                    <td><span class="status-badge ${riscoClass}">${item.nivelRiscoAssociado}</span></td>
                    <td><button data-id="${item.id}" class="delete-item">Excluir</button></td>
                `;
            }
        });
    }

    // --- 6. Gestão de Documentos ---
    function initGestaoDocumentos() {
        setupCrud({
            formId: 'form-documentos',
            tableId: 'documentos-armazenados-table',
            storageKey: 'pgr_documentos',
            getFormData: () => ({
                id: generateUniqueId(),
                tipoDocumento: document.getElementById('tipoDocumento').value,
                nomeDocumento: document.getElementById('nomeDocumento').value,
                dataEmissaoDoc: document.getElementById('dataEmissaoDoc').value,
                fileName: document.getElementById('arquivoDocumento').files[0]?.name || 'N/A'
            }),
            rowHtml: (item) => `
                <td>${item.tipoDocumento}</td>
                <td>${item.nomeDocumento}</td>
                <td>${item.dataEmissaoDoc}</td>
                <td><button data-id="${item.id}" class="delete-item">Excluir</button></td>
            `
        });
    }

    // --- 7. Dashboard e Notificações ---
    function updateDashboard() {
        const checklistItems = getStoredData('pgr_checklist');
        const acoes = getStoredData('pgr_acoes');

        // Riscos Críticos
        const riscosCriticos = checklistItems.filter(item => item.risco === 'alto' && item.status === 'pendente').length;
        document.getElementById('dashboard-riscos-criticos').textContent = riscosCriticos;

        // Ações Pendentes
        const acoesPendentes = acoes.filter(acao => acao.statusAcao !== 'concluido').length;
        document.getElementById('dashboard-acoes-pendentes').textContent = acoesPendentes;

        // Conformidade
        const totalChecklist = checklistItems.filter(item => item.status !== 'na').length;
        const verifiedChecklist = checklistItems.filter(item => item.status === 'verificado').length;
        const conformidade = totalChecklist > 0 ? ((verifiedChecklist / totalChecklist) * 100).toFixed(0) : 100;
        document.getElementById('dashboard-conformidade').textContent = `${conformidade}%`;

        // Status Geral
        const statusGeralEl = document.getElementById('dashboard-status-geral');
        if (riscosCriticos > 0 || acoes.some(a => a.statusAcao === 'atrasado')) {
            statusGeralEl.textContent = 'Crítico';
            statusGeralEl.className = 'status-badge status-high';
        } else if (acoesPendentes > 0 || conformidade < 100) {
            statusGeralEl.textContent = 'Atenção';
            statusGeralEl.className = 'status-badge status-pending';
        } else {
            statusGeralEl.textContent = 'Conforme';
            statusGeralEl.className = 'status-badge status-verified';
        }

        // Próximos Prazos
        const prazosBody = document.querySelector('#dashboard-prazos-table tbody');
        prazosBody.innerHTML = '';
        acoes.filter(a => a.statusAcao !== 'concluido' && a.prazoAcao)
            .sort((a, b) => new Date(a.prazoAcao) - new Date(b.prazoAcao))
            .slice(0, 3)
            .forEach(acao => {
                const statusClass = { 'pendente': 'status-pending', 'em-progresso': 'status-pending', 'atrasado': 'status-high' }[acao.statusAcao] || 'status-na';
                const row = prazosBody.insertRow();
                row.innerHTML = `
                    <td>${acao.descricaoAcao}</td>
                    <td>${new Date(acao.prazoAcao + 'T00:00:00').toLocaleDateString()}</td>
                    <td>${acao.responsavelAcao}</td>
                    <td><span class="status-badge ${statusClass}">${acao.statusAcao.replace('-', ' ')}</span></td>
                `;
            });

        // Notificações
        const notificacoesList = document.getElementById('notificacoes-list');
        notificacoesList.innerHTML = '';
        const addNotificacao = (text) => {
            const li = document.createElement('li');
            li.textContent = text;
            notificacoesList.appendChild(li);
        };
        if (riscosCriticos > 0) addNotificacao(`ATENÇÃO: ${riscosCriticos} risco(s) crítico(s) identificado(s)!`);
        const acoesAtrasadas = acoes.filter(a => a.statusAcao === 'atrasado').length;
        if (acoesAtrasadas > 0) addNotificacao(`ALERTA: ${acoesAtrasadas} ação(ões) está(ão) atrasada(s)!`);
        if (notificacoesList.children.length === 0) addNotificacao('Nenhuma notificação importante no momento.');
    }

    // --- Inicialização do App ---
    // Ativa a aba do dashboard por padrão e carrega seus dados
    document.querySelector('.nav-link[href="#dashboard"]').click();
});
