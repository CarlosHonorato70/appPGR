// Sistema de Gestão de PGR - app.js

// Armazenamento local usando IndexedDB
class PGRStorage {
    constructor() {
        this.dbName = 'pgrDB';
        this.dbVersion = 2; // Incrementado para criar o novo store de usuários
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
                    const dadosStore = db.createObjectStore('dados', { keyPath: 'tipo' });
                }

                // Store para usuários
                if (!db.objectStoreNames.contains('usuarios')) {
                    const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
                    usuariosStore.createIndex('login', 'login', { unique: true });
                    usuariosStore.createIndex('email', 'email', { unique: true });
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
    async salvarUsuario(usuario) {
        const transaction = this.db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        return new Promise((resolve, reject) => {
            const request = usuario.id ? store.put(usuario) : store.add(usuario);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async buscarUsuarioPorLogin(login) {
        const transaction = this.db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        const index = store.index('login');
        return new Promise((resolve, reject) => {
            const request = index.get(login);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async buscarUsuarioPorEmail(email) {
        const transaction = this.db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        const index = store.index('email');
        return new Promise((resolve, reject) => {
            const request = index.get(email);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async listarUsuarios() {
        const transaction = this.db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async atualizarUsuario(usuario) {
        const transaction = this.db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        return new Promise((resolve, reject) => {
            const request = store.put(usuario);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async excluirUsuario(id) {
        const transaction = this.db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Instância global do storage
const pgrStorage = new PGRStorage();

// Funções utilitárias para gerenciamento de usuários
class UserManager {
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static validatePassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('A senha deve ter pelo menos 8 caracteres');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra maiúscula');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra minúscula');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('A senha deve conter pelo menos um número');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('A senha deve conter pelo menos um símbolo (!@#$%^&*(),.?":{}|<>)');
        }
        return errors;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static async loginUser(login, password) {
        try {
            // Primeiro verifica se é o admin padrão
            if (login === 'admin' && password === 'admin123') {
                return {
                    id: 0,
                    login: 'admin',
                    nome: 'Administrador',
                    email: 'admin@sistema.com',
                    tipo: 'admin',
                    ativo: true
                };
            }

            // Busca o usuário no banco
            const hashedPassword = await this.hashPassword(password);
            const usuario = await pgrStorage.buscarUsuarioPorLogin(login);
            
            if (usuario && usuario.senha === hashedPassword && usuario.ativo) {
                return usuario;
            }
            return null;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return null;
        }
    }
}

// Estado global do usuário atual
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    inicializarSistemaCompleto();
});

// Também executar se o DOMContentLoaded já foi disparado
if (document.readyState === 'loading') {
    // DOMContentLoaded ainda não foi disparado, então o event listener funciona
} else {
    // DOMContentLoaded já foi disparado, então executar imediatamente
    inicializarSistemaCompleto();
}

function inicializarSistemaCompleto() {
    // Login Modal
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const mainApp = document.getElementById('main-app');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserSpan = document.getElementById('current-user');

    // Login form
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const usuario = await UserManager.loginUser(username, password);
            if (usuario) {
                currentUser = usuario;
                loginModal.style.display = 'none';
                mainApp.style.display = '';
                currentUserSpan.textContent = usuario.nome;
                inicializarSistema();
            } else {
                alert('Usuário ou senha inválidos!');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    });

    logoutBtn.addEventListener('click', function () {
        currentUser = null;
        mainApp.style.display = 'none';
        loginModal.style.display = '';
        loginForm.reset();
    });

    // Navegação entre seções
    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            const id = link.getAttribute('href').replace('#', '');
            document.getElementById(id).classList.add('active');
            
            // Atualizar dados se entrar na seção de relatórios
            if (id === 'relatorios-dashboards') {
                atualizarRelatorios();
            } else if (id === 'gestao-documentos') {
                carregarDocumentosArmazenados();
            } else if (id === 'perfis-usuario') {
                configurarGerenciamentoUsuarios();
            }
        });
    });

    // Inicializar sistema após login
    function inicializarSistema() {
        configurarGestaoDocumentos();
        configurarExportacao();
        configurarGerenciamentoUsuarios();
        carregarDocumentosArmazenados();
        atualizarRelatorios();
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
                
                try {
                    await pgrStorage.salvarDocumento(documento);
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

    // Gerenciamento de usuários
    function configurarGerenciamentoUsuarios() {
        configurarModalCadastro();
        configurarTabsUsuarios();
        configurarFormularios();
        carregarDadosUsuario();
        
        // Mostrar/esconder tab de lista baseado no tipo de usuário
        const listaTab = document.getElementById('lista-usuarios-tab');
        if (currentUser && currentUser.tipo === 'admin') {
            listaTab.style.display = 'block';
            carregarListaUsuarios();
        } else {
            listaTab.style.display = 'none';
        }
    }

    function configurarModalCadastro() {
        const showRegisterBtn = document.getElementById('show-register-form');
        const showLoginBtn = document.getElementById('show-login-form');
        const cancelRegisterBtn = document.getElementById('cancel-register');
        const registerModal = document.getElementById('register-modal');
        const loginModal = document.getElementById('login-modal');
        const registerForm = document.getElementById('register-form');

        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = '';
        });

        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = '';
        });

        cancelRegisterBtn.addEventListener('click', function() {
            registerModal.style.display = 'none';
            loginModal.style.display = '';
            registerForm.reset();
            limparFeedbacks();
        });

        // Configurar validações em tempo real para o registro
        const registerLogin = document.getElementById('register-login');
        const registerEmail = document.getElementById('register-email');
        const registerSenha = document.getElementById('register-senha');
        const registerConfirmaSenha = document.getElementById('register-confirma-senha');

        registerLogin.addEventListener('blur', validarLogin);
        registerEmail.addEventListener('blur', validarEmail);
        registerSenha.addEventListener('input', validarSenha);
        registerConfirmaSenha.addEventListener('input', validarConfirmacaoSenha);

        registerForm.addEventListener('submit', processarCadastro);
    }

    function configurarTabsUsuarios() {
        const tabs = document.querySelectorAll('.user-tab');
        const contents = document.querySelectorAll('.user-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                document.getElementById(`user-tab-${tabName}`).classList.add('active');
                
                // Load data if needed
                if (tabName === 'lista' && currentUser && currentUser.tipo === 'admin') {
                    carregarListaUsuarios();
                } else if (tabName === 'perfil') {
                    carregarDadosUsuario();
                }
            });
        });
    }

    function configurarFormularios() {
        // Formulário de cadastro de usuário (admin)
        const formCadastro = document.getElementById('form-cadastro-usuario');
        if (formCadastro) {
            const cadastroLogin = document.getElementById('cadastro-login');
            const cadastroEmail = document.getElementById('cadastro-email');
            const cadastroSenha = document.getElementById('cadastro-senha');
            const cadastroConfirmaSenha = document.getElementById('cadastro-confirma-senha');

            cadastroLogin.addEventListener('blur', validarLogin);
            cadastroEmail.addEventListener('blur', validarEmail);
            cadastroSenha.addEventListener('input', validarSenha);
            cadastroConfirmaSenha.addEventListener('input', validarConfirmacaoSenha);

            formCadastro.addEventListener('submit', processarCadastroAdmin);
        }

        // Formulário de edição de perfil
        const formPerfil = document.getElementById('form-editar-perfil');
        if (formPerfil) {
            formPerfil.addEventListener('submit', processarEdicaoPerfil);
        }

        // Formulário de alteração de senha
        const formSenha = document.getElementById('form-alterar-senha');
        if (formSenha) {
            const novaSenha = document.getElementById('nova-senha');
            const confirmaNovaSenha = document.getElementById('confirma-nova-senha');

            novaSenha.addEventListener('input', validarNovaSenha);
            confirmaNovaSenha.addEventListener('input', validarConfirmacaoNovaSenha);

            formSenha.addEventListener('submit', processarAlteracaoSenha);
        }
    }

    async function validarLogin(e) {
        const login = e.target.value;
        const feedbackElement = document.getElementById(e.target.id.replace('login', 'login-feedback')) || 
                               document.getElementById('register-login-feedback');
        
        if (!login) {
            mostrarFeedback(feedbackElement, '', '');
            return;
        }

        if (login.length < 3 || login.length > 20) {
            mostrarFeedback(feedbackElement, 'Login deve ter entre 3 e 20 caracteres', 'error');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(login)) {
            mostrarFeedback(feedbackElement, 'Login pode conter apenas letras, números e underscore', 'error');
            return;
        }

        // Verificar se já existe (exceto quando está editando o próprio usuário)
        try {
            const usuarioExistente = await pgrStorage.buscarUsuarioPorLogin(login);
            if (usuarioExistente && (!currentUser || usuarioExistente.id !== currentUser.id)) {
                mostrarFeedback(feedbackElement, 'Este login já está em uso', 'error');
            } else {
                mostrarFeedback(feedbackElement, 'Login disponível', 'success');
            }
        } catch (error) {
            console.error('Erro ao validar login:', error);
        }
    }

    async function validarEmail(e) {
        const email = e.target.value;
        const feedbackElement = document.getElementById(e.target.id.replace('email', 'email-feedback')) || 
                               document.getElementById('register-email-feedback');
        
        if (!email) {
            mostrarFeedback(feedbackElement, '', '');
            return;
        }

        if (!UserManager.validateEmail(email)) {
            mostrarFeedback(feedbackElement, 'Email inválido', 'error');
            return;
        }

        // Verificar se já existe (exceto quando está editando o próprio usuário)
        try {
            const usuarioExistente = await pgrStorage.buscarUsuarioPorEmail(email);
            if (usuarioExistente && (!currentUser || usuarioExistente.id !== currentUser.id)) {
                mostrarFeedback(feedbackElement, 'Este email já está em uso', 'error');
            } else {
                mostrarFeedback(feedbackElement, 'Email válido', 'success');
            }
        } catch (error) {
            console.error('Erro ao validar email:', error);
        }
    }

    function validarSenha(e) {
        const senha = e.target.value;
        const strengthElement = document.getElementById(e.target.id.replace('senha', 'senha-strength')) || 
                               document.getElementById('register-senha-strength');
        const feedbackElement = document.getElementById(e.target.id.replace('senha', 'senha-feedback')) || 
                               document.getElementById('register-senha-feedback');

        const erros = UserManager.validatePassword(senha);
        
        if (erros.length === 0) {
            mostrarFeedback(feedbackElement, 'Senha forte', 'success');
            mostrarStrength(strengthElement, 'Senha forte', 'strength-strong');
        } else if (erros.length <= 2) {
            mostrarFeedback(feedbackElement, erros.join(', '), 'error');
            mostrarStrength(strengthElement, 'Senha média', 'strength-medium');
        } else {
            mostrarFeedback(feedbackElement, erros.join(', '), 'error');
            mostrarStrength(strengthElement, 'Senha fraca', 'strength-weak');
        }
    }

    function validarConfirmacaoSenha(e) {
        const confirmacao = e.target.value;
        const senhaOriginal = document.getElementById(e.target.id.replace('confirma-senha', 'senha')).value ||
                             document.getElementById('register-senha').value;
        const feedbackElement = document.getElementById(e.target.id.replace('senha', 'senha-feedback')) || 
                               document.getElementById('register-confirma-senha-feedback');

        if (!confirmacao) {
            mostrarFeedback(feedbackElement, '', '');
            return;
        }

        if (confirmacao === senhaOriginal) {
            mostrarFeedback(feedbackElement, 'Senhas conferem', 'success');
        } else {
            mostrarFeedback(feedbackElement, 'Senhas não conferem', 'error');
        }
    }

    function validarNovaSenha(e) {
        const senha = e.target.value;
        const strengthElement = document.getElementById('nova-senha-strength');
        const feedbackElement = document.getElementById('nova-senha-feedback');

        const erros = UserManager.validatePassword(senha);
        
        if (erros.length === 0) {
            mostrarFeedback(feedbackElement, 'Senha forte', 'success');
            mostrarStrength(strengthElement, 'Senha forte', 'strength-strong');
        } else if (erros.length <= 2) {
            mostrarFeedback(feedbackElement, erros.join(', '), 'error');
            mostrarStrength(strengthElement, 'Senha média', 'strength-medium');
        } else {
            mostrarFeedback(feedbackElement, erros.join(', '), 'error');
            mostrarStrength(strengthElement, 'Senha fraca', 'strength-weak');
        }
    }

    function validarConfirmacaoNovaSenha(e) {
        const confirmacao = e.target.value;
        const senhaOriginal = document.getElementById('nova-senha').value;
        const feedbackElement = document.getElementById('confirma-nova-senha-feedback');

        if (!confirmacao) {
            mostrarFeedback(feedbackElement, '', '');
            return;
        }

        if (confirmacao === senhaOriginal) {
            mostrarFeedback(feedbackElement, 'Senhas conferem', 'success');
        } else {
            mostrarFeedback(feedbackElement, 'Senhas não conferem', 'error');
        }
    }

    function mostrarFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `feedback-message ${type}`;
    }

    function mostrarStrength(element, message, strengthClass) {
        if (!element) return;
        element.textContent = message;
        element.className = `password-strength ${strengthClass}`;
    }

    function limparFeedbacks() {
        const feedbacks = document.querySelectorAll('.feedback-message, .password-strength');
        feedbacks.forEach(element => {
            element.textContent = '';
            element.className = element.className.replace(/\s*(error|success|strength-\w+)/g, '');
        });
    }

    async function processarCadastro(e) {
        e.preventDefault();
        
        const nome = document.getElementById('register-nome').value;
        const login = document.getElementById('register-login').value;
        const email = document.getElementById('register-email').value;
        const senha = document.getElementById('register-senha').value;
        const confirmaSenha = document.getElementById('register-confirma-senha').value;

        // Validações
        if (senha !== confirmaSenha) {
            alert('As senhas não conferem!');
            return;
        }

        const errosSenha = UserManager.validatePassword(senha);
        if (errosSenha.length > 0) {
            alert('Senha inválida: ' + errosSenha.join(', '));
            return;
        }

        if (!UserManager.validateEmail(email)) {
            alert('Email inválido!');
            return;
        }

        try {
            // Verificar se login já existe
            const loginExiste = await pgrStorage.buscarUsuarioPorLogin(login);
            if (loginExiste) {
                alert('Este login já está em uso!');
                return;
            }

            // Verificar se email já existe
            const emailExiste = await pgrStorage.buscarUsuarioPorEmail(email);
            if (emailExiste) {
                alert('Este email já está em uso!');
                return;
            }

            // Criar usuário
            const senhaHash = await UserManager.hashPassword(senha);
            const novoUsuario = {
                nome: nome,
                login: login,
                email: email,
                senha: senhaHash,
                tipo: 'usuario',
                ativo: true,
                dataCriacao: new Date().toISOString()
            };

            await pgrStorage.salvarUsuario(novoUsuario);
            alert('Usuário cadastrado com sucesso! Faça login com suas credenciais.');
            
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('login-modal').style.display = '';
            document.getElementById('register-form').reset();
            limparFeedbacks();
            
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Erro ao cadastrar usuário. Tente novamente.');
        }
    }

    async function processarCadastroAdmin(e) {
        e.preventDefault();
        
        const nome = document.getElementById('cadastro-nome').value;
        const login = document.getElementById('cadastro-login').value;
        const email = document.getElementById('cadastro-email').value;
        const senha = document.getElementById('cadastro-senha').value;
        const confirmaSenha = document.getElementById('cadastro-confirma-senha').value;
        const tipo = document.getElementById('cadastro-tipo').value;

        // Validações
        if (senha !== confirmaSenha) {
            alert('As senhas não conferem!');
            return;
        }

        const errosSenha = UserManager.validatePassword(senha);
        if (errosSenha.length > 0) {
            alert('Senha inválida: ' + errosSenha.join(', '));
            return;
        }

        if (!UserManager.validateEmail(email)) {
            alert('Email inválido!');
            return;
        }

        try {
            // Verificar se login já existe
            const loginExiste = await pgrStorage.buscarUsuarioPorLogin(login);
            if (loginExiste) {
                alert('Este login já está em uso!');
                return;
            }

            // Verificar se email já existe
            const emailExiste = await pgrStorage.buscarUsuarioPorEmail(email);
            if (emailExiste) {
                alert('Este email já está em uso!');
                return;
            }

            // Criar usuário
            const senhaHash = await UserManager.hashPassword(senha);
            const novoUsuario = {
                nome: nome,
                login: login,
                email: email,
                senha: senhaHash,
                tipo: tipo,
                ativo: true,
                dataCriacao: new Date().toISOString()
            };

            await pgrStorage.salvarUsuario(novoUsuario);
            alert('Usuário cadastrado com sucesso!');
            
            document.getElementById('form-cadastro-usuario').reset();
            limparFeedbacks();
            carregarListaUsuarios();
            
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Erro ao cadastrar usuário. Tente novamente.');
        }
    }

    async function processarEdicaoPerfil(e) {
        e.preventDefault();
        
        if (!currentUser || currentUser.id === 0) {
            alert('Não é possível editar o perfil do usuário admin padrão.');
            return;
        }

        const nome = document.getElementById('perfil-nome').value;
        const email = document.getElementById('perfil-email').value;

        if (!UserManager.validateEmail(email)) {
            alert('Email inválido!');
            return;
        }

        try {
            // Verificar se email já existe (diferente do atual)
            const emailExiste = await pgrStorage.buscarUsuarioPorEmail(email);
            if (emailExiste && emailExiste.id !== currentUser.id) {
                alert('Este email já está em uso!');
                return;
            }

            // Atualizar usuário
            const usuarioAtualizado = {
                ...currentUser,
                nome: nome,
                email: email,
                dataAtualizacao: new Date().toISOString()
            };

            await pgrStorage.atualizarUsuario(usuarioAtualizado);
            currentUser = usuarioAtualizado;
            
            // Atualizar nome na interface
            document.getElementById('current-user').textContent = nome;
            
            alert('Perfil atualizado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        }
    }

    async function processarAlteracaoSenha(e) {
        e.preventDefault();
        
        if (!currentUser || currentUser.id === 0) {
            alert('Não é possível alterar a senha do usuário admin padrão.');
            return;
        }

        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmaNovaSenha = document.getElementById('confirma-nova-senha').value;

        if (novaSenha !== confirmaNovaSenha) {
            alert('As novas senhas não conferem!');
            return;
        }

        const errosSenha = UserManager.validatePassword(novaSenha);
        if (errosSenha.length > 0) {
            alert('Nova senha inválida: ' + errosSenha.join(', '));
            return;
        }

        try {
            // Verificar senha atual
            const senhaAtualHash = await UserManager.hashPassword(senhaAtual);
            if (senhaAtualHash !== currentUser.senha) {
                alert('Senha atual incorreta!');
                return;
            }

            // Atualizar senha
            const novaSenhaHash = await UserManager.hashPassword(novaSenha);
            const usuarioAtualizado = {
                ...currentUser,
                senha: novaSenhaHash,
                dataAtualizacao: new Date().toISOString()
            };

            await pgrStorage.atualizarUsuario(usuarioAtualizado);
            currentUser = usuarioAtualizado;
            
            alert('Senha alterada com sucesso!');
            document.getElementById('form-alterar-senha').reset();
            limparFeedbacks();
            
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            alert('Erro ao alterar senha. Tente novamente.');
        }
    }

    function carregarDadosUsuario() {
        if (!currentUser) return;

        const perfilNome = document.getElementById('perfil-nome');
        const perfilEmail = document.getElementById('perfil-email');

        if (perfilNome) perfilNome.value = currentUser.nome || '';
        if (perfilEmail) perfilEmail.value = currentUser.email || '';
    }

    async function carregarListaUsuarios() {
        try {
            const usuarios = await pgrStorage.listarUsuarios();
            const tbody = document.querySelector('#usuarios-table tbody');
            if (!tbody) return;

            tbody.innerHTML = '';

            // Adicionar admin padrão na lista
            const adminRow = document.createElement('tr');
            adminRow.innerHTML = `
                <td>Administrador</td>
                <td>admin</td>
                <td>admin@sistema.com</td>
                <td><span class="badge admin">Admin</span></td>
                <td><span class="badge active">Ativo</span></td>
                <td><em>Sistema</em></td>
            `;
            tbody.appendChild(adminRow);

            usuarios.forEach(usuario => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${usuario.nome}</td>
                    <td>${usuario.login}</td>
                    <td>${usuario.email}</td>
                    <td><span class="badge ${usuario.tipo}">${usuario.tipo === 'admin' ? 'Admin' : 'Usuário'}</span></td>
                    <td><span class="badge ${usuario.ativo ? 'active' : 'inactive'}">${usuario.ativo ? 'Ativo' : 'Inativo'}</span></td>
                    <td>
                        <div class="user-actions">
                            <button class="btn-toggle ${usuario.ativo ? '' : 'inactive'}" onclick="toggleUsuario(${usuario.id}, ${usuario.ativo})">
                                ${usuario.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                            <button class="btn-small btn-delete" onclick="excluirUsuario(${usuario.id})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro ao carregar lista de usuários:', error);
        }
    }

    // Funções globais para gerenciar usuários
    window.toggleUsuario = async function(id, ativoAtual) {
        try {
            const usuarios = await pgrStorage.listarUsuarios();
            const usuario = usuarios.find(u => u.id === id);
            if (usuario) {
                usuario.ativo = !ativoAtual;
                await pgrStorage.atualizarUsuario(usuario);
                carregarListaUsuarios();
            }
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            alert('Erro ao alterar status do usuário.');
        }
    };

    window.excluirUsuario = async function(id) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await pgrStorage.excluirUsuario(id);
                carregarListaUsuarios();
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário.');
            }
        }
    };
}
