// Sistema de Gestão de PGR - app.js

// Armazenamento local usando IndexedDB
class PGRStorage {
    constructor() {
        this.dbName = 'pgrDB';
        this.dbVersion = 3;
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
                    documentosStore.createIndex('unidadeId', 'unidadeId', { unique: false });
                }
                
                // Store para dados do sistema
                if (!db.objectStoreNames.contains('dados')) {
                    const dadosStore = db.createObjectStore('dados', { keyPath: 'tipo' });
                }
                
                // Store para usuários
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'username' });
                    usersStore.createIndex('username', 'username', { unique: true });
                }
                
                // Store para unidades de trabalho
                if (!db.objectStoreNames.contains('unidades')) {
                    const unidadesStore = db.createObjectStore('unidades', { keyPath: 'id', autoIncrement: true });
                    unidadesStore.createIndex('nome', 'nome', { unique: false });
                    unidadesStore.createIndex('cnpj', 'cnpj', { unique: false });
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
    
    // Métodos para gerenciamento de unidades
    async salvarUnidade(unidade) {
        const transaction = this.db.transaction(['unidades'], 'readwrite');
        const store = transaction.objectStore('unidades');
        return new Promise((resolve, reject) => {
            const request = store.add(unidade);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async listarUnidades() {
        const transaction = this.db.transaction(['unidades'], 'readonly');
        const store = transaction.objectStore('unidades');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async buscarUnidade(id) {
        const transaction = this.db.transaction(['unidades'], 'readonly');
        const store = transaction.objectStore('unidades');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async excluirUnidade(id) {
        const transaction = this.db.transaction(['unidades'], 'readwrite');
        const store = transaction.objectStore('unidades');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Instância global do storage
const pgrStorage = new PGRStorage();
window.pgrStorage = pgrStorage; // Make it available globally

// Variável global para armazenar a unidade atualmente selecionada
let unidadeAtual = null;

document.addEventListener('DOMContentLoaded', function () {
    // Login Modal
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const mainApp = document.getElementById('main-app');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserSpan = document.getElementById('current-user');

    // Only setup login functionality if elements exist
    if (loginForm && loginModal && mainApp) {
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

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            mainApp.style.display = 'none';
            loginModal.style.display = '';
            loginForm.reset();
        });
    }

    // Modais de Registro
    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const cancelRegisterBtn = document.getElementById('cancel-register-btn');
    const registerMessage = document.getElementById('register-message');

    // Only setup registration functionality if elements exist
    if (registerModal && registerForm && showRegisterBtn && cancelRegisterBtn) {

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

    } // End of registration modal check
    } // End of main login/modal functionality check

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
                popularDropdownsUnidades();
            } else if (id === 'gestao-unidades') {
                configurarGestaoUnidades();
                carregarUnidadesCadastradas();
            } else if (id === 'plano-acao' || id === 'inventario-riscos') {
                popularDropdownsUnidades();
            }
        });
    });

    // Inicializar sistema após login
    function inicializarSistema() {
        configurarGestaoDocumentos();
        configurarExportacao();
        carregarDocumentosArmazenados();
        atualizarRelatorios();
        configurarMascarasInput();
        configurarGestaoUnidades();
        popularDropdownsUnidades();
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
            
            const unidadeId = document.getElementById('unidadeDocumento').value;
            const tipo = document.getElementById('tipoDocumento').value;
            const nome = document.getElementById('nomeDocumento').value;
            const dataEmissao = document.getElementById('dataEmissaoDoc').value;
            const arquivoInput = document.getElementById('arquivoDocumento');
            
            // Validar se uma unidade foi selecionada
            if (!unidadeId) {
                mostrarMensagem('Por favor, selecione uma unidade.', 'error');
                return;
            }
            
            if (!arquivoInput.files[0]) {
                mostrarMensagem('Por favor, selecione um arquivo.', 'error');
                return;
            }
            
            const arquivo = arquivoInput.files[0];
            
            // Validar tamanho (máximo 10MB)
            if (arquivo.size > 10 * 1024 * 1024) {
                mostrarMensagem('O arquivo é muito grande. Máximo permitido: 10MB', 'error');
                return;
            }
            
            // Converter arquivo para base64
            const reader = new FileReader();
            reader.onload = async function(e) {
                const documento = {
                    unidadeId: parseInt(unidadeId),
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
                    mostrarMensagem('Documento salvo com sucesso!', 'success');
                    formDocumentos.reset();
                    carregarDocumentosArmazenados();
                    // Re-popular o dropdown após reset
                    popularDropdownsUnidades();
                } catch (error) {
                    console.error('Erro ao salvar documento:', error);
                    mostrarMensagem('Erro ao salvar documento. Tente novamente.', 'error');
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
        const exportPdfBtn = document.getElementById('export-pdf');
        const exportExcelBtn = document.getElementById('export-excel');
        const printReportBtn = document.getElementById('print-report');
        
        if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportarPDF);
        if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportarExcel);
        if (printReportBtn) printReportBtn.addEventListener('click', imprimirRelatorio);
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

    // ===== GESTÃO DE UNIDADES =====
    
    // Configurar gestão de unidades
    function configurarGestaoUnidades() {
        const formUnidade = document.getElementById('form-unidade');
        
        if (!formUnidade) {
            console.warn('Form unidade não encontrado. Aguardando carregamento...');
            return; // Return early if form doesn't exist
        }
        
        formUnidade.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nomeUnidade = document.getElementById('nomeUnidade').value.trim();
            const cnpjUnidade = document.getElementById('cnpjUnidade').value.trim();
            const enderecoUnidade = document.getElementById('enderecoUnidade').value.trim();
            const responsavelLegalUnidade = document.getElementById('responsavelLegalUnidade').value.trim();
            const contatoUnidade = document.getElementById('contatoUnidade').value.trim();
            
            // Validações básicas
            if (!nomeUnidade || !cnpjUnidade || !enderecoUnidade || !responsavelLegalUnidade) {
                mostrarMensagem('Todos os campos obrigatórios devem ser preenchidos.', 'error');
                return;
            }
            
            try {
                const unidade = {
                    nome: nomeUnidade,
                    cnpj: cnpjUnidade,
                    endereco: enderecoUnidade,
                    responsavelLegal: responsavelLegalUnidade,
                    contato: contatoUnidade,
                    dataCreacao: new Date().toISOString()
                };
                
                await pgrStorage.salvarUnidade(unidade);
                
                // Limpar formulário
                formUnidade.reset();
                
                // Mostrar mensagem de sucesso
                mostrarMensagem('Unidade cadastrada com sucesso!', 'success');
                
                // Atualizar lista de unidades
                carregarUnidadesCadastradas();
                
            } catch (error) {
                console.error('Erro ao cadastrar unidade:', error);
                mostrarMensagem('Erro ao cadastrar unidade. Tente novamente.', 'error');
            }
        });
        
        // Carregar unidades na inicialização
        carregarUnidadesCadastradas();
    }
    
    // Carregar e exibir unidades cadastradas
    async function carregarUnidadesCadastradas() {
        try {
            const unidades = await pgrStorage.listarUnidades();
            const tbody = document.querySelector('#unidades-cadastradas-table tbody');
            
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (unidades && unidades.length > 0) {
                unidades.forEach(unidade => {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>${unidade.nome}</td>
                        <td>${unidade.cnpj}</td>
                        <td>${unidade.responsavelLegal}</td>
                        <td>
                            <button class="btn btn-small" onclick="selecionarUnidade(${unidade.id})">Selecionar</button>
                            <button class="btn btn-small btn-danger" onclick="excluirUnidade(${unidade.id})">Excluir</button>
                        </td>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">Nenhuma unidade cadastrada ainda.</td></tr>';
            }
            
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
            mostrarMensagem('Erro ao carregar unidades.', 'error');
        }
    }
    
    // Selecionar unidade atual
    async function selecionarUnidade(id) {
        try {
            const unidade = await pgrStorage.buscarUnidade(id);
            if (unidade) {
                unidadeAtual = unidade;
                mostrarMensagem(`Unidade "${unidade.nome}" selecionada com sucesso!`, 'success');
                atualizarIndicadorUnidadeAtual();
            }
        } catch (error) {
            console.error('Erro ao selecionar unidade:', error);
            mostrarMensagem('Erro ao selecionar unidade.', 'error');
        }
    }
    
    // Excluir unidade
    async function excluirUnidade(id) {
        if (!confirm('Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            await pgrStorage.excluirUnidade(id);
            mostrarMensagem('Unidade excluída com sucesso!', 'success');
            carregarUnidadesCadastradas();
            
            // Se a unidade excluída era a atual, limpar seleção
            if (unidadeAtual && unidadeAtual.id === id) {
                unidadeAtual = null;
                atualizarIndicadorUnidadeAtual();
            }
        } catch (error) {
            console.error('Erro ao excluir unidade:', error);
            mostrarMensagem('Erro ao excluir unidade.', 'error');
        }
    }
    
    // Atualizar indicador da unidade atual
    function atualizarIndicadorUnidadeAtual() {
        // Adicionar indicador visual da unidade atual no cabeçalho
        const userInfo = document.querySelector('.user-info');
        if (!userInfo) return; // Return early if user info element doesn't exist
        
        let indicadorUnidade = document.getElementById('indicador-unidade-atual');
        
        if (!indicadorUnidade) {
            indicadorUnidade = document.createElement('span');
            indicadorUnidade.id = 'indicador-unidade-atual';
            indicadorUnidade.style.marginRight = '15px';
            indicadorUnidade.style.color = '#007bff';
            indicadorUnidade.style.fontWeight = 'bold';
            userInfo.insertBefore(indicadorUnidade, userInfo.firstChild);
        }
        
        if (unidadeAtual) {
            indicadorUnidade.textContent = `Unidade: ${unidadeAtual.nome}`;
        } else {
            indicadorUnidade.textContent = 'Nenhuma unidade selecionada';
            indicadorUnidade.style.color = '#dc3545';
        }
    }
    
    // Função para mostrar mensagens
    function mostrarMensagem(texto, tipo = 'info') {
        // Criar elemento de mensagem se não existir
        let mensagemContainer = document.getElementById('mensagem-container');
        if (!mensagemContainer) {
            mensagemContainer = document.createElement('div');
            mensagemContainer.id = 'mensagem-container';
            mensagemContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(mensagemContainer);
        }
        
        // Criar mensagem
        const mensagem = document.createElement('div');
        mensagem.style.cssText = `
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Definir cor baseada no tipo
        switch (tipo) {
            case 'success':
                mensagem.style.backgroundColor = '#28a745';
                break;
            case 'error':
                mensagem.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                mensagem.style.backgroundColor = '#ffc107';
                mensagem.style.color = '#212529';
                break;
            default:
                mensagem.style.backgroundColor = '#007bff';
        }
        
        mensagem.textContent = texto;
        mensagemContainer.appendChild(mensagem);
        
        // Remover mensagem após 4 segundos
        setTimeout(() => {
            mensagem.style.opacity = '0';
            mensagem.style.transform = 'translateX(100%)';
            setTimeout(() => mensagem.remove(), 300);
        }, 4000);
    }
    
    // Tornar funções globais para uso nos botões
    window.selecionarUnidade = selecionarUnidade;
    window.excluirUnidade = excluirUnidade;

    // ===== INTEGRAÇÃO DE UNIDADES COM MATERIAIS =====
    
    // Popular dropdowns de unidades em todos os formulários
    async function popularDropdownsUnidades() {
        try {
            const unidades = await pgrStorage.listarUnidades();
            const dropdowns = [
                'unidadeDocumento',
                'unidadeAcao', 
                'unidadeRiscoFisico'
                // Adicionar mais IDs conforme necessário
            ];
            
            dropdowns.forEach(dropdownId => {
                const dropdown = document.getElementById(dropdownId);
                if (dropdown) {
                    // Limpar opções existentes exceto a primeira
                    while (dropdown.options.length > 1) {
                        dropdown.remove(1);
                    }
                    
                    // Adicionar unidades
                    unidades.forEach(unidade => {
                        const option = document.createElement('option');
                        option.value = unidade.id;
                        option.textContent = unidade.nome;
                        dropdown.appendChild(option);
                    });
                    
                    // Se há uma unidade selecionada, pré-selecionar nos dropdowns
                    if (unidadeAtual) {
                        dropdown.value = unidadeAtual.id;
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao popular dropdowns de unidades:', error);
        }
    }
    
    // Atualizar documento para incluir unidade
    async function salvarDocumentoComUnidade(documento) {
        // Adicionar unidadeId ao documento se não existir
        if (!documento.unidadeId && unidadeAtual) {
            documento.unidadeId = unidadeAtual.id;
        }
        
        return await pgrStorage.salvarDocumento(documento);
    }

    // Exemplo: Adicionar item ao checklist
    const addChecklistButton = document.getElementById('add-checklist-item');
    if (addChecklistButton) {
        addChecklistButton.addEventListener('click', function () {
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
    }
});
