// Sistema de Gestão de PGR - app.js

// Armazenamento local usando IndexedDB
class PGRStorage {
    constructor() {
        this.dbName = 'pgrDB';
        this.dbVersion = 2;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para documentos
                if (!db.objectStoreNames.contains('documentos')) {
                    const documentosStore = db.createObjectStore('documentos', { keyPath: 'id', autoIncrement: true });
                    documentosStore.createIndex('tipo', 'tipo', { unique: false });
                    documentosStore.createIndex('nome', 'nome', { unique: false });
                }
                
                // Store para dados do sistema
                if (!db.objectStoreNames.contains('dados')) {
                    db.createObjectStore('dados', { keyPath: 'tipo' });
                }
                
                // Store para usuários
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'username' });
                    usersStore.createIndex('username', 'username', { unique: true });
                }
            };
        });
    }

    async salvarDocumento(documento) {
        const transaction = this.db.transaction(['documentos'], 'readwrite');
        const store = transaction.objectStore('documentos');
        return store.add(documento);
    }

    async listarDocumentos() {
        const transaction = this.db.transaction(['documentos'], 'readonly');
        const store = transaction.objectStore('documentos');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async excluirDocumento(id) {
        const transaction = this.db.transaction(['documentos'], 'readwrite');
        const store = transaction.objectStore('documentos');
        return store.delete(id);
    }

    async salvarDados(tipo, dados) {
        const transaction = this.db.transaction(['dados'], 'readwrite');
        const store = transaction.objectStore('dados');
        return store.put({ tipo, dados });
    }

    async obterDados(tipo) {
        const transaction = this.db.transaction(['dados'], 'readonly');
        const store = transaction.objectStore('dados');
        return new Promise((resolve, reject) => {
            const request = store.get(tipo);
            request.onsuccess = () => resolve(request.result ? request.result.dados : []);
            request.onerror = () => reject(request.error);
        });
    }

    // Métodos para gerenciamento de usuários
    async salvarUsuario(userData) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        return new Promise((resolve, reject) => {
            const request = store.add(userData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async buscarUsuario(username) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        return new Promise((resolve, reject) => {
            const request = store.get(username);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async verificarUsuarioExiste(username) {
        const usuario = await this.buscarUsuario(username);
        return !!usuario;
    }
}

// Instância global do storage
const pgrStorage = new PGRStorage();

// Gerenciador de vinculação de trabalhos às unidades
class UnidadeWorkManager {
    constructor(storage) {
        this.storage = storage;
        this.currentUnidadeId = null;
        this.workTypes = ['checklist', 'riscos-fisicos', 'riscos-quimicos', 'riscos-biologicos', 
            'riscos-ergonomicos', 'riscos-acidentes', 'riscos-psicossociais', 'acoes'];
    }

    // Define a unidade atual
    async setCurrentUnidade(unidadeId) {
        this.currentUnidadeId = unidadeId;
        localStorage.setItem('currentUnidadeId', unidadeId);
        await this.vincularTodosTrabalhos(unidadeId);
    }

    // Obtém a unidade atual
    getCurrentUnidade() {
        if (!this.currentUnidadeId) {
            this.currentUnidadeId = localStorage.getItem('currentUnidadeId');
        }
        return this.currentUnidadeId;
    }

    // Vincula todos os trabalhos existentes à unidade especificada
    async vincularTodosTrabalhos(unidadeId) {
        try {
            for (const workType of this.workTypes) {
                await this.vincularTrabalhosPorTipo(workType, unidadeId);
            }
            
            // Vincular documentos também
            await this.vincularDocumentos(unidadeId);
            
            console.log(`Todos os trabalhos foram vinculados à unidade ${unidadeId}`);
        } catch (error) {
            console.error('Erro ao vincular trabalhos:', error);
        }
    }

    // Vincula trabalhos de um tipo específico à unidade
    async vincularTrabalhosPorTipo(workType, unidadeId) {
        const trabalhos = await this.storage.obterDados(workType) || [];
        const trabalhosAtualizados = trabalhos.map(trabalho => ({
            ...trabalho,
            unidade_id: unidadeId
        }));
        
        if (trabalhosAtualizados.length > 0) {
            await this.storage.salvarDados(workType, trabalhosAtualizados);
        }
    }

    // Vincula documentos à unidade
    async vincularDocumentos(unidadeId) {
        try {
            const documentos = await this.storage.listarDocumentos();
            for (const doc of documentos) {
                if (doc.unidade_id !== unidadeId) {
                    // Atualizar documento com unidade_id
                    const transaction = this.storage.db.transaction(['documentos'], 'readwrite');
                    const store = transaction.objectStore('documentos');
                    const updatedDoc = { ...doc, unidade_id: unidadeId };
                    await store.put(updatedDoc);
                }
            }
        } catch (error) {
            console.error('Erro ao vincular documentos:', error);
        }
    }

    // Adiciona unidade_id a um novo trabalho
    adicionarUnidadeAoTrabalho(trabalho) {
        const unidadeId = this.getCurrentUnidade();
        return {
            ...trabalho,
            unidade_id: unidadeId || null
        };
    }
}

// Instância global do gerenciador de unidade-trabalho
const unidadeWorkManager = new UnidadeWorkManager(pgrStorage);

document.addEventListener('DOMContentLoaded', function () {
    // Login Modal
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const mainApp = document.getElementById('main-app');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserSpan = document.getElementById('current-user');

    // Login com suporte a múltiplos usuários
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Verificar usuário admin padrão primeiro (compatibilidade)
        if (username === 'admin' && password === 'admin123') {
            loginModal.style.display = 'none';
            mainApp.style.display = '';
            currentUserSpan.textContent = 'Admin';
            inicializarSistema();
            return;
        }
        
        // Verificar usuários cadastrados
        try {
            const usuario = await pgrStorage.buscarUsuario(username);
            if (usuario && usuario.password === password) {
                loginModal.style.display = 'none';
                mainApp.style.display = '';
                currentUserSpan.textContent = usuario.fullName || usuario.username;
                inicializarSistema();
            } else {
                alert('Usuário ou senha inválidos!');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    });

    logoutBtn.addEventListener('click', function () {
        mainApp.style.display = 'none';
        loginModal.style.display = '';
        loginForm.reset();
    });

    // Modais de Registro
    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const cancelRegisterBtn = document.getElementById('cancel-register-btn');
    const registerMessage = document.getElementById('register-message');

    // Mostrar modal de registro
    showRegisterBtn.addEventListener('click', function () {
        loginModal.style.display = 'none';
        registerModal.style.display = '';
        registerForm.reset();
        hideMessage();
    });

    // Cancelar registro
    cancelRegisterBtn.addEventListener('click', function () {
        registerModal.style.display = 'none';
        loginModal.style.display = '';
        registerForm.reset();
        hideMessage();
    });

    // Função para mostrar mensagens
    function showMessage(text, type) {
        registerMessage.textContent = text;
        registerMessage.className = `message ${type}`;
        registerMessage.style.display = 'block';
    }

    function hideMessage() {
        registerMessage.style.display = 'none';
    }

    // Processamento do formulário de registro
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const fullName = document.getElementById('reg-fullname').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;

        // Validações
        if (username.length < 3) {
            showMessage('O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        // Verificar se usuário admin está sendo usado
        if (username.toLowerCase() === 'admin') {
            showMessage('O nome de usuário "admin" é reservado. Escolha outro nome.', 'error');
            return;
        }

        try {
            // Verificar se usuário já existe
            const usuarioExiste = await pgrStorage.verificarUsuarioExiste(username);
            if (usuarioExiste) {
                showMessage('Este nome de usuário já está em uso. Escolha outro.', 'error');
                return;
            }

            // Salvar novo usuário
            const novoUsuario = {
                username: username,
                fullName: fullName,
                password: password,
                createdAt: new Date().toISOString()
            };

            await pgrStorage.salvarUsuario(novoUsuario);
            showMessage('Conta criada com sucesso! Você pode fazer login agora.', 'success');

            // Voltar para login após 2 segundos
            setTimeout(() => {
                registerModal.style.display = 'none';
                loginModal.style.display = '';
                registerForm.reset();
                hideMessage();
                // Pré-preencher o campo de usuário na tela de login
                document.getElementById('username').value = username;
            }, 2000);

        } catch (error) {
            console.error('Erro ao criar conta:', error);
            showMessage('Erro ao criar conta. Tente novamente.', 'error');
        }
    });

    // Navegação entre seções
    // Lista de seções que requerem uma unidade selecionada
    const sectionsRequiringUnit = [
        'dashboard', 'checklist-pgr', 'inventario-riscos', 'plano-acao', 
        'gestao-documentos', 'relatorios-dashboards', 'notificacoes'
    ];
    
    // Função para verificar se uma seção requer unidade
    function sectionRequiresUnit(sectionId) {
        return sectionsRequiringUnit.includes(sectionId);
    }
    
    // Função para mostrar mensagem de unidade necessária
    function showUnitRequiredMessage() {
        alert('Para acessar esta funcionalidade, primeiro selecione uma unidade na aba "Gestão de Unidades".');
    }

    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const id = link.getAttribute('href').replace('#', '');
            
            // Verificar se a seção requer unidade selecionada
            if (sectionRequiresUnit(id)) {
                const currentUnit = unidadeWorkManager.getCurrentUnidade();
                if (!currentUnit) {
                    showUnitRequiredMessage();
                    return; // Impedir navegação
                }
            }
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            
            // Atualizar dados se entrar na seção de relatórios
            if (id === 'relatorios-dashboards') {
                atualizarRelatorios();
            } else if (id === 'gestao-documentos') {
                carregarDocumentosArmazenados();
            } else if (id === 'gestao-unidades') {
                carregarUnidadesArmazenadas();
            } else if (id === 'plano-acao') {
                carregarAcoesNaTabela();
            } else if (id === 'inventario-riscos') {
                // Carregar todas as tabelas de riscos
                const tiposRiscos = ['fisicos', 'quimicos', 'biologicos', 'ergonomicos', 'acidentes', 'psicossociais'];
                tiposRiscos.forEach(tipo => {
                    carregarRiscosNaTabela(tipo);
                });
            }
        });
    });

    // Função para atualizar o estado visual das abas baseado na seleção de unidade
    window.updateNavigationStates = function() {
        const currentUnit = unidadeWorkManager.getCurrentUnidade();
        const hasUnit = !!currentUnit;
        
        document.querySelectorAll('.nav-link').forEach(function (link) {
            const id = link.getAttribute('href').replace('#', '');
            
            if (sectionRequiresUnit(id)) {
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

    // Inicializar sistema após login
    function inicializarSistema() {
        configurarGestaoDocumentos();
        configurarGestaoUnidades();
        configurarFormulariosTrabalhos();
        configurarExportacao();
        carregarDocumentosArmazenados();
        carregarUnidadesArmazenadas();
        atualizarRelatorios();
        configurarMascarasInput();
        window.updateNavigationStates(); // Atualizar estados das abas
    }

    // Configurar máscaras de input para CNPJ e telefone
    function configurarMascarasInput() {
        // Aplicar máscara no campo CNPJ
        const cnpjField = document.getElementById('cnpjUnidade');
        if (cnpjField) {
            cnpjField.addEventListener('input', function(e) {
                aplicarMascaraCNPJ(e.target);
            });
            cnpjField.addEventListener('blur', function(e) {
                validarCNPJ(e.target);
            });
        }

        // Aplicar máscara no campo telefone  
        const telefoneField = document.getElementById('contatoUnidade');
        if (telefoneField) {
            telefoneField.addEventListener('input', function(e) {
                aplicarMascaraTelefone(e.target);
            });
            telefoneField.addEventListener('blur', function(e) {
                validarTelefone(e.target);
            });
        }
    }

    // Função para aplicar máscara de CNPJ (00.000.000/0000-00)
    function aplicarMascaraCNPJ(input) {
        let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        
        // Limita a 14 dígitos para CNPJ
        if (value.length > 14) {
            value = value.substring(0, 14);
        }
        
        // Aplica a máscara
        if (value.length >= 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        } else if (value.length >= 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3/$4');
        } else if (value.length >= 5) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3');
        } else if (value.length >= 2) {
            value = value.replace(/^(\d{2})(\d{3})$/, '$1.$2');
        }
        
        input.value = value;
    }

    // Função para validar CNPJ
    function validarCNPJ(input) {
        const cnpj = input.value.replace(/\D/g, '');
        
        // Verifica se tem 14 dígitos
        if (cnpj.length !== 14) {
            input.setCustomValidity('CNPJ deve conter 14 dígitos');
            return false;
        }
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cnpj)) {
            input.setCustomValidity('CNPJ inválido');
            return false;
        }
        
        // Validação dos dígitos verificadores do CNPJ
        let soma = 0;
        let pos = 5;
        
        // Primeiro dígito verificador
        for (let i = 0; i < 12; i++) {
            soma += parseInt(cnpj.charAt(i)) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(cnpj.charAt(12))) {
            input.setCustomValidity('CNPJ inválido');
            return false;
        }
        
        // Segundo dígito verificador
        soma = 0;
        pos = 6;
        for (let i = 0; i < 13; i++) {
            soma += parseInt(cnpj.charAt(i)) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(cnpj.charAt(13))) {
            input.setCustomValidity('CNPJ inválido');
            return false;
        }
        
        input.setCustomValidity('');
        return true;
    }

    // Função para aplicar máscara de telefone ((00) 90000-0000)
    function aplicarMascaraTelefone(input) {
        let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        
        // Limita a 11 dígitos (celular) ou 10 (fixo)
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // Aplica a máscara
        if (value.length >= 7) {
            if (value.length === 11) {
                // Celular: (00) 90000-0000
                value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (value.length === 10) {
                // Fixo: (00) 0000-0000
                value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
            } else {
                // Em digitação
                value = value.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
            }
        } else if (value.length >= 3) {
            value = value.replace(/^(\d{2})(\d{1,5})$/, '($1) $2');
        } else if (value.length >= 1) {
            value = value.replace(/^(\d{1,2})$/, '($1');
        }
        
        input.value = value;
    }

    // Função para validar telefone
    function validarTelefone(input) {
        const telefone = input.value.replace(/\D/g, '');
        
        // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
        if (telefone.length !== 10 && telefone.length !== 11) {
            input.setCustomValidity('Telefone deve conter 10 ou 11 dígitos');
            return false;
        }
        
        // Verifica se o código de área é válido (11-99)
        const codigoArea = telefone.substring(0, 2);
        if (parseInt(codigoArea) < 11) {
            input.setCustomValidity('Código de área inválido');
            return false;
        }
        
        // Para celulares (11 dígitos), o terceiro dígito deve ser 9
        if (telefone.length === 11 && telefone.charAt(2) !== '9') {
            input.setCustomValidity('Para celular, o terceiro dígito deve ser 9');
            return false;
        }
        
        input.setCustomValidity('');
        return true;
    }

    // Gestão de Documentos
    function configurarGestaoDocumentos() {
        const formDocumentos = document.getElementById('form-documentos');
        
        formDocumentos.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tipo = document.getElementById('tipoDocumento').value;
            const nome = document.getElementById('nomeDocumento').value;
            const dataEmissao = document.getElementById('dataEmissaoDoc').value;
            const arquivoInput = document.getElementById('arquivoDocumento');
            
            if (!arquivoInput.files[0]) {
                alert('Por favor, selecione um arquivo.');
                return;
            }
            
            const arquivo = arquivoInput.files[0];
            
            // Validar tamanho (máximo 10MB)
            if (arquivo.size > 10 * 1024 * 1024) {
                alert('O arquivo é muito grande. Máximo permitido: 10MB');
                return;
            }
            
            // Converter arquivo para base64
            const reader = new FileReader();
            reader.onload = async function(e) {
                const documento = {
                    tipo: tipo,
                    nome: nome || arquivo.name,
                    dataEmissao: dataEmissao,
                    nomeArquivo: arquivo.name,
                    tipoArquivo: arquivo.type,
                    tamanho: arquivo.size,
                    conteudo: e.target.result,
                    dataUpload: new Date().toISOString()
                };
                
                // Adicionar unidade_id automaticamente
                const documentoComUnidade = unidadeWorkManager.adicionarUnidadeAoTrabalho(documento);
                
                try {
                    await pgrStorage.salvarDocumento(documentoComUnidade);
                    alert('Documento salvo com sucesso!');
                    formDocumentos.reset();
                    carregarDocumentosArmazenados();
                } catch (error) {
                    console.error('Erro ao salvar documento:', error);
                    alert('Erro ao salvar documento. Tente novamente.');
                }
            };
            
            reader.readAsDataURL(arquivo);
        });
    }

    // Carregar documentos armazenados
    async function carregarDocumentosArmazenados() {
        try {
            const documentos = await pgrStorage.listarDocumentos();
            const tbody = document.querySelector('#documentos-armazenados-table tbody');
            tbody.innerHTML = '';
            
            documentos.forEach(doc => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${doc.tipo.toUpperCase()}</td>
                    <td>${doc.nome}</td>
                    <td>${doc.dataEmissao ? new Date(doc.dataEmissao).toLocaleDateString('pt-BR') : '-'}</td>
                    <td class="file-info">${formatarTamanho(doc.tamanho)}</td>
                    <td>
                        <div class="document-actions">
                            <button class="btn-small btn-download" onclick="baixarDocumento(${doc.id})">
                                📥 Baixar
                            </button>
                            <button class="btn-small btn-delete" onclick="excluirDocumento(${doc.id})">
                                🗑️ Excluir
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
        }
    }

    // Funções globais para manipulação de documentos
    window.baixarDocumento = async function(id) {
        try {
            const documentos = await pgrStorage.listarDocumentos();
            const documento = documentos.find(doc => doc.id === id);
            
            if (documento) {
                const link = document.createElement('a');
                link.href = documento.conteudo;
                link.download = documento.nomeArquivo;
                link.click();
            }
        } catch (error) {
            console.error('Erro ao baixar documento:', error);
            alert('Erro ao baixar documento.');
        }
    };

    window.excluirDocumento = async function(id) {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                await pgrStorage.excluirDocumento(id);
                alert('Documento excluído com sucesso!');
                carregarDocumentosArmazenados();
            } catch (error) {
                console.error('Erro ao excluir documento:', error);
                alert('Erro ao excluir documento.');
            }
        }
    };

    // Configurar formulários de trabalhos
    function configurarFormulariosTrabalhos() {
        // Configurar formulários de riscos
        const tiposRiscos = ['fisicos', 'quimicos', 'biologicos', 'ergonomicos', 'acidentes', 'psicossociais'];
        
        tiposRiscos.forEach(tipo => {
            const form = document.getElementById(`form-riscos-${tipo}`);
            if (form && !form._handlerConfigured) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    await salvarRisco(tipo, form);
                });
                form._handlerConfigured = true;
            }
        });
        
        // Configurar formulário de plano de ação
        const formAcoes = document.getElementById('form-plano-acao');
        if (formAcoes && !formAcoes._handlerConfigured) {
            formAcoes.addEventListener('submit', async function(e) {
                e.preventDefault();
                await salvarAcao(formAcoes);
            });
            formAcoes._handlerConfigured = true;
        }
    }

    // Salvar risco
    async function salvarRisco(tipo, form) {
        try {
            const formData = new FormData(form);
            const risco = {
                id: Date.now(),
                tipo: tipo,
                dataCriacao: new Date().toISOString()
            };
            
            // Capturar dados específicos por tipo de risco
            for (let [key, value] of formData.entries()) {
                risco[key] = value;
            }
            
            // Adicionar unidade_id
            const riscoComUnidade = unidadeWorkManager.adicionarUnidadeAoTrabalho(risco);
            
            // Salvar no storage
            const riscos = await pgrStorage.obterDados(`riscos-${tipo}`) || [];
            riscos.push(riscoComUnidade);
            await pgrStorage.salvarDados(`riscos-${tipo}`, riscos);
            
            alert(`Risco ${tipo} adicionado com sucesso!`);
            form.reset();
            await carregarRiscosNaTabela(tipo);
            
        } catch (error) {
            console.error(`Erro ao salvar risco ${tipo}:`, error);
            alert(`Erro ao salvar risco ${tipo}. Tente novamente.`);
        }
    }

    // Salvar ação
    async function salvarAcao(form) {
        try {
            const descricao = document.getElementById('descricaoAcao').value;
            const responsavel = document.getElementById('responsavelAcao').value;
            const prazo = document.getElementById('prazoAcao').value;
            const status = document.getElementById('statusAcao').value;
            const nivelRisco = document.getElementById('nivelRiscoAssociado').value;
            
            const acao = {
                id: Date.now(),
                descricao: descricao,
                responsavel: responsavel,
                prazo: prazo,
                status: status,
                nivelRisco: nivelRisco,
                dataCriacao: new Date().toISOString()
            };
            
            // Adicionar unidade_id
            const acaoComUnidade = unidadeWorkManager.adicionarUnidadeAoTrabalho(acao);
            
            // Salvar no storage
            const acoes = await pgrStorage.obterDados('acoes') || [];
            acoes.push(acaoComUnidade);
            await pgrStorage.salvarDados('acoes', acoes);
            
            alert('Ação adicionada com sucesso!');
            form.reset();
            await carregarAcoesNaTabela();
            
        } catch (error) {
            console.error('Erro ao salvar ação:', error);
            alert('Erro ao salvar ação. Tente novamente.');
        }
    }

    // Carregar riscos na tabela
    async function carregarRiscosNaTabela(tipo) {
        try {
            const riscos = await pgrStorage.obterDados(`riscos-${tipo}`) || [];
            const tbody = document.querySelector(`#riscos-${tipo}-table tbody`);
            if (tbody) {
                tbody.innerHTML = '';
                
                riscos.forEach(risco => {
                    const tr = document.createElement('tr');
                    // Criar células baseadas no tipo de risco
                    const colunas = getColunasPorTipoRisco(tipo, risco);
                    tr.innerHTML = colunas + `<td><button onclick="excluirRisco('${tipo}', ${risco.id})">Remover</button></td>`;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error(`Erro ao carregar riscos ${tipo}:`, error);
        }
    }

    // Carregar ações na tabela  
    async function carregarAcoesNaTabela() {
        try {
            const acoes = await pgrStorage.obterDados('acoes') || [];
            const tbody = document.querySelector('#acoes-registradas-table tbody');
            if (tbody) {
                tbody.innerHTML = '';
                
                acoes.forEach(acao => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${acao.descricao}</td>
                        <td>${acao.responsavel}</td>
                        <td>${new Date(acao.prazo).toLocaleDateString()}</td>
                        <td><span class="status-${acao.status}">${acao.status}</span></td>
                        <td><span class="risco-${acao.nivelRisco}">${acao.nivelRisco}</span></td>
                        <td><button onclick="excluirAcao(${acao.id})">Remover</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar ações:', error);
        }
    }

    // Obter colunas por tipo de risco
    function getColunasPorTipoRisco(tipo, risco) {
        switch (tipo) {
        case 'fisicos':
            return `<td>${risco.tipoRiscoFisico || ''}</td><td>${risco.fonteFisica || ''}</td><td>${risco.medidasControleFisico || ''}</td>`;
        case 'quimicos':
            return `<td>${risco.substanciaQuimica || ''}</td><td>${risco.concentracao || ''}</td><td>${risco.medidasControleQuimico || ''}</td>`;
        case 'biologicos':
            return `<td>${risco.agenteBiologico || ''}</td><td>${risco.tarefasExpostas || ''}</td><td>${risco.medidasControleBiologico || ''}</td>`;
        case 'ergonomicos':
            return `<td>${risco.tipoRiscoErgonomico || ''}</td><td>${risco.atividadeRiscoErgonomico || ''}</td><td>${risco.medidasControleErgonomico || ''}</td>`;
        case 'acidentes':
            return `<td>${risco.tipoRiscoAcidente || ''}</td><td>${risco.situacaoRisco || ''}</td><td>${risco.medidasControleAcidentes || ''}</td>`;
        case 'psicossociais':
            return `<td>${risco.fatorRiscoPsicossocial || ''}</td><td>${risco.impactoSaude || ''}</td><td>${risco.medidasControlePsicossocial || ''}</td>`;
        default:
            return '<td></td><td></td><td></td>';
        }
    }

    // Funções globais para exclusão
    window.excluirRisco = async function(tipo, riscoId) {
        if (confirm('Tem certeza que deseja excluir este risco?')) {
            try {
                const riscos = await pgrStorage.obterDados(`riscos-${tipo}`) || [];
                const riscosAtualizados = riscos.filter(r => r.id !== riscoId);
                await pgrStorage.salvarDados(`riscos-${tipo}`, riscosAtualizados);
                await carregarRiscosNaTabela(tipo);
                alert('Risco removido com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir risco:', error);
                alert('Erro ao excluir risco.');
            }
        }
    };

    window.excluirAcao = async function(acaoId) {
        if (confirm('Tem certeza que deseja excluir esta ação?')) {
            try {
                const acoes = await pgrStorage.obterDados('acoes') || [];
                const acoesAtualizadas = acoes.filter(a => a.id !== acaoId);
                await pgrStorage.salvarDados('acoes', acoesAtualizadas);
                await carregarAcoesNaTabela();
                alert('Ação removida com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir ação:', error);
                alert('Erro ao excluir ação.');
            }
        }
    };

    // Gestão de Unidades
    function configurarGestaoUnidades() {
        const formUnidades = document.getElementById('form-unidade');
        
        formUnidades.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nomeUnidade').value.trim();
            const cnpj = document.getElementById('cnpjUnidade').value.trim();
            const endereco = document.getElementById('enderecoUnidade').value.trim();
            const responsavel = document.getElementById('responsavelLegalUnidade').value.trim();
            const contato = document.getElementById('contatoUnidade').value.trim();
            
            // Validações básicas
            if (!nome || !cnpj || !endereco || !responsavel) {
                mostrarMensagemUnidade('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            // Validar CNPJ
            const cnpjField = document.getElementById('cnpjUnidade');
            if (!validarCNPJ(cnpjField)) {
                mostrarMensagemUnidade('Por favor, insira um CNPJ válido.', 'error');
                return;
            }
            
            const unidade = {
                id: Date.now(), // ID simples baseado em timestamp
                nome: nome,
                cnpj: cnpj,
                endereco: endereco,
                responsavel: responsavel,
                contato: contato,
                dataCriacao: new Date().toISOString(),
                ativa: true
            };
            
            try {
                // Obter unidades existentes
                const unidadesExistentes = await pgrStorage.obterDados('unidades') || [];
                
                // Verificar se já existe unidade com mesmo CNPJ
                const cnpjJaExiste = unidadesExistentes.find(u => u.cnpj === cnpj && u.ativa);
                if (cnpjJaExiste) {
                    mostrarMensagemUnidade('Já existe uma unidade cadastrada com este CNPJ.', 'error');
                    return;
                }
                
                // Adicionar nova unidade
                unidadesExistentes.push(unidade);
                
                // Salvar no IndexedDB
                await pgrStorage.salvarDados('unidades', unidadesExistentes);
                
                // Vincular todos os trabalhos existentes à nova unidade
                await unidadeWorkManager.vincularTodosTrabalhos(unidade.id);
                
                // Definir como unidade atual
                await unidadeWorkManager.setCurrentUnidade(unidade.id);
                
                mostrarMensagemUnidade('Unidade cadastrada com sucesso! Todos os trabalhos foram vinculados a esta unidade.', 'success');
                formUnidades.reset();
                carregarUnidadesArmazenadas();
                window.updateNavigationStates(); // Atualizar estado das abas de navegação
                
            } catch (error) {
                console.error('Erro ao salvar unidade:', error);
                mostrarMensagemUnidade('Erro ao salvar unidade. Tente novamente.', 'error');
            }
        });
    }

    // Carregar unidades armazenadas
    async function carregarUnidadesArmazenadas() {
        try {
            const unidades = await pgrStorage.obterDados('unidades') || [];
            const tbody = document.querySelector('#unidades-cadastradas-table tbody');
            tbody.innerHTML = '';
            
            // Filtrar apenas unidades ativas
            const unidadesAtivas = unidades.filter(u => u.ativa !== false);
            
            if (unidadesAtivas.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td colspan="4" style="text-align: center; color: #666; font-style: italic; padding: 20px;">
                        Nenhuma unidade cadastrada
                    </td>
                `;
                tbody.appendChild(tr);
                // Esconder seletor de unidade se não há unidades
                const selectorContainer = document.getElementById('unit-selector-container');
                if (selectorContainer) {
                    selectorContainer.style.display = 'none';
                }
                return;
            }
            
            unidadesAtivas.forEach(unidade => {
                const tr = document.createElement('tr');
                const currentUnit = unidadeWorkManager.getCurrentUnidade();
                const isCurrentUnit = currentUnit == unidade.id;
                
                tr.innerHTML = `
                    <td>${unidade.nome} ${isCurrentUnit ? '<strong>(Atual)</strong>' : ''}</td>
                    <td>${unidade.cnpj}</td>
                    <td>${unidade.responsavel}</td>
                    <td>
                        <div class="unit-actions">
                            ${!isCurrentUnit ? `<button class="btn-small btn-select" onclick="selecionarUnidade(${unidade.id})" title="Selecionar como atual">
                                🎯 Selecionar
                            </button>` : ''}
                            <button class="btn-small btn-edit" onclick="editarUnidade(${unidade.id})" title="Editar">
                                ✏️ Editar
                            </button>
                            <button class="btn-small btn-delete" onclick="excluirUnidade(${unidade.id})" title="Excluir">
                                🗑️ Excluir
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Atualizar seletor de unidade
            await atualizarSeletorUnidade(unidadesAtivas);
            
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
            mostrarMensagemUnidade('Erro ao carregar unidades.', 'error');
        }
    }

    // Atualizar seletor de unidade
    async function atualizarSeletorUnidade(unidades) {
        // Verificar se o seletor já existe, senão criar
        let selectorContainer = document.getElementById('unit-selector-container');
        if (!selectorContainer) {
            selectorContainer = document.createElement('div');
            selectorContainer.id = 'unit-selector-container';
            selectorContainer.className = 'unit-selector-container';
            selectorContainer.innerHTML = `
                <h3>Unidade Ativa</h3>
                <div class="form-group">
                    <label for="unit-selector">Selecione a unidade para vincular trabalhos:</label>
                    <select id="unit-selector" class="unit-selector">
                        <option value="">Selecione uma unidade...</option>
                    </select>
                </div>
                <p class="unit-selector-info">Todos os trabalhos (checklist, riscos, ações, documentos) serão vinculados à unidade selecionada.</p>
            `;
            
            // Inserir após a tabela de unidades
            const table = document.getElementById('unidades-cadastradas-table');
            table.insertAdjacentElement('afterend', selectorContainer);
            
            // Adicionar event listener
            const selector = document.getElementById('unit-selector');
            selector.addEventListener('change', async function(e) {
                const unidadeId = e.target.value;
                if (unidadeId) {
                    await window.selecionarUnidade(parseInt(unidadeId));
                }
            });
        }
        
        // Atualizar opções do seletor
        const selector = document.getElementById('unit-selector');
        selector.innerHTML = '<option value="">Selecione uma unidade...</option>';
        
        const currentUnit = unidadeWorkManager.getCurrentUnidade();
        
        unidades.forEach(unidade => {
            const option = document.createElement('option');
            option.value = unidade.id;
            option.textContent = unidade.nome;
            if (currentUnit == unidade.id) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
        
        // Mostrar o container se há unidades
        if (unidades.length > 0) {
            selectorContainer.style.display = 'block';
        }
    }

    // Função para mostrar mensagens específicas para unidades
    function mostrarMensagemUnidade(texto, tipo) {
        // Criar ou atualizar elemento de mensagem
        let mensagemEl = document.getElementById('unidade-message');
        if (!mensagemEl) {
            mensagemEl = document.createElement('div');
            mensagemEl.id = 'unidade-message';
            mensagemEl.className = 'message';
            
            // Inserir após o formulário
            const form = document.getElementById('form-unidade');
            form.insertAdjacentElement('afterend', mensagemEl);
        }
        
        mensagemEl.textContent = texto;
        mensagemEl.className = `message ${tipo}`;
        mensagemEl.style.display = 'block';
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            if (mensagemEl && mensagemEl.parentNode) {
                mensagemEl.style.display = 'none';
            }
        }, 5000);
    }

    // Funções globais para manipulação de unidades
    window.selecionarUnidade = async function(unidadeId) {
        try {
            await unidadeWorkManager.setCurrentUnidade(unidadeId);
            const unidades = await pgrStorage.obterDados('unidades') || [];
            const unidade = unidades.find(u => u.id === unidadeId);
            
            if (unidade) {
                mostrarMensagemUnidade(`Unidade "${unidade.nome}" selecionada! Todos os trabalhos foram vinculados a esta unidade.`, 'success');
                carregarUnidadesArmazenadas(); // Recarregar para atualizar indicação visual
                window.updateNavigationStates(); // Atualizar estado das abas de navegação
            }
        } catch (error) {
            console.error('Erro ao selecionar unidade:', error);
            mostrarMensagemUnidade('Erro ao selecionar unidade.', 'error');
        }
    };

    window.editarUnidade = async function(id) {
        try {
            const unidades = await pgrStorage.obterDados('unidades') || [];
            const unidade = unidades.find(u => u.id === id);
            
            if (unidade) {
                // Preencher formulário com dados da unidade
                document.getElementById('nomeUnidade').value = unidade.nome;
                document.getElementById('cnpjUnidade').value = unidade.cnpj;
                document.getElementById('enderecoUnidade').value = unidade.endereco;
                document.getElementById('responsavelLegalUnidade').value = unidade.responsavel;
                document.getElementById('contatoUnidade').value = unidade.contato || '';
                
                // Alterar o comportamento do botão de submit para atualização
                const form = document.getElementById('form-unidade');
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.textContent = 'Atualizar Unidade';
                submitBtn.dataset.editingId = id;
                
                // Adicionar botão de cancelar edição
                let cancelBtn = document.getElementById('cancel-edit-btn');
                if (!cancelBtn) {
                    cancelBtn = document.createElement('button');
                    cancelBtn.id = 'cancel-edit-btn';
                    cancelBtn.type = 'button';
                    cancelBtn.textContent = 'Cancelar Edição';
                    cancelBtn.className = 'secondary-btn';
                    cancelBtn.style.marginLeft = '10px';
                    
                    cancelBtn.addEventListener('click', function() {
                        form.reset();
                        submitBtn.textContent = originalText;
                        delete submitBtn.dataset.editingId;
                        cancelBtn.remove();
                    });
                    
                    submitBtn.insertAdjacentElement('afterend', cancelBtn);
                }
                
                // Modificar o handler do formulário temporariamente
                form.removeEventListener('submit', form._originalHandler);
                form._updateHandler = async function(e) {
                    e.preventDefault();
                    
                    const nome = document.getElementById('nomeUnidade').value.trim();
                    const cnpj = document.getElementById('cnpjUnidade').value.trim();
                    const endereco = document.getElementById('enderecoUnidade').value.trim();
                    const responsavel = document.getElementById('responsavelLegalUnidade').value.trim();
                    const contato = document.getElementById('contatoUnidade').value.trim();
                    
                    if (!nome || !cnpj || !endereco || !responsavel) {
                        mostrarMensagemUnidade('Por favor, preencha todos os campos obrigatórios.', 'error');
                        return;
                    }
                    
                    try {
                        const unidadesAtualizadas = await pgrStorage.obterDados('unidades') || [];
                        const indice = unidadesAtualizadas.findIndex(u => u.id === parseInt(id));
                        
                        if (indice !== -1) {
                            unidadesAtualizadas[indice] = {
                                ...unidadesAtualizadas[indice],
                                nome: nome,
                                cnpj: cnpj,
                                endereco: endereco,
                                responsavel: responsavel,
                                contato: contato,
                                dataAtualizacao: new Date().toISOString()
                            };
                            
                            await pgrStorage.salvarDados('unidades', unidadesAtualizadas);
                            mostrarMensagemUnidade('Unidade atualizada com sucesso!', 'success');
                            form.reset();
                            submitBtn.textContent = originalText;
                            delete submitBtn.dataset.editingId;
                            cancelBtn.remove();
                            carregarUnidadesArmazenadas();
                            
                            // Restaurar handler original
                            form.removeEventListener('submit', form._updateHandler);
                            configurarGestaoUnidades();
                        }
                    } catch (error) {
                        console.error('Erro ao atualizar unidade:', error);
                        mostrarMensagemUnidade('Erro ao atualizar unidade. Tente novamente.', 'error');
                    }
                };
                
                form.addEventListener('submit', form._updateHandler);
                
                // Scroll para o formulário
                form.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Erro ao editar unidade:', error);
            mostrarMensagemUnidade('Erro ao carregar dados da unidade.', 'error');
        }
    };

    window.excluirUnidade = async function(id) {
        if (confirm('Tem certeza que deseja excluir esta unidade?\n\nEsta ação não pode ser desfeita.')) {
            try {
                const unidades = await pgrStorage.obterDados('unidades') || [];
                const unidadesAtualizadas = unidades.map(u => 
                    u.id === id ? { ...u, ativa: false, dataExclusao: new Date().toISOString() } : u
                );
                
                await pgrStorage.salvarDados('unidades', unidadesAtualizadas);
                mostrarMensagemUnidade('Unidade excluída com sucesso!', 'success');
                carregarUnidadesArmazenadas();
            } catch (error) {
                console.error('Erro ao excluir unidade:', error);
                mostrarMensagemUnidade('Erro ao excluir unidade.', 'error');
            }
        }
    };

    // Configurar exportação de relatórios
    function configurarExportacao() {
        document.getElementById('export-pdf').addEventListener('click', exportarPDF);
        document.getElementById('export-excel').addEventListener('click', exportarExcel);
        document.getElementById('print-report').addEventListener('click', imprimirRelatorio);
    }

    // Exportar para PDF
    function exportarPDF() {
        const elemento = document.getElementById('report-content');
        const opt = {
            margin: 1,
            filename: `relatorio-pgr-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Usar html2pdf se disponível
        if (typeof html2pdf !== 'undefined') {
            html2pdf().from(elemento).set(opt).save();
        } else {
            // Fallback: usar funcionalidade de impressão
            alert('Biblioteca PDF não disponível. Redirecionando para função de impressão como alternativa.');
            imprimirRelatorio();
        }
    }

    // Exportar para Excel
    function exportarExcel() {
        try {
            // Coletar dados das tabelas
            const dadosCSV = [];
            
            // Cabeçalho do relatório
            dadosCSV.push(['Resumo Executivo do PGR']);
            dadosCSV.push(['']);
            dadosCSV.push(['Status Geral', document.querySelector('#report-content .status-value').textContent]);
            dadosCSV.push(['Total de Riscos', document.getElementById('total-riscos').textContent]);
            dadosCSV.push(['Ações Pendentes', document.getElementById('total-acoes-pendentes').textContent]);
            dadosCSV.push(['Conformidade', document.getElementById('percentual-conformidade').textContent]);
            dadosCSV.push(['']);
            dadosCSV.push(['Riscos por Categoria']);
            dadosCSV.push(['Categoria', 'Quantidade', 'Alto Risco', 'Médio Risco', 'Baixo Risco']);
            
            // Dados da tabela de riscos
            const tabelaRiscos = document.querySelector('#relatorio-riscos-tabela tbody');
            const linhasRiscos = tabelaRiscos.querySelectorAll('tr');
            linhasRiscos.forEach(linha => {
                const colunas = linha.querySelectorAll('td');
                const dadosLinha = Array.from(colunas).map(col => col.textContent);
                dadosCSV.push(dadosLinha);
            });
            
            dadosCSV.push(['']);
            dadosCSV.push(['Status das Ações']);
            dadosCSV.push(['Status', 'Quantidade', 'Percentual']);
            
            // Dados da tabela de ações
            const tabelaAcoes = document.querySelector('#relatorio-acoes-tabela tbody');
            const linhasAcoes = tabelaAcoes.querySelectorAll('tr');
            linhasAcoes.forEach(linha => {
                const colunas = linha.querySelectorAll('td');
                const dadosLinha = Array.from(colunas).map(col => col.textContent);
                dadosCSV.push(dadosLinha);
            });

            // Tentar usar XLSX se disponível
            if (typeof XLSX !== 'undefined') {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(dadosCSV);
                XLSX.utils.book_append_sheet(wb, ws, 'Resumo PGR');
                XLSX.writeFile(wb, `relatorio-pgr-${new Date().toISOString().split('T')[0]}.xlsx`);
            } else {
                // Fallback: exportar como CSV
                const filename = `relatorio-pgr-${new Date().toISOString().split('T')[0]}.csv`;
                window.exportFallbacks.exportToCSV(dadosCSV, filename);
            }
            
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao exportar dados. As bibliotecas de exportação podem não estar disponíveis.');
        }
    }

    // Imprimir relatório
    function imprimirRelatorio() {
        // Salvar seção atual
        const secaoAtual = document.querySelector('.content-section.active');
        
        // Mostrar apenas a seção de relatórios
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('relatorios-dashboards').classList.add('active');
        
        // Imprimir
        window.print();
        
        // Restaurar seção original
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        if (secaoAtual) {
            secaoAtual.classList.add('active');
        }
    }

    // Atualizar dados dos relatórios
    async function atualizarRelatorios() {
        // Simular dados ou carregar do storage
        try {
            // Aqui você pode carregar dados reais do sistema
            // Por ora, vamos usar dados de exemplo
            
            const totalRiscos = Math.floor(Math.random() * 50) + 10;
            const acoesPendentes = Math.floor(Math.random() * 20) + 5;
            const conformidade = Math.floor(Math.random() * 30) + 70;
            
            document.getElementById('total-riscos').textContent = totalRiscos;
            document.getElementById('total-acoes-pendentes').textContent = acoesPendentes;
            document.getElementById('percentual-conformidade').textContent = conformidade + '%';
            
            // Atualizar tabela de riscos com dados aleatórios para demonstração
            const categorias = ['fisicos', 'quimicos', 'biologicos', 'ergonomicos', 'acidentes', 'psicossociais'];
            categorias.forEach(categoria => {
                const total = Math.floor(Math.random() * 10) + 1;
                const alto = Math.floor(Math.random() * 3);
                const medio = Math.floor(Math.random() * 4) + 1;
                const baixo = total - alto - medio;
                
                document.getElementById(`count-${categoria}`).textContent = total;
                document.getElementById(`alto-${categoria}`).textContent = alto;
                document.getElementById(`medio-${categoria}`).textContent = medio;
                document.getElementById(`baixo-${categoria}`).textContent = baixo >= 0 ? baixo : 0;
            });
            
            // Atualizar tabela de ações
            const statusAcoes = ['pendente', 'progresso', 'concluido', 'atrasado'];
            const totalAcoes = acoesPendentes + Math.floor(Math.random() * 30) + 10;
            statusAcoes.forEach(status => {
                const count = Math.floor(Math.random() * 10) + 1;
                const percentual = Math.round((count / totalAcoes) * 100);
                
                document.getElementById(`count-${status}`).textContent = count;
                document.getElementById(`perc-${status}`).textContent = percentual + '%';
            });
            
        } catch (error) {
            console.error('Erro ao atualizar relatórios:', error);
        }
    }

    // Função auxiliar para formatar tamanho de arquivo
    function formatarTamanho(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
    }

    // Exemplo: Adicionar item ao checklist
    document.getElementById('add-checklist-item').addEventListener('click', function () {
        const tbody = document.querySelector('#checklist-table tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>Novo item</td>
            <td>Pendente</td>
            <td></td>
            <td></td>
            <td></td>
            <td>Médio</td>
            <td></td>
            <td><button onclick="this.parentNode.parentNode.remove()">Remover</button></td>`;
        tbody.appendChild(tr);
    });
});
