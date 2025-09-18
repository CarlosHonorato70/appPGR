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

    // --- 1. Navegação entre Seções ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            link.classList.add('active');
            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            if (targetId === 'dashboard') updateDashboard();
        });
    });

    // --- Funções Genéricas para CRUD (Criar, Ler, Atualizar, Excluir) ---
    const setupCrud = (options) => {
        const { formId, tableId, storageKey, renderFn, getFormData, rowHtml } = options;
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
            const newItem = getFormData();
            const items = getStoredData(storageKey);
            items.push(newItem);
            setStoredData(storageKey, items);
            form.reset();
            render();
            updateDashboard();
        });

        renderFn.render = render; // Expondo a função de renderização
        render(); // Renderização inicial
    };

    // --- 2. Gestão de Unidades ---
    const unidadesFns = {};
    setupCrud({
        formId: 'form-unidade',
        tableId: 'unidades-cadastradas-table',
        storageKey: 'pgr_unidades',
        renderFn: unidadesFns,
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

    // --- 3. Checklist Interativo do PGR ---
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
            const updatedItem = {
                id,
                descricao: row.querySelector('.checklist-descricao').value,
                status: row.querySelector('.checklist-status').value,
                evidencias: row.querySelector('.checklist-evidencias').value
