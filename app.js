// Sistema de Gestão de PGR - app.js

// Armazenamento local usando IndexedDB
class PGRStorage {
    constructor() {
        this.dbName = 'pgrDB';
        this.dbVersion = 1;
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

    // Simples login
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username === 'admin' && password === 'admin123') {
            loginModal.style.display = 'none';
            mainApp.style.display = '';
            currentUserSpan.textContent = 'Admin';
            inicializarSistema();
        } else {
            alert('Usuário ou senha inválidos!');
        }
    });

    logoutBtn.addEventListener('click', function () {
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
