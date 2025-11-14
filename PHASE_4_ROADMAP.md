# 🚀 Fase 4 - Produção e Funcionalidades Avançadas

## 📋 Visão Geral

A Fase 4 representa a transição para produção e a implementação de funcionalidades avançadas, incluindo o questionário COPSOQ II completo, sistema de autenticação JWT, e integração real com banco de dados.

**Status**: 📝 Planejamento  
**Duração Estimada**: 4-6 semanas  
**Prioridade**: Produção Ready  

---

## 🎯 Objetivos Principais

1. **Produção Ready**: Sistema pronto para deploy em ambiente de produção
2. **COPSOQ II**: Implementação completa do questionário psicossocial
3. **Autenticação**: Sistema JWT com controle de acesso
4. **Integração Real**: Conectar todos os componentes com banco de dados real
5. **Performance**: Otimizações para alta carga

---

## 📦 Componentes da Fase 4

### 1. 🔐 Sistema de Autenticação JWT (Alta Prioridade)

**Descrição**: Sistema completo de autenticação e autorização com JSON Web Tokens.

**Funcionalidades**:
- Login/Logout com JWT
- Refresh tokens
- Controle de acesso baseado em roles (Admin, Consultant, Client, Manager)
- Middleware de autenticação
- Password hashing com bcrypt
- Rate limiting específico para auth

**Arquivos a Criar**:
```
backend/src/
├── auth/
│   ├── jwt.ts           # Geração e validação de tokens
│   ├── password.ts      # Hash e verificação de senhas
│   └── permissions.ts   # Controle de permissões
├── middleware/
│   └── authenticate.ts  # Middleware de autenticação
└── trpc/routers/
    └── auth.ts          # Rotas de autenticação
```

**Exemplo de Implementação**:

```typescript
// backend/src/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
};
```

**Dependências**:
- `jsonwebtoken@^9.0.2`
- `bcrypt@^5.1.1`
- `@types/bcrypt@^5.0.2`
- `@types/jsonwebtoken@^9.0.5`

**Testes**: 15 novos testes unitários para auth

**Esforço**: 5 dias  
**Impacto**: Alto - Segurança fundamental

---

### 2. 📊 Questionário COPSOQ II Completo (Alta Prioridade)

**Descrição**: Implementação completa do Copenhagen Psychosocial Questionnaire II com 7 dimensões e 40+ perguntas.

**Dimensões do COPSOQ II**:
1. **Exigências no Trabalho** (9 perguntas)
   - Exigências quantitativas
   - Ritmo de trabalho
   - Exigências emocionais
   
2. **Organização do Trabalho e Conteúdo** (8 perguntas)
   - Influência no trabalho
   - Possibilidades de desenvolvimento
   - Significado do trabalho
   
3. **Relações Sociais e Liderança** (12 perguntas)
   - Previsibilidade
   - Apoio social de colegas
   - Apoio social de superiores
   - Qualidade da liderança
   
4. **Interface Trabalho-Indivíduo** (6 perguntas)
   - Insegurança no trabalho
   - Satisfação no trabalho
   
5. **Valores no Local de Trabalho** (5 perguntas)
   - Confiança horizontal
   - Confiança vertical
   - Justiça e respeito
   
6. **Saúde e Bem-estar** (6 pergunas)
   - Problemas em dormir
   - Burnout
   - Estresse
   
7. **Comportamentos Ofensivos** (4 perguntas)
   - Assédio moral
   - Violência
   - Discriminação

**Arquivos a Criar**:

```
backend/src/
├── copsoq/
│   ├── questions.ts      # 40+ perguntas do COPSOQ II
│   ├── scoring.ts        # Sistema de pontuação
│   └── analysis.ts       # Análise de resultados
└── trpc/routers/
    └── copsoq.ts         # API do questionário

streamlit/pages/
└── 06_copsoq.py          # Interface do questionário
```

**Exemplo de Estrutura**:

```typescript
// backend/src/copsoq/questions.ts
export interface COPSOQQuestion {
  id: string;
  dimension: COPSOQDimension;
  text: string;
  scale: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';
  weight: number;
}

export enum COPSOQDimension {
  EXIGENCIAS = 'exigencias',
  ORGANIZACAO = 'organizacao',
  RELACOES = 'relacoes',
  INTERFACE = 'interface',
  VALORES = 'valores',
  SAUDE = 'saude',
  COMPORTAMENTOS = 'comportamentos'
}

export const copsoqQuestions: COPSOQQuestion[] = [
  {
    id: 'q1',
    dimension: COPSOQDimension.EXIGENCIAS,
    text: 'Com que frequência você precisa trabalhar muito rápido?',
    scale: 'always',
    weight: 1.0
  },
  // ... 40+ perguntas
];
```

