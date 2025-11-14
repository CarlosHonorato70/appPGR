# Black Belt - Plataforma Integrada de Gestão

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Python](https://img.shields.io/badge/python-%3E%3D3.10-blue)

## 📖 Visão Geral

Black Belt é uma plataforma integrada que combina funcionalidades de gestão de riscos ocupacionais (PGR/NR-01) com sistema de precificação inteligente e geração de propostas comerciais.

### 🎯 Funcionalidades Principais

#### 1. **Gestão de Riscos Psicossociais (NR-01)**
- Avaliações compliant com a norma regulamentadora brasileira
- Análise de fatores psicossociais
- Recomendações personalizadas
- Relatórios detalhados de conformidade

#### 2. **Precificação Inteligente**
- Cálculo automático de hora técnica
- Suporte a múltiplos regimes tributários:
  - MEI
  - Simples Nacional
  - Lucro Presumido
  - Autônomo
- Ajustes configuráveis (personalização, risco, senioridade)
- Descontos por volume

#### 3. **Gerador de Propostas**
- Criação e gerenciamento de propostas comerciais
- Composição de itens customizáveis
- Cálculo automático de valores
- Exportação em PDF (planejado)
- Histórico de versões

#### 4. **Dashboard Analítico**
- Visualização de métricas em tempo real
- Gráficos interativos
- KPIs de negócio
- Relatórios customizados

#### 5. **Sistema de Auditoria**
- Log completo de operações
- Rastreamento de mudanças
- Conformidade LGPD

## 🚀 Tecnologias

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API**: tRPC (Type-safe APIs)
- **Linguagem**: TypeScript
- **ORM**: Drizzle ORM
- **Banco de Dados**: MySQL 8.0+
- **Validação**: Zod
- **Cálculos**: Decimal.js (precisão financeira)

### Frontend
- **Framework**: Streamlit (Python)
- **Visualização**: Pandas, Plotly
- **React** (opcional, para expansão futura)

### Infraestrutura
- **Container**: Docker
- **Deploy**: Manus Platform (planejado)
- **Autenticação**: OAuth 2.0 (planejado)

## 📋 Pré-requisitos

- Node.js 18.0.0 ou superior
- Python 3.10 ou superior
- MySQL 8.0 ou superior
- npm ou yarn
- pip

## 🔧 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/CarlosHonorato70/appPGR.git
cd appPGR
```

### 2. Setup do Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# Iniciar servidor em modo desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### 3. Setup do Frontend (Streamlit)

```bash
cd streamlit

# Criar ambiente virtual (opcional mas recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Iniciar aplicação Streamlit
streamlit run app.py
```

A aplicação estará disponível em `http://localhost:8501`

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

Crie um arquivo `.env.local` no diretório `backend/`:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/blackbelt

# Server
PORT=3000
NODE_ENV=development

# Authentication (futuro)
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8501
```

## 📚 Estrutura do Projeto

```
appPGR/
├── backend/                    # Backend Node.js + TypeScript
│   ├── src/
│   │   ├── database/
│   │   │   └── schema.ts      # Schema do banco de dados
│   │   ├── routes/            # Rotas HTTP (futuro)
│   │   ├── middleware/        # Middleware Express
│   │   ├── utils/
│   │   │   └── calculations.ts # Cálculos de precificação
│   │   ├── trpc/
│   │   │   ├── router.ts      # Router principal tRPC
│   │   │   └── routers/       # Routers por módulo
│   │   │       ├── pricing.ts
│   │   │       ├── proposals.ts
│   │   │       └── risk-assessments.ts
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── streamlit/                  # Frontend Streamlit
│   ├── app.py                 # Aplicação principal
│   ├── pages/                 # Páginas adicionais (futuro)
│   ├── utils/                 # Utilitários Python
│   ├── requirements.txt
│   └── config.toml
│
├── index.html                 # Sistema PGR original (mantido)
├── app.js
├── style.css
└── README.md
```

## 💻 Uso

### Exemplo: Calcular Hora Técnica (Backend API)

```typescript
// Via tRPC
const result = await trpc.pricing.calculateTechnicalHour.query({
  fixedCosts: 5000,
  proLabor: 2000,
  productiveHours: 160
});
// Resultado: { technicalHour: 43.75 }
```

### Exemplo: Criar Proposta (Backend API)

```typescript
const proposal = await trpc.proposals.createProposal.mutate({
  clientId: "client-123",
  title: "Proposta de Consultoria",
  tenantId: "tenant-1",
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

### Exemplo: Interface Streamlit

1. Acesse `http://localhost:8501`
2. No menu lateral, selecione "🧮 Precificação"
3. Configure os parâmetros base
4. Calcule um item de proposta
5. Visualize os resultados em tempo real

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend (futuro)
cd streamlit
pytest tests/
```

## 📦 Build e Deploy

### Build do Backend

```bash
cd backend
npm run build
npm start
```

### Deploy com Docker (Planejado)

```bash
docker-compose up -d
```

## 🔒 Segurança

- Validação de entrada com Zod
- Tipo-segurança com TypeScript
- Cálculos financeiros precisos com Decimal.js
- Row Level Security (RLS) planejado
- Auditoria completa de operações
- Conformidade LGPD

## ⚠️ Notas Importantes

### Sistema PGR Original (HTML/JS)

O sistema PGR original (`index.html`, `app.js`, `style.css`) está incluído mas o arquivo JavaScript (`app.js`) está incompleto. Ele contém apenas stubs de funções. Para usar o sistema PGR original completamente funcional, será necessário:

1. Implementar o objeto `unidadeWorkManager`
2. Implementar a função `inicializarNavegacaoSeletorUnidade()`
3. Adicionar toda a lógica de negócio faltante

**Alternativa**: Use a nova **Plataforma Black Belt** (Backend + Streamlit) que oferece funcionalidades similares e mais avançadas, totalmente implementada.

## 🛣️ Roadmap

- [x] Estrutura básica do backend
- [x] Sistema de precificação
- [x] Interface Streamlit
- [ ] Completar sistema PGR original (JavaScript)
- [ ] Integração completa com banco de dados
- [ ] Sistema de autenticação OAuth 2.0
- [ ] Geração de PDF para propostas
- [ ] Testes automatizados
- [ ] Deploy em produção
- [ ] API REST adicional
- [ ] Frontend React (opcional)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato:
- Email: support@blackbelt.com.br
- GitHub Issues: [https://github.com/CarlosHonorato70/appPGR/issues](https://github.com/CarlosHonorato70/appPGR/issues)

## ✨ Agradecimentos

- Equipe Black Belt Consultoria
- Comunidade Open Source
- Contribuidores do projeto

---

**Desenvolvido com ❤️ por Carlos Honorato e equipe Black Belt**
