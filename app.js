// Sistema de Gestão de PGR - app.js

/**
 * Módulo de Segurança - Utilitários para hash de senhas e recuperação de conta
 * SECURITY: Implementação de boas práticas de segurança para autenticação
 * Preparado para migração futura para backend
 */
class SecurityUtils {
    constructor() {
        this.saltRounds = 12; // Número de rounds para o hash bcrypt (aumenta segurança)
    }

    /**
     * Gera hash seguro da senha usando bcrypt
     * @param {string} password - Senha em texto plano
     * @returns {string} Hash seguro da senha
     */
    async hashPassword(password) {
        try {
            // SECURITY: Hash da senha no frontend - Em produção, mover para backend
            const salt = await bcrypt.genSalt(this.saltRounds);
            const hash = await bcrypt.hash(password, salt);
            console.log('SECURITY: Senha hasheada com sucesso'); // Log para auditoria
            return hash;
        } catch (error) {
            console.error('SECURITY: Erro ao gerar hash da senha:', error);
            throw new Error('Erro na criptografia da senha');
        }
    }

    /**
     * Verifica se a senha informada corresponde ao hash armazenado
     * @param {string} password - Senha em texto plano
     * @param {string} hash - Hash armazenado
     * @returns {boolean} True se a senha está correta
     */
    async verifyPassword(password, hash) {
        try {
            const isValid = await bcrypt.compare(password, hash);
            console.log('SECURITY: Verificação de senha realizada'); // Log para auditoria
            return isValid;
        } catch (error) {
            console.error('SECURITY: Erro ao verificar senha:', error);
            return false;
        }
    }

    /**
     * Gera pergunta de segurança aleatória para recuperação de conta
     * @returns {string} Pergunta de segurança
     */
    generateSecurityQuestion() {
        const questions = [
            "Qual o nome da sua primeira escola?",
            "Qual o nome do seu primeiro animal de estimação?",
            "Qual o nome de solteira da sua mãe?",
            "Em qual cidade você nasceu?",
            "Qual era o seu apelido na infância?",
            "Qual o nome da rua onde você morou na infância?",
            "Qual sua comida favorita?",
            "Qual seu filme favorito?"
        ];
        return questions[Math.floor(Math.random() * questions.length)];
    }

    /**
     * Valida força da senha
     * @param {string} password - Senha a ser validada
     * @returns {object} Objeto com isValid e critérios não atendidos
     */
    validatePasswordStrength(password) {
        const criteria = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const isValid = Object.values(criteria).every(criterion => criterion);
        
        return {
            isValid,
            criteria,
            missing: Object.keys(criteria).filter(key => !criteria[key])
        };
    }
}

// Instância global do utilitário de segurança
const securityUtils = new SecurityUtils();