**Database Schema**:

```typescript
// Adicionar ao schema.ts
export const copsoqResponses = mysqlTable('copsoq_responses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull(),
  employeeEmail: varchar('employee_email', { length: 255 }).notNull(),
  responses: text('responses').notNull(), // JSON das respostas
  scores: text('scores').notNull(), // JSON dos scores por dimensão
  completedAt: timestamp('completed_at'),
  sentAt: timestamp('sent_at').notNull(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
```

**Esforço**: 8 dias  
**Impacto**: Alto - Funcionalidade chave

---

### 3. 📧 Sistema de Envio de Email (Média Prioridade)

**Descrição**: Sistema completo de envio de emails para questionários e notificações.

**Funcionalidades**:
- Envio de questionário COPSOQ por email
- Templates de email profissionais
- Sistema de tracking (aberto, respondido)
- Lembretes automáticos
- Suporte SMTP

**Arquivos a Criar**:

```
backend/src/
├── email/
│   ├── mailer.ts         # Cliente SMTP
│   ├── templates.ts      # Templates de email
│   └── queue.ts          # Fila de emails
└── trpc/routers/
    └── email.ts          # API de email

streamlit/utils/
└── email_sender.py       # Cliente Python para emails
```

**Exemplo de Implementação**:

```typescript
// backend/src/email/mailer.ts
import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      }
    });
  }

  async sendCOPSOQSurvey(to: string, surveyLink: string): Promise<void> {
    const html = this.getCOPSOQTemplate(surveyLink);
    
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'Questionário de Avaliação Psicossocial - COPSOQ II',
      html
    });
  }

  private getCOPSOQTemplate(link: string): string {
    return `
      <html>
        <body>
          <h1>Avaliação Psicossocial</h1>
          <p>Você foi convidado a responder o questionário COPSOQ II.</p>
          <p><a href="${link}">Clique aqui para responder</a></p>
        </body>
      </html>
    `;
  }
}
```

**Dependências**:
- `nodemailer@^6.9.7`
- `@types/nodemailer@^6.4.14`

**Esforço**: 4 dias  
**Impacto**: Médio

---

### 4. 🗄️ Integração Real com Banco de Dados (Alta Prioridade)

**Descrição**: Substituir mock data por queries reais ao banco MySQL.

**Componentes**:
- Conectar routers tRPC ao Drizzle ORM
- Implementar queries reais para todos os endpoints
- Adicionar transações onde necessário
- Implementar paginação
- Cache de queries frequentes

**Arquivos a Modificar**:

```
backend/src/trpc/routers/
├── pricing.ts       # Queries reais de pricing_parameters
├── proposals.ts     # CRUD real de proposals
├── clients.ts       # CRUD real de clients (NOVO)
├── services.ts      # CRUD real de services (NOVO)
└── risk-assessments.ts  # Queries reais de risk_assessments
```

**Exemplo de Migração**:

```typescript
// Antes (Mock)
getPricingParameters: publicProcedure
  .input(z.object({ tenantId: z.string() }))
  .query(async ({ input }) => {
    return {
      taxRateMEI: 3.5,
      taxRateSimples: 6.0,
      // ... mock data
    };
  }),

// Depois (Real)
getPricingParameters: publicProcedure
  .input(z.object({ tenantId: z.string() }))
  .query(async ({ input }) => {
    const params = await db
      .select()
      .from(pricingParameters)
      .where(eq(pricingParameters.tenantId, input.tenantId))
      .limit(1);

    if (!params[0]) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Pricing parameters not found'
      });
    }

    return params[0];
  }),
```

**Esforço**: 6 dias  
**Impacto**: Alto - Funcionalidade core

---

### 5. 🧪 Testes de Integração e E2E (Média Prioridade)

**Descrição**: Testes automatizados de integração e end-to-end.

**Componentes**:
- Testes de integração com banco de dados real (test DB)
- Testes E2E com Playwright
- CI/CD pipeline com GitHub Actions
- Coverage aumentado para 85%+

**Arquivos a Criar**:

