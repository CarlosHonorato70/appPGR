# Guia de Integração - Black Belt Sistema Integrado

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instalação Rápida](#instalação-rápida)
4. [Configuração Detalhada](#configuração-detalhada)
5. [APIs Disponíveis](#apis-disponíveis)
6. [Fluxos de Trabalho](#fluxos-de-trabalho)
7. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Este sistema integra duas funcionalidades principais:

1. **Sistema PGR Original** (HTML/JS) - Gestão de Programa de Gerenciamento de Riscos
2. **Plataforma Black Belt** (Backend + Frontend) - Precificação, Propostas e Avaliação de Riscos

Ambos os sistemas coexistem e podem ser usados de forma independente ou integrada.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
├──────────────────────┬──────────────────────────────────┤
│  Sistema PGR Original │   Streamlit App                  │
│  (HTML/CSS/JS)       │   (Python)                       │
│  - Login             │   - Dashboard                     │
│  - Gestão Unidades   │   - Precificação                 │
│  - Checklist         │   - Propostas                    │
│  - Inventário        │   - Avaliação de Riscos          │
│  - Documentos        │   - Relatórios                   │
└──────────────────────┴──────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                           │
├─────────────────────────────────────────────────────────┤
│  Express.js + tRPC                                       │
│  - Pricing API                                           │
│  - Proposals API                                         │
│  - Risk Assessments API                                  │
│  - Authentication (futuro)                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                        │
├─────────────────────────────────────────────────────────┤
│  MySQL 8.0+                                              │
│  - Users & Tenants                                       │
│  - Clients                                               │
│  - Services                                              │
│  - Pricing Parameters                                    │
│  - Proposals & Items                                     │
│  - Risk Assessments                                      │
│  - Audit Logs                                            │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 18+ e npm
- Python 3.10+ e pip
- MySQL 8.0+

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/CarlosHonorato70/appPGR.git
cd appPGR
```

### Passo 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env.local
# Edite .env.local com suas credenciais MySQL
npm run dev
```

### Passo 3: Streamlit Setup

```bash
cd ../streamlit
pip install -r requirements.txt
streamlit run app.py
```

### Passo 4: Sistema PGR Original

Abra `index.html` diretamente no navegador ou use um servidor HTTP:

```bash
# Na raiz do projeto
npx http-server -p 8080
# Acesse http://localhost:8080
```

## ⚙️ Configuração Detalhada

### Backend (.env.local)

```env
# Database - Configure com suas credenciais MySQL
DATABASE_URL=mysql://usuario:senha@localhost:3306/blackbelt

# Server
PORT=3000
NODE_ENV=development

# CORS - Adicione origins permitidos
CORS_ORIGIN=http://localhost:8080,http://localhost:8501

# Logging
LOG_LEVEL=debug
```

### Criando o Banco de Dados

```sql
CREATE DATABASE blackbelt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blackbelt_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON blackbelt.* TO 'blackbelt_user'@'localhost';
FLUSH PRIVILEGES;
```

### Migrações (Futuro)

```bash
cd backend
npm run db:push  # Sincroniza schema com o banco
```

## 📡 APIs Disponíveis

### Pricing API

#### Calcular Hora Técnica

```typescript
// Endpoint: trpc.pricing.calculateTechnicalHour
const result = await trpc.pricing.calculateTechnicalHour.query({
  fixedCosts: 5000,      // Custos fixos mensais em R$
  proLabor: 2000,        // Pró-labore mensal em R$
  productiveHours: 160   // Horas produtivas no mês
});
// Retorna: { technicalHour: 43.75 }
```

#### Calcular Item de Proposta

```typescript
// Endpoint: trpc.pricing.calculateProposalItem
const result = await trpc.pricing.calculateProposalItem.query({
  basePrice: 5000,
  estimatedHours: 40,
  taxRate: 6.0,  // Simples Nacional
  adjustmentPersonalization: 10,  // +10%
  adjustmentRisk: 5,              // +5%
  adjustmentSeniority: 0,         // 0%
  volumeDiscount: 5               // -5%
});
```

### Proposals API

#### Listar Propostas

```typescript
// Endpoint: trpc.proposals.listProposals
const proposals = await trpc.proposals.listProposals.query({
  tenantId: "tenant-123"
});
```

#### Criar Proposta

```typescript
// Endpoint: trpc.proposals.createProposal
const proposal = await trpc.proposals.createProposal.mutate({
  clientId: "client-123",
  title: "Proposta de Consultoria",
  description: "Consultoria em SST",
  tenantId: "tenant-123",
  items: [
    {
      serviceId: "service-1",
      quantity: 1,
      unitPrice: 5000,
      adjustmentPersonalization: 10,
      adjustmentRisk: 5,
      adjustmentSeniority: 0,
      volumeDiscount: 0
    }
  ],
  discountGeneral: 500,
  displacementFee: 200
});
```

### Risk Assessments API

#### Criar Avaliação de Risco

```typescript
// Endpoint: trpc.riskAssessments.createAssessment
const assessment = await trpc.riskAssessments.createAssessment.mutate({
  clientId: "client-123",
  sector: "TI",
  riskLevel: "médio",
  psychosocialFactors: "Carga de trabalho elevada, pressão por prazos",
  recommendations: "Implementar pausas regulares, redistribuir tarefas",
  tenantId: "tenant-123"
});
```

## 🔄 Fluxos de Trabalho

### Fluxo 1: Criar Proposta Comercial

1. **Configurar Parâmetros de Precificação**
   - Acesse Streamlit → Precificação → Parâmetros Base
   - Configure custos fixos, pró-labore e horas produtivas
   - Defina taxas por regime tributário

2. **Calcular Itens da Proposta**
   - Acesse Precificação → Calcular Item
   - Insira horas estimadas e ajustes
   - Sistema calcula automaticamente

3. **Criar Proposta**
   - Acesse Propostas → Criar Nova
   - Adicione cliente e itens
   - Aplique descontos finais
   - Salve a proposta

### Fluxo 2: Avaliação de Riscos NR-01

1. **Criar Avaliação**
   - Acesse Avaliação de Riscos → Criar Nova
   - Selecione cliente e setor
   - Avalie fatores psicossociais (escala 0-10)
   - Defina nível de risco

2. **Documentar Recomendações**
   - Descreva medidas de controle
   - Sugira ações preventivas
   - Salve a avaliação

3. **Gerar Relatório**
   - Acesse Relatórios
   - Selecione "Avaliação de Riscos"
   - Exporte em PDF/Excel

### Fluxo 3: Usar Sistema PGR Original

1. **Login**
   - Usuário: admin
   - Senha: admin123

2. **Gestão de Unidades**
   - Cadastre unidades de trabalho
   - Selecione unidade ativa

3. **Checklist PGR**
   - Preencha itens do programa
   - Marque status e responsáveis

4. **Inventário de Riscos**
   - Cadastre riscos por categoria
   - Físicos, Químicos, Biológicos, etc.

## 🔧 Troubleshooting

### Backend não inicia

```bash
# Verifique se a porta 3000 está disponível
lsof -i :3000

# Verifique logs
cd backend
npm run dev
```

### Streamlit não conecta ao backend

```bash
# Verifique se o backend está rodando
curl http://localhost:3000/health

# Verifique variável de ambiente
export API_URL=http://localhost:3000/trpc
streamlit run app.py
```

### Erro de conexão MySQL

```bash
# Teste conexão
mysql -u blackbelt_user -p -h localhost blackbelt

# Verifique se o MySQL está rodando
sudo systemctl status mysql
```

### Sistema PGR não carrega

```bash
# Use um servidor HTTP adequado
npx http-server -p 8080

# Verifique console do navegador para erros JS
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/CarlosHonorato70/appPGR/issues)
- **Email**: support@blackbelt.com.br
- **Documentação**: README_INTEGRATED.md

## 🎓 Próximos Passos

1. Configure o banco de dados MySQL
2. Inicie backend e frontend
3. Teste as APIs com Postman ou similar
4. Explore a interface Streamlit
5. Integre com sistema PGR conforme necessário

---

**Última atualização**: 2025-11-13
