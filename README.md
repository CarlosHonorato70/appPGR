# Sistema de Gestão de PGR

Sistema web para gestão e monitoramento do Programa de Gerenciamento de Riscos (PGR) em conformidade com a NR-01.

## Funcionalidades

O sistema oferece as seguintes funcionalidades principais:

### 🏢 Gestão de Unidades
- Cadastro e gerenciamento de unidades de trabalho
- Dados de identificação, CNPJ/CPF, responsável legal

### ✅ Checklist Interativo do PGR
- Monitoramento de itens do Programa de Gerenciamento de Riscos
- Status de verificação, evidências, responsáveis e prazos
- Classificação por nível de risco (Baixo, Médio, Alto)

### ⚠️ Inventário de Riscos
- Cadastro detalhado de riscos por categoria:
  - Riscos Físicos
  - Riscos Químicos
  - Riscos Biológicos
  - Riscos Ergonômicos
  - Riscos de Acidentes
  - Riscos Psicossociais

### 📋 Plano de Ação
- Acompanhamento de ações corretivas e preventivas
- Status de execução e controle de prazos
- Associação com níveis de risco

### 📄 Gestão de Documentos
- Upload e armazenamento de documentos importantes
- Suporte para LTCAT, PCMSO, PPR, ASO, Fichas de EPI

### 📊 Relatórios e Dashboards
- Visualização consolidada do status do PGR
- **Exportação de relatórios em PDF**
- Métricas de conformidade e indicadores

## 🔍 Como Usar a Exportação PDF

### Passo 1: Navegar para Relatórios
1. Acesse o sistema através do navegador web
2. No menu lateral, clique em **"Relatórios e Dashboards"**

### Passo 2: Visualizar o Relatório
O sistema exibirá automaticamente:
- **Resumo Executivo**: Status geral, riscos críticos, conformidade NR-01
- **Status do Checklist PGR**: Itens verificados, pendentes e responsáveis
- **Inventário de Riscos**: Resumo por categoria de risco
- **Status do Plano de Ação**: Ações em andamento e prazos

### Passo 3: Exportar como PDF
1. Clique no botão **"📄 Salvar como PDF"**
2. Uma nova janela será aberta com o relatório formatado
3. Na nova janela, use **Ctrl+P** (Windows/Linux) ou **Cmd+P** (Mac)
4. Selecione **"Salvar como PDF"** como destino
5. Escolha o local para salvar e clique em **"Salvar"**

### Características do PDF Exportado

#### 🎨 Layout Profissional
- Cabeçalho com nome do sistema e data de geração
- Formatação limpa e organizada para impressão
- Seções bem definidas e numeradas

#### 📋 Conteúdo Completo
- **Resumo Executivo**: Métricas principais e indicadores
- **Status do Checklist**: Até 20 itens principais com detalhes
- **Inventário de Riscos**: Contagem por categoria
- **Plano de Ação**: Até 15 ações principais com status

#### 🔒 Segurança e Privacidade
- Marcação de documento confidencial
- Data e horário de geração
- Formatação adequada para arquivamento

## 🌐 Compatibilidade de Navegadores

A funcionalidade de exportação PDF é compatível com:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 💾 Armazenamento de Dados

- Os dados são armazenados localmente no navegador (localStorage)
- Não há necessidade de servidor ou banco de dados
- Os dados persistem entre sessões do navegador

## 🚀 Como Executar

### Desenvolvimento Local
1. Clone ou baixe os arquivos do projeto
2. Abra um servidor web local:
   ```bash
   python3 -m http.server 8000
   ```
3. Acesse `http://localhost:8000` no navegador

### Hospedagem Web
- Faça upload dos arquivos para qualquer servidor web
- O sistema funciona como aplicação estática (HTML, CSS, JS)

## 📁 Estrutura de Arquivos

```
appPGR/
├── index.html      # Página principal da aplicação
├── style.css       # Estilos e formatação
├── app.js          # Lógica da aplicação e PDF export
└── README.md       # Documentação (este arquivo)
```

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilos e responsividade
- **JavaScript (ES6+)**: Lógica da aplicação
- **LocalStorage API**: Armazenamento local
- **Print API**: Funcionalidade de impressão/PDF

## 📞 Suporte e Contribuições

Para dúvidas, sugestões ou reportar problemas:
1. Verifique se está usando um navegador compatível
2. Certifique-se de que o JavaScript está habilitado
3. Para problemas com PDF, verifique as configurações de impressão do navegador

## 📋 Requisitos de Conformidade

Este sistema foi desenvolvido considerando:
- ✅ NR-01 - Programa de Gerenciamento de Riscos
- ✅ Segurança da informação
- ✅ Proteção de dados sensíveis
- ✅ Auditoria e rastreabilidade

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025  
**Status**: Funcionalidade PDF implementada e testada