```
backend/
├── tests/
│   ├── integration/
│   │   ├── pricing.integration.test.ts
│   │   ├── proposals.integration.test.ts
│   │   └── auth.integration.test.ts
│   └── e2e/
│       ├── user-flow.e2e.test.ts
│       └── proposal-creation.e2e.test.ts
└── .github/
    └── workflows/
        ├── ci.yml          # CI pipeline
        └── deploy.yml      # Deploy pipeline
```

**Dependências**:
- `@playwright/test@^1.40.0`
- `supertest@^6.3.3`
- `@types/supertest@^6.0.2`

**Esforço**: 5 dias  
**Impacto**: Alto - Qualidade

---

### 6. 🚀 CI/CD e Deploy (Alta Prioridade)

**Descrição**: Pipeline completo de CI/CD e processo de deploy.

**Componentes**:
- GitHub Actions para CI
- Testes automáticos em PRs
- Deploy automático em staging
- Deploy manual em produção
- Rollback automático
- Monitoramento de deploy

**Pipeline CI**:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: blackbelt_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Run linter
        working-directory: backend
        run: npm run lint
      
      - name: Run tests
        working-directory: backend
        run: npm test -- --coverage
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/blackbelt_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

**Esforço**: 3 dias  
**Impacto**: Alto - DevOps

---

### 7. 📈 Performance e Otimização (Média Prioridade)

**Descrição**: Otimizações de performance para alta carga.

**Componentes**:
- Query optimization com índices
- Caching com Redis
- Compression de respostas
- Lazy loading no frontend
- Database connection pooling
- Rate limiting adaptativo

**Arquivos a Criar**:

```
backend/src/
├── cache/
│   ├── redis.ts         # Cliente Redis
│   └── strategies.ts    # Estratégias de cache
└── optimization/
    ├── compression.ts   # Middleware de compressão
    └── query-cache.ts   # Cache de queries
```

**Dependências**:
- `redis@^4.6.11`
- `compression@^1.7.4`
- `@types/compression@^1.7.5`

**Esforço**: 4 dias  
**Impacto**: Médio - Performance

---

### 8. 📱 Frontend React (Opcional - Baixa Prioridade)

**Descrição**: Frontend alternativo em React com shadcn/ui.

**Componentes**:
- App React com TypeScript
- Integração tRPC client
- UI components com shadcn/ui
- Autenticação JWT
- Rotas protegidas

**Stack**:
- React 18
- TypeScript
- Vite
- TanStack Router
- TanStack Query (React Query)
- shadcn/ui
- Tailwind CSS

**Esforço**: 10 dias  
**Impacto**: Médio - UX

---

## 📊 Roadmap Detalhado

### Semana 1-2: Fundação de Produção

**Sprint 1.1** (5 dias):
- [ ] Sistema de Autenticação JWT
- [ ] Middleware de autenticação
- [ ] Login/Logout endpoints
- [ ] Refresh token flow
- [ ] 15 testes de auth

**Sprint 1.2** (5 dias):
- [ ] Integração real com DB - Pricing
- [ ] Integração real com DB - Proposals
- [ ] Integração real com DB - Clients
- [ ] Integração real com DB - Services
- [ ] Testes de integração

### Semana 3-4: COPSOQ II e Email

**Sprint 2.1** (8 dias):
- [ ] Estrutura do questionário COPSOQ II
- [ ] 40+ perguntas implementadas
- [ ] Sistema de pontuação
- [ ] Análise de resultados
- [ ] Interface Streamlit
- [ ] Database schema
- [ ] 20 testes

**Sprint 2.2** (4 dias):
- [ ] Sistema de envio de email
- [ ] Templates profissionais
- [ ] Tracking de emails
- [ ] Lembretes automáticos
- [ ] Integração com COPSOQ

### Semana 5-6: Qualidade e Deploy

**Sprint 3.1** (5 dias):
- [ ] Testes de integração (30+ testes)
- [ ] Testes E2E (10+ cenários)
- [ ] Coverage 85%+
- [ ] Documentação de testes

**Sprint 3.2** (3 dias):
- [ ] GitHub Actions CI/CD
- [ ] Pipeline de testes
- [ ] Deploy automático staging
- [ ] Monitoramento

**Sprint 3.3** (4 dias):
- [ ] Otimizações de performance
- [ ] Redis caching
- [ ] Query optimization
- [ ] Load testing

---

## 🎯 Métricas de Sucesso

