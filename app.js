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
        'relatorios-dashboards': initRelatorios,
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
            } else if (targetId === 'dashboard' || targetId === 'notificacoes' || targetId === 'relatorios-dashboards') {
                // Sempre atualiza o dashboard, notificações e relatórios ao visitá-los
                if (targetId === 'dashboard' || targetId === 'notificacoes') {
                    updateDashboard();
                } else if (targetId === 'relatorios-dashboards') {
                    updateReportData();
                }
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
            { key: 'psicossociais', formId: 'form-riscos-psicossociais', tableId: 'riscos-psicossociais-table', fields: ['fatorRiscoPsicossocial', 'fonteRiscoPsicossocial', 'medidasControlePsicossocial'], row: item => `<td>${item.fatorRiscoPsicossocial}</td><td>${item.fonteRiscoPsicossocial}</td><td>${item.medidasControlePsicossocial}</td>` },
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

    // --- 7. Relatórios e PDF Export ---
    function initRelatorios() {
        updateReportData();
        setupPDFExport();
        
        // Setup refresh button
        const refreshBtn = document.getElementById('refresh-report-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', updateReportData);
        }
    }

    function updateReportData() {
        const checklistItems = getStoredData('pgr_checklist');
        const acoes = getStoredData('pgr_acoes');
        
        // Resumo Executivo
        const riscosCriticos = checklistItems.filter(item => item.risco === 'alto' && item.status === 'pendente').length;
        const acoesPendentes = acoes.filter(acao => acao.statusAcao !== 'concluido').length;
        const totalChecklist = checklistItems.filter(item => item.status !== 'na').length;
        const verifiedChecklist = checklistItems.filter(item => item.status === 'verificado').length;
        const conformidade = totalChecklist > 0 ? ((verifiedChecklist / totalChecklist) * 100).toFixed(0) : 100;
        
        document.getElementById('report-riscos-criticos').textContent = riscosCriticos;
        document.getElementById('report-acoes-pendentes').textContent = acoesPendentes;
        document.getElementById('report-conformidade').textContent = `${conformidade}%`;
        
        // Status Geral
        const statusGeralEl = document.getElementById('report-status-geral');
        if (statusGeralEl) {
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
        }

        // Tabela do Checklist
        const checklistTableBody = document.querySelector('#report-checklist-table tbody');
        if (checklistTableBody) {
            checklistTableBody.innerHTML = '';
            checklistItems.slice(0, 10).forEach(item => { // Limitar a 10 itens principais
                const row = checklistTableBody.insertRow();
                const riscoClass = { 'baixo': 'status-low', 'medio': 'status-medium', 'alto': 'status-high' }[item.risco] || 'status-na';
                const statusClass = { 'verificado': 'status-verified', 'pendente': 'status-pending', 'na': 'status-na' }[item.status] || 'status-na';
                
                row.innerHTML = `
                    <td>${item.descricao || 'N/A'}</td>
                    <td><span class="status-badge ${statusClass}">${item.status || 'N/A'}</span></td>
                    <td>${item.responsavel || 'N/A'}</td>
                    <td>${item.prazo ? new Date(item.prazo + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                    <td><span class="status-badge ${riscoClass}">${item.risco || 'N/A'}</span></td>
                `;
            });
        }

        // Resumo de Riscos por Categoria
        const riskCategoriesList = document.getElementById('risk-categories-list');
        if (riskCategoriesList) {
            const riskTypes = ['fisicos', 'quimicos', 'biologicos', 'ergonomicos', 'acidentes', 'psicossociais'];
            riskCategoriesList.innerHTML = '';
            
            riskTypes.forEach(type => {
                const risks = getStoredData(`pgr_riscos_${type}`);
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span class="risk-count">${risks.length}</span>
                `;
                riskCategoriesList.appendChild(li);
            });
        }

        // Tabela de Ações
        const acoesTableBody = document.querySelector('#report-acoes-table tbody');
        if (acoesTableBody) {
            acoesTableBody.innerHTML = '';
            acoes.slice(0, 10).forEach(acao => { // Limitar a 10 ações principais
                const row = acoesTableBody.insertRow();
                const statusClass = { 'pendente': 'status-pending', 'em-progresso': 'status-pending', 'concluido': 'status-verified', 'atrasado': 'status-high' }[acao.statusAcao] || 'status-na';
                const riscoClass = { 'baixo': 'status-low', 'medio': 'status-medium', 'alto': 'status-high' }[acao.nivelRiscoAssociado] || 'status-na';
                
                row.innerHTML = `
                    <td>${acao.descricaoAcao || 'N/A'}</td>
                    <td>${acao.responsavelAcao || 'N/A'}</td>
                    <td><span class="status-badge ${statusClass}">${acao.statusAcao ? acao.statusAcao.replace('-', ' ') : 'N/A'}</span></td>
                    <td>${acao.prazoAcao ? new Date(acao.prazoAcao + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                    <td><span class="status-badge ${riscoClass}">${acao.nivelRiscoAssociado || 'N/A'}</span></td>
                `;
            });
        }
    }

    function setupPDFExport() {
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', generatePDFReport);
        }
    }

    function generatePDFReport() {
        // Criar uma nova janela para o relatório PDF
        const reportWindow = window.open('', '_blank');
        
        // Dados do sistema
        const checklistItems = getStoredData('pgr_checklist');
        const acoes = getStoredData('pgr_acoes');
        const currentDate = new Date().toLocaleDateString('pt-BR');
        const currentTime = new Date().toLocaleTimeString('pt-BR');
        
        // Calcular métricas
        const riscosCriticos = checklistItems.filter(item => item.risco === 'alto' && item.status === 'pendente').length;
        const acoesPendentes = acoes.filter(acao => acao.statusAcao !== 'concluido').length;
        const totalChecklist = checklistItems.filter(item => item.status !== 'na').length;
        const verifiedChecklist = checklistItems.filter(item => item.status === 'verificado').length;
        const conformidade = totalChecklist > 0 ? ((verifiedChecklist / totalChecklist) * 100).toFixed(0) : 100;
        
        // Determinar status geral
        let statusGeral = 'Conforme';
        if (riscosCriticos > 0 || acoes.some(a => a.statusAcao === 'atrasado')) {
            statusGeral = 'Crítico';
        } else if (acoesPendentes > 0 || conformidade < 100) {
            statusGeral = 'Atenção';
        }

        // HTML do relatório
        const reportHTML = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório PGR - ${currentDate}</title>
            <style>
                @media print {
                    @page { 
                        margin: 1cm; 
                        size: A4;
                    }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 12px; 
                        line-height: 1.4;
                        color: #333;
                    }
                    .no-print { display: none; }
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .header p {
                    margin: 5px 0;
                    color: #666;
                }
                .section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section h2 {
                    color: #2c3e50;
                    border-bottom: 1px solid #1abc9c;
                    padding-bottom: 5px;
                    margin-bottom: 15px;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .metric-card {
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 5px;
                    background-color: #f8f9fa;
                }
                .metric-card h4 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 14px;
                }
                .metric-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #e74c3c;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                    vertical-align: top;
                }
                th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .status-badge {
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .status-verified { background-color: #d4edda; color: #155724; }
                .status-pending { background-color: #fff3cd; color: #856404; }
                .status-high { background-color: #f8d7da; color: #721c24; }
                .status-low { background-color: #d1ecf1; color: #0c5460; }
                .status-medium { background-color: #ffeaa7; color: #8e6f00; }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .print-btn {
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .print-btn:hover {
                    background-color: #c0392b;
                }
                ul {
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="no-print">
                <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
            </div>

            <div class="header">
                <h1>RELATÓRIO DO PGR</h1>
                <p>Sistema de Gestão de PGR - Programa de Gerenciamento de Riscos</p>
                <p><strong>Data de Geração:</strong> ${currentDate} às ${currentTime}</p>
                <p><strong>Status Geral:</strong> <span class="metric-value">${statusGeral}</span></p>
            </div>

            <div class="section">
                <h2>1. RESUMO EXECUTIVO</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h4>Conformidade NR-01</h4>
                        <div class="metric-value">${conformidade}%</div>
                    </div>
                    <div class="metric-card">
                        <h4>Riscos Críticos</h4>
                        <div class="metric-value">${riscosCriticos}</div>
                    </div>
                    <div class="metric-card">
                        <h4>Ações Pendentes</h4>
                        <div class="metric-value">${acoesPendentes}</div>
                    </div>
                    <div class="metric-card">
                        <h4>Itens Verificados</h4>
                        <div class="metric-value">${verifiedChecklist}/${totalChecklist}</div>
                    </div>
                </div>
                
                <h3>Indicadores Principais:</h3>
                <ul>
                    <li>Conformidade com NR-01: ${conformidade}%</li>
                    <li>Total de riscos críticos identificados: ${riscosCriticos}</li>
                    <li>Ações pendentes de execução: ${acoesPendentes}</li>
                    <li>Itens do checklist verificados: ${verifiedChecklist} de ${totalChecklist}</li>
                </ul>
            </div>

            <div class="section">
                <h2>2. STATUS DO CHECKLIST PGR</h2>
                ${checklistItems.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Responsável</th>
                            <th>Prazo</th>
                            <th>Nível de Risco</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${checklistItems.slice(0, 20).map(item => `
                        <tr>
                            <td>${item.descricao || 'N/A'}</td>
                            <td><span class="status-badge status-${item.status === 'verificado' ? 'verified' : item.status === 'pendente' ? 'pending' : 'na'}">${item.status || 'N/A'}</span></td>
                            <td>${item.responsavel || 'N/A'}</td>
                            <td>${item.prazo ? new Date(item.prazo + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</td>
                            <td><span class="status-badge status-${item.risco || 'na'}">${item.risco || 'N/A'}</span></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>Nenhum item no checklist encontrado.</p>'}
            </div>

            <div class="section">
                <h2>3. INVENTÁRIO DE RISCOS</h2>
                <h3>Resumo por Categoria:</h3>
                <ul>
                    <li>Riscos Físicos: ${getStoredData('pgr_riscos_fisicos').length} identificados</li>
                    <li>Riscos Químicos: ${getStoredData('pgr_riscos_quimicos').length} identificados</li>
                    <li>Riscos Biológicos: ${getStoredData('pgr_riscos_biologicos').length} identificados</li>
                    <li>Riscos Ergonômicos: ${getStoredData('pgr_riscos_ergonomicos').length} identificados</li>
                    <li>Riscos de Acidentes: ${getStoredData('pgr_riscos_acidentes').length} identificados</li>
                    <li>Riscos Psicossociais: ${getStoredData('pgr_riscos_psicossociais').length} identificados</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. PLANO DE AÇÃO</h2>
                ${acoes.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Responsável</th>
                            <th>Status</th>
                            <th>Prazo</th>
                            <th>Nível de Risco</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${acoes.slice(0, 15).map(acao => `
                        <tr>
                            <td>${acao.descricaoAcao || 'N/A'}</td>
                            <td>${acao.responsavelAcao || 'N/A'}</td>
                            <td><span class="status-badge status-${acao.statusAcao === 'concluido' ? 'verified' : acao.statusAcao === 'atrasado' ? 'high' : 'pending'}">${acao.statusAcao ? acao.statusAcao.replace('-', ' ') : 'N/A'}</span></td>
                            <td>${acao.prazoAcao ? new Date(acao.prazoAcao + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</td>
                            <td><span class="status-badge status-${acao.nivelRiscoAssociado || 'na'}">${acao.nivelRiscoAssociado || 'N/A'}</span></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>Nenhuma ação registrada.</p>'}
            </div>

            <div class="footer">
                <p><strong>DOCUMENTO CONFIDENCIAL</strong></p>
                <p>Sistema de Gestão de PGR - Programa de Gerenciamento de Riscos</p>
                <p>Este documento contém informações confidenciais e deve ser tratado de acordo com as políticas de segurança da informação.</p>
                <p>Gerado automaticamente em ${currentDate} às ${currentTime}</p>
            </div>
        </body>
        </html>
        `;

        // Escrever o HTML na nova janela
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
        
        // Focar na nova janela
        reportWindow.focus();
        
        alert('Relatório aberto em nova janela. Use Ctrl+P ou Cmd+P para imprimir/salvar como PDF.');
    }

    // --- 8. Dashboard e Notificações ---
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