// Armazenamento local usando IndexedDB
class PGRStorage {
    constructor() {
        this.dbName = 'pgrDB';
        this.dbVersion = 3; // SECURITY: Incrementado para adicionar campos de recuperação de conta
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
                
                // Store para usuários - SECURITY: Aprimorado com campos de recuperação
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'username' });
                    usersStore.createIndex('username', 'username', { unique: true });
                    // SECURITY: Índice para email para recuperação de conta
                    usersStore.createIndex('email', 'email', { unique: false });
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

    // SECURITY: Métodos para recuperação de conta
    
    /**
     * Busca usuário por email para recuperação de conta
     * @param {string} email - Email do usuário
     * @returns {object|null} Dados do usuário ou null
     */
    async buscarUsuarioPorEmail(email) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('email');
        return new Promise((resolve, reject) => {
            const request = index.get(email);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Atualiza senha do usuário (para recuperação de conta)
     * @param {string} username - Nome do usuário
     * @param {string} newPasswordHash - Nova senha hasheada
     * @returns {Promise} Resultado da operação
     */
    async atualizarSenhaUsuario(username, newPasswordHash) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        return new Promise((resolve, reject) => {
            // Buscar usuário atual
            const getRequest = store.get(username);
            getRequest.onsuccess = () => {
                const usuario = getRequest.result;
                if (usuario) {
                    // SECURITY: Atualizar apenas a senha e timestamp de alteração
                    usuario.passwordHash = newPasswordHash;
                    usuario.passwordUpdatedAt = new Date().toISOString();
                    
                    const putRequest = store.put(usuario);
                    putRequest.onsuccess = () => {
                        console.log('SECURITY: Senha atualizada para usuário:', username);
                        resolve(putRequest.result);
                    };
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error('Usuário não encontrado'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }
}

// Instância global do storage
const pgrStorage = new PGRStorage();

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
        
        // SECURITY: Verificar usuários cadastrados com hash de senha
        try {
            const usuario = await pgrStorage.buscarUsuario(username);
            if (usuario) {
                // SECURITY: Verificar se é usuário com senha hasheada ou senha antiga (compatibilidade)
                let senhaValida = false;
                
                if (usuario.passwordHash) {
                    // SECURITY: Usuário novo com senha hasheada
                    console.log('SECURITY: Verificando senha hasheada para usuário:', username);
                    senhaValida = await securityUtils.verifyPassword(password, usuario.passwordHash);
                } else if (usuario.password) {
                    // SECURITY: Usuário antigo com senha em texto plano (compatibilidade)
                    console.log('SECURITY: Usuário com senha em texto plano detectado - considerando migração');
                    senhaValida = (usuario.password === password);
                    
                    // SECURITY: Migrar automaticamente para senha hasheada
                    if (senhaValida) {
                        try {
                            console.log('SECURITY: Migrando senha para hash...');
                            const passwordHash = await securityUtils.hashPassword(password);
                            await pgrStorage.atualizarSenhaUsuario(username, passwordHash);
                            console.log('SECURITY: Senha migrada com sucesso para hash');
                        } catch (migrationError) {
                            console.error('SECURITY: Erro ao migrar senha:', migrationError);
                            // Não falha o login, apenas registra o erro
                        }
                    }
                }
                
                if (senhaValida) {
                    console.log('SECURITY: Login bem-sucedido para usuário:', username);
                    loginModal.style.display = 'none';
                    mainApp.style.display = '';
                    currentUserSpan.textContent = usuario.fullName || usuario.username;
                    inicializarSistema();
                } else {
                    alert('Usuário ou senha inválidos!');
                }
            } else {
                alert('Usuário ou senha inválidos!');
            }
        } catch (error) {
            console.error('SECURITY: Erro ao fazer login:', error);
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

    // SECURITY: Gerar pergunta de segurança automaticamente
    document.getElementById('generate-security-question').addEventListener('click', function() {
        const question = securityUtils.generateSecurityQuestion();
        document.getElementById('reg-security-question').value = question;
    });

    // SECURITY: Gerar pergunta inicial
    document.addEventListener('DOMContentLoaded', function() {
        const securityQuestionField = document.getElementById('reg-security-question');
        if (securityQuestionField && !securityQuestionField.value) {
            securityQuestionField.value = securityUtils.generateSecurityQuestion();
        }
    });

    // SECURITY: Modal de Recuperação de Senha
    const recoveryModal = document.getElementById('recovery-modal');
    const recoveryForm = document.getElementById('recovery-form');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const cancelRecoveryBtn = document.getElementById('cancel-recovery-btn');
    const recoveryMessage = document.getElementById('recovery-message');
    
    let recoveryCurrentStep = 1;
    let recoveryUserData = null;

    // Mostrar modal de recuperação
    forgotPasswordBtn.addEventListener('click', function () {
        loginModal.style.display = 'none';
        recoveryModal.style.display = '';
        resetRecoveryForm();
    });

    // Cancelar recuperação
    cancelRecoveryBtn.addEventListener('click', function () {
        recoveryModal.style.display = 'none';
        loginModal.style.display = '';
        resetRecoveryForm();
    });

    function resetRecoveryForm() {
        recoveryForm.reset();
        recoveryCurrentStep = 1;
        showRecoveryStep(1);
        hideRecoveryMessage();
        recoveryUserData = null;
    }

    function showRecoveryStep(step) {
        // Esconder todos os steps
        document.getElementById('recovery-step-1').style.display = 'none';
        document.getElementById('recovery-step-2').style.display = 'none';
        document.getElementById('recovery-step-3').style.display = 'none';
        
        // Mostrar step atual
        document.getElementById(`recovery-step-${step}`).style.display = 'block';
        
        // Controlar botões
        const nextBtn = document.getElementById('recovery-next-btn');
        const prevBtn = document.getElementById('recovery-previous-btn');
        const submitBtn = document.getElementById('recovery-submit-btn');
        
        nextBtn.style.display = step < 3 ? 'inline-block' : 'none';
        prevBtn.style.display = step > 1 ? 'inline-block' : 'none';
        submitBtn.style.display = step === 3 ? 'inline-block' : 'none';
    }

    function showRecoveryMessage(text, type) {
        recoveryMessage.textContent = text;
        recoveryMessage.className = `message ${type}`;
        recoveryMessage.style.display = 'block';
    }

    function hideRecoveryMessage() {
        recoveryMessage.style.display = 'none';
    }

    // SECURITY: Navegação do formulário de recuperação
    document.getElementById('recovery-next-btn').addEventListener('click', async function() {
        if (recoveryCurrentStep === 1) {
            await processRecoveryStep1();
        } else if (recoveryCurrentStep === 2) {
            await processRecoveryStep2();
        }
    });

    document.getElementById('recovery-previous-btn').addEventListener('click', function() {
        recoveryCurrentStep--;
        showRecoveryStep(recoveryCurrentStep);
        hideRecoveryMessage();
    });

    // SECURITY: Alternar método de recuperação
    document.querySelectorAll('input[name="recovery-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const emailRecovery = document.getElementById('email-recovery');
            const securityRecovery = document.getElementById('security-recovery');
            
            if (this.value === 'email') {
                emailRecovery.style.display = 'block';
                securityRecovery.style.display = 'none';
            } else {
                emailRecovery.style.display = 'none';
                securityRecovery.style.display = 'block';
            }
        });
    });

    // SECURITY: Processar Step 1 - Identificação
    async function processRecoveryStep1() {
        const username = document.getElementById('recovery-username').value.trim();
        const recoveryMethod = document.querySelector('input[name="recovery-method"]:checked').value;

        if (!username) {
            showRecoveryMessage('Digite seu nome de usuário.', 'error');
            return;
        }

        try {
            showRecoveryMessage('Verificando usuário...', 'info');
            const usuario = await pgrStorage.buscarUsuario(username);
            
            if (!usuario) {
                showRecoveryMessage('Usuário não encontrado.', 'error');
                return;
            }

            recoveryUserData = usuario;

            if (recoveryMethod === 'email') {
                if (!usuario.email) {
                    showRecoveryMessage('Este usuário não tem email cadastrado para recuperação. Use pergunta de segurança.', 'error');
                    document.getElementById('recovery-security').checked = true;
                    document.getElementById('email-recovery').style.display = 'none';
                    document.getElementById('security-recovery').style.display = 'block';
                    return;
                }
                // Mascarar email
                const email = usuario.email;
                const [localPart, domain] = email.split('@');
                const maskedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
                const maskedEmail = maskedLocal + '@' + domain;
                document.getElementById('masked-email').textContent = maskedEmail;
            } else {
                if (!usuario.securityQuestion || !usuario.securityAnswerHash) {
                    showRecoveryMessage('Este usuário não tem pergunta de segurança cadastrada. Entre em contato com o administrador.', 'error');
                    return;
                }
                document.getElementById('security-question-display').textContent = usuario.securityQuestion;
            }

            recoveryCurrentStep = 2;
            showRecoveryStep(2);
            hideRecoveryMessage();

        } catch (error) {
            console.error('SECURITY: Erro no Step 1 de recuperação:', error);
            showRecoveryMessage('Erro ao verificar usuário. Tente novamente.', 'error');
        }
    }

    // SECURITY: Processar Step 2 - Verificação
    async function processRecoveryStep2() {
        const recoveryMethod = document.querySelector('input[name="recovery-method"]:checked').value;

        try {
            if (recoveryMethod === 'email') {
                const emailConfirm = document.getElementById('recovery-email-confirm').value.trim();
                if (!emailConfirm || emailConfirm !== recoveryUserData.email) {
                    showRecoveryMessage('Email não confere com o cadastrado.', 'error');
                    return;
                }
            } else {
                const securityAnswer = document.getElementById('recovery-security-answer').value.trim();
                if (!securityAnswer) {
                    showRecoveryMessage('Digite a resposta da pergunta de segurança.', 'error');
                    return;
                }

                console.log('SECURITY: Verificando resposta de segurança...');
                const isAnswerValid = await securityUtils.verifyPassword(securityAnswer.toLowerCase(), recoveryUserData.securityAnswerHash);
                if (!isAnswerValid) {
                    showRecoveryMessage('Resposta da pergunta de segurança incorreta.', 'error');
                    return;
                }
            }

            recoveryCurrentStep = 3;
            showRecoveryStep(3);
            hideRecoveryMessage();

        } catch (error) {
            console.error('SECURITY: Erro no Step 2 de recuperação:', error);
            showRecoveryMessage('Erro na verificação. Tente novamente.', 'error');
        }
    }

    // SECURITY: Processar formulário de recuperação (Step 3)
    recoveryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('recovery-new-password').value;
        const newPasswordConfirm = document.getElementById('recovery-new-password-confirm').value;

        // SECURITY: Validar nova senha
        const passwordStrength = securityUtils.validatePasswordStrength(newPassword);
        if (!passwordStrength.isValid) {
            let missingCriteria = passwordStrength.missing.map(criterion => {
                switch(criterion) {
                    case 'minLength': return 'pelo menos 8 caracteres';
                    case 'hasUpperCase': return 'uma letra maiúscula';
                    case 'hasLowerCase': return 'uma letra minúscula';
                    case 'hasNumbers': return 'um número';
                    case 'hasSpecialChar': return 'um caractere especial (!@#$%^&*)';
                    default: return criterion;
                }
            }).join(', ');
            showRecoveryMessage(`Nova senha deve ter: ${missingCriteria}`, 'error');
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            showRecoveryMessage('As novas senhas não coincidem.', 'error');
            return;
        }

        try {
            showRecoveryMessage('Atualizando senha...', 'info');
            
            // SECURITY: Hash da nova senha
            const newPasswordHash = await securityUtils.hashPassword(newPassword);
            
            // SECURITY: Atualizar senha no banco
            await pgrStorage.atualizarSenhaUsuario(recoveryUserData.username, newPasswordHash);
            
            console.log('SECURITY: Senha redefinida com sucesso para usuário:', recoveryUserData.username);
            showRecoveryMessage('Senha redefinida com sucesso! Você será redirecionado para o login.', 'success');
            
            // Voltar para login após 3 segundos
            setTimeout(() => {
                recoveryModal.style.display = 'none';
                loginModal.style.display = '';
                resetRecoveryForm();
                // Pré-preencher o usuário
                document.getElementById('username').value = recoveryUserData.username;
            }, 3000);

        } catch (error) {
            console.error('SECURITY: Erro ao redefinir senha:', error);
            showRecoveryMessage('Erro ao redefinir senha. Tente novamente.', 'error');
        }
    });

    // Processamento do formulário de registro - SECURITY: Atualizado com hash de senha
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const fullName = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;
        const securityQuestion = document.getElementById('reg-security-question').value;
        const securityAnswer = document.getElementById('reg-security-answer').value.trim();

        // SECURITY: Validações aprimoradas de senha
        if (username.length < 3) {
            showMessage('O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
            return;
        }

        // SECURITY: Validação de força da senha
        const passwordStrength = securityUtils.validatePasswordStrength(password);
        if (!passwordStrength.isValid) {
            let missingCriteria = passwordStrength.missing.map(criterion => {
                switch(criterion) {
                    case 'minLength': return 'pelo menos 8 caracteres';
                    case 'hasUpperCase': return 'uma letra maiúscula';
                    case 'hasLowerCase': return 'uma letra minúscula';
                    case 'hasNumbers': return 'um número';
                    case 'hasSpecialChar': return 'um caractere especial (!@#$%^&*)';
                    default: return criterion;
                }
            }).join(', ');
            showMessage(`Senha deve ter: ${missingCriteria}`, 'error');
            return;
        }

        if (password !== passwordConfirm) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        // SECURITY: Validar pergunta e resposta de segurança se fornecidas
        if (securityQuestion && !securityAnswer) {
            showMessage('Se você definir uma pergunta de segurança, deve fornecer uma resposta.', 'error');
            return;
        }

        // Verificar se usuário admin está sendo usado
        if (username.toLowerCase() === 'admin') {
            showMessage('O nome de usuário "admin" é reservado. Escolha outro nome.', 'error');
            return;
        }

        try {
            showMessage('Criando conta... Por favor, aguarde.', 'info');
            
            // Verificar se usuário já existe
            const usuarioExiste = await pgrStorage.verificarUsuarioExiste(username);
            if (usuarioExiste) {
                showMessage('Este nome de usuário já está em uso. Escolha outro.', 'error');
                return;
            }

            // SECURITY: Gerar hash da senha
            console.log('SECURITY: Iniciando hash da senha...');
            const passwordHash = await securityUtils.hashPassword(password);
            console.log('SECURITY: Hash da senha gerado com sucesso');

            // SECURITY: Hash da resposta de segurança se fornecida
            let securityAnswerHash = null;
            if (securityAnswer) {
                securityAnswerHash = await securityUtils.hashPassword(securityAnswer.toLowerCase());
                console.log('SECURITY: Hash da resposta de segurança gerado');
            }

            // SECURITY: Salvar novo usuário com dados de recuperação
            const novoUsuario = {
                username: username,
                fullName: fullName,
                email: email || null, // SECURITY: Email para recuperação
                passwordHash: passwordHash, // SECURITY: Senha hasheada
                securityQuestion: securityQuestion || null, // SECURITY: Pergunta de segurança
                securityAnswerHash: securityAnswerHash, // SECURITY: Resposta hasheada
                createdAt: new Date().toISOString(),
                passwordUpdatedAt: new Date().toISOString() // SECURITY: Timestamp da última alteração de senha
            };

            await pgrStorage.salvarUsuario(novoUsuario);
            console.log('SECURITY: Usuário criado com dados de recuperação');
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
            } else if (id === 'gestao-unidades') {
                carregarUnidadesArmazenadas();
            }
        });
    });

    // Inicializar sistema após login
    function inicializarSistema() {
        configurarGestaoDocumentos();
        configurarGestaoUnidades();
        configurarExportacao();
        carregarDocumentosArmazenados();
        carregarUnidadesArmazenadas();
        atualizarRelatorios();
        configurarMascarasInput();
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
                
                mostrarMensagemUnidade('Unidade cadastrada com sucesso!', 'success');
                formUnidades.reset();
                carregarUnidadesArmazenadas();
                
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
                return;
            }
            
            unidadesAtivas.forEach(unidade => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${unidade.nome}</td>
                    <td>${unidade.cnpj}</td>
                    <td>${unidade.responsavel}</td>
                    <td>
                        <div class="unit-actions">
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
            
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
            mostrarMensagemUnidade('Erro ao carregar unidades.', 'error');
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