### Code Quality
| Métrica | Fase 3 | Meta Fase 4 |
|---------|--------|-------------|
| Testes Unitários | 43 | 80+ |
| Testes Integração | 0 | 30+ |
| Testes E2E | 0 | 10+ |
| Coverage | 75% | 85%+ |
| Performance (p95) | N/A | <200ms |
| Uptime | N/A | 99.9% |

### Funcionalidades
- [ ] ✅ Autenticação JWT funcional
- [ ] ✅ COPSOQ II completo (40+ perguntas)
- [ ] ✅ Sistema de email operacional
- [ ] ✅ Integração DB 100%
- [ ] ✅ CI/CD pipeline ativo
- [ ] ✅ Deploy em produção

---

## 💰 Estimativa de Esforço

| Componente | Dias | Prioridade |
|-----------|------|------------|
| Autenticação JWT | 5 | Alta |
| COPSOQ II | 8 | Alta |
| Sistema de Email | 4 | Média |
| Integração DB Real | 6 | Alta |
| Testes Int/E2E | 5 | Média |
| CI/CD | 3 | Alta |
| Performance | 4 | Média |
| Frontend React | 10 | Baixa |
| **TOTAL** | **35-45 dias** | - |

**Duração com 1 dev**: 7-9 semanas  
**Duração com 2 devs**: 4-5 semanas  

---

## 🚧 Dependências e Bloqueadores

### Pré-requisitos:
1. ✅ Fases 1-3 completas
2. ⏳ MySQL configurado em produção
3. ⏳ Servidor SMTP configurado
4. ⏳ Ambiente de staging disponível
5. ⏳ Domínio e SSL configurados

### Riscos:
- **Alto**: Complexidade do COPSOQ II (40+ perguntas)
- **Médio**: Integração com sistemas de email externos
- **Baixo**: Performance com alta carga (mitigado com cache)

---

## 📚 Documentação a Criar

1. **AUTH_GUIDE.md** - Guia de autenticação
2. **COPSOQ_MANUAL.md** - Manual do questionário COPSOQ II
3. **EMAIL_SETUP.md** - Configuração de email
4. **DEPLOYMENT_GUIDE.md** - Guia de deploy
5. **PERFORMANCE_GUIDE.md** - Otimizações de performance
6. **API_REFERENCE.md** - Referência completa da API

---

## 🔄 Processo de Implementação

### Fase 4.1 - Fundação (Semana 1-2)
1. Setup de autenticação JWT
2. Integração com banco de dados real
3. Testes de integração básicos

### Fase 4.2 - COPSOQ (Semana 3-4)
1. Implementar questionário completo
2. Sistema de envio de email
3. Interface de resposta

### Fase 4.3 - Produção (Semana 5-6)
1. CI/CD pipeline
2. Testes E2E
3. Otimizações
4. Deploy em produção

---

## ✅ Checklist de Conclusão

**Funcionalidades**:
- [ ] Autenticação JWT completa e testada
- [ ] COPSOQ II com 40+ perguntas operacional
- [ ] Sistema de email enviando questionários
- [ ] Todos os endpoints integrados com DB real
- [ ] 80+ testes (unit + integration + e2e)
- [ ] Coverage 85%+

**Infraestrutura**:
- [ ] CI/CD pipeline funcionando
- [ ] Deploy automático em staging
- [ ] Monitoring em produção
- [ ] Backups automáticos
- [ ] SSL configurado
- [ ] CDN opcional

**Documentação**:
- [ ] Guias completos criados
- [ ] API documentada
- [ ] Processo de deploy documentado
- [ ] Runbooks operacionais

**Performance**:
- [ ] p95 < 200ms
- [ ] Suporta 1000+ req/min
- [ ] Redis cache implementado
- [ ] Queries otimizadas

---

## 🎓 Próximos Passos

1. **Revisar e aprovar** este roadmap
2. **Priorizar** componentes conforme necessidade de negócio
3. **Alocar recursos** (desenvolvedores, infra)
4. **Criar issues** no GitHub para cada componente
5. **Iniciar Sprint 1.1** - Autenticação JWT

---

## 📞 Contato e Suporte

Para dúvidas sobre a Fase 4:
- Criar issue no GitHub com label `phase-4`
- Mencionar @copilot nos comentários
- Ver documentação em `IMPROVEMENTS.md`

---

**Versão**: 1.0.0  
**Data**: 2025-11-14  
**Status**: 📝 Aguardando aprovação  
**Próxima Revisão**: Após aprovação da Fase 4
