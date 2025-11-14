# Fase 4 - Sprint 1: Guia de Implementação Simplificado

## 📋 Visão Geral

Este guia fornece um roteiro passo a passo para implementar o Sprint 1 da Fase 4 de forma simplificada e incremental.

**Duração Estimada**: 5-7 dias
**Complexidade**: Média
**Pré-requisitos**: Fases 1, 2 e 3 completas ✅

---

## 🎯 Objetivos do Sprint 1

1. ✅ **Autenticação JWT Básica** - Sistema de login e proteção de rotas
2. ✅ **Integração DB Real** - Substituir mock data nos routers existentes
3. ✅ **Testes** - Cobertura básica dos novos componentes

---

## 📦 Componentes a Implementar

### 1. Sistema de Autenticação JWT (2-3 dias)

#### 1.1 Instalar Dependências

```bash
cd backend
npm install jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

#### 1.2 Criar Módulo de Autenticação

**Arquivo**: `backend/src/auth/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'blackbelt-api'
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'blackbelt-api'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'blackbelt-api'
  });
};
```

#### 1.3 Criar Serviço de Autenticação

**Arquivo**: `backend/src/auth/authService.ts`

```typescript
import bcrypt from 'bcrypt';
import { db } from '../database/connection';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { generateToken, generateRefreshToken, JWTPayload } from './jwt';
import { AppError } from '../middleware/errorHandler';
import { log } from '../utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Buscar usuário no banco
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      log.warn(`Login attempt failed: user not found - ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      log.warn(`Login attempt failed: invalid password - ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    // Gerar tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    log.info(`User logged in successfully: ${email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

export const authService = new AuthService();
```

#### 1.4 Criar Middleware de Autenticação

**Arquivo**: `backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../auth/jwt';
import { AppError } from './errorHandler';
import { log } from '../utils/logger';

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Token format invalid', 401);
    }

    const token = parts[1];

    // Verificar e decodificar token
    const decoded = verifyToken(token);

    // Adicionar usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    log.error('Authentication failed', error);
    next(new AppError('Invalid token', 401));
  }
};

// Middleware para verificar roles específicas
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      log.warn(`Access denied: user ${req.user.email} attempted to access resource requiring roles ${allowedRoles.join(', ')}`);
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};
```

#### 1.5 Criar Router de Autenticação

**Arquivo**: `backend/src/trpc/routers/auth.ts`

```typescript
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { authService } from '../../auth/authService';

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6)
      })
    )
    .mutation(async ({ input }) => {
      return authService.login(input);
    }),

  // Refresh token (implementação futura)
  refresh: publicProcedure
    .input(
      z.object({
        refreshToken: z.string()
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implementar refresh token logic
      throw new Error('Not implemented yet');
    })
});
```

#### 1.6 Atualizar Variáveis de Ambiente

**Arquivo**: `backend/src/config/env.ts`

Adicionar ao schema:

```typescript
// ... código existente ...

const envSchema = z.object({
  // ... vars existentes ...
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
});

// ... resto do código ...
```

**Arquivo**: `backend/.env.example`

Adicionar:

```env
# ... vars existentes ...

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-change-in-production
```

---

### 2. Integração DB Real nos Routers (2-3 dias)

#### 2.1 Atualizar Router de Pricing

**Arquivo**: `backend/src/trpc/routers/pricing.ts`

Substituir funções mock por queries reais:

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { PricingCalculator } from '../../calculations/PricingCalculator';
import { db } from '../../database/connection';
import { pricingParameters } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const pricingRouter = router({
  // Calcular hora técnica
  calculateTechnicalHour: protectedProcedure
    .input(
      z.object({
        monthlyCosts: z.number().positive(),
        monthlyProfit: z.number(),
        workingHoursPerMonth: z.number().positive()
      })
    )
    .query(async ({ input, ctx }) => {
      const calculator = new PricingCalculator();
      return calculator.calculateTechnicalHour(
        input.monthlyCosts,
        input.monthlyProfit,
        input.workingHoursPerMonth
      );
    }),

  // Buscar parâmetros de precificação do banco
  getParameters: protectedProcedure
    .query(async ({ ctx }) => {
      const params = await db
        .select()
        .from(pricingParameters)
        .where(eq(pricingParameters.tenantId, ctx.user.tenantId))
        .limit(1);

      if (params.length === 0) {
        // Retornar parâmetros padrão
        return {
          monthlyCosts: 10000,
          monthlyProfit: 5000,
          workingHoursPerMonth: 160,
          taxRate: 6.0,
          defaultMargin: 30
        };
      }

      return {
        monthlyCosts: Number(params[0].monthlyCosts),
        monthlyProfit: Number(params[0].monthlyProfit),
        workingHoursPerMonth: params[0].workingHoursPerMonth,
        taxRate: Number(params[0].taxRate),
        defaultMargin: Number(params[0].defaultMargin)
      };
    }),

  // Atualizar parâmetros
  updateParameters: protectedProcedure
    .input(
      z.object({
        monthlyCosts: z.number().positive(),
        monthlyProfit: z.number(),
        workingHoursPerMonth: z.number().positive(),
        taxRate: z.number().min(0).max(100),
        defaultMargin: z.number().min(0).max(100)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [existing] = await db
        .select()
        .from(pricingParameters)
        .where(eq(pricingParameters.tenantId, ctx.user.tenantId))
        .limit(1);

      if (existing) {
        // Atualizar existente
        await db
          .update(pricingParameters)
          .set({
            monthlyCosts: input.monthlyCosts.toString(),
            monthlyProfit: input.monthlyProfit.toString(),
            workingHoursPerMonth: input.workingHoursPerMonth,
            taxRate: input.taxRate.toString(),
            defaultMargin: input.defaultMargin.toString(),
            updatedAt: new Date()
          })
          .where(eq(pricingParameters.id, existing.id));

        return { success: true, message: 'Parameters updated' };
      } else {
        // Criar novo
        const id = crypto.randomUUID();
        await db.insert(pricingParameters).values({
          id,
          monthlyCosts: input.monthlyCosts.toString(),
          monthlyProfit: input.monthlyProfit.toString(),
          workingHoursPerMonth: input.workingHoursPerMonth,
          taxRate: input.taxRate.toString(),
          defaultMargin: input.defaultMargin.toString(),
          tenantId: ctx.user.tenantId
        });

        return { success: true, message: 'Parameters created' };
      }
    })
});
```

#### 2.2 Atualizar Router de Propostas

**Arquivo**: `backend/src/trpc/routers/proposals.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../../database/connection';
import { proposals, proposalItems, clients } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export const proposalsRouter = router({
  // Listar propostas
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(20),
        status: z.enum(['rascunho', 'enviada', 'aprovada', 'rejeitada']).optional()
      })
    )
    .query(async ({ input, ctx }) => {
      const offset = (input.page - 1) * input.perPage;

      const whereClause = input.status
        ? and(
            eq(proposals.tenantId, ctx.user.tenantId),
            eq(proposals.status, input.status)
          )
        : eq(proposals.tenantId, ctx.user.tenantId);

      const results = await db
        .select({
          id: proposals.id,
          clientId: proposals.clientId,
          clientName: clients.name,
          number: proposals.number,
          status: proposals.status,
          totalValue: proposals.totalValue,
          validUntil: proposals.validUntil,
          createdAt: proposals.createdAt
        })
        .from(proposals)
        .leftJoin(clients, eq(proposals.clientId, clients.id))
        .where(whereClause)
        .orderBy(desc(proposals.createdAt))
        .limit(input.perPage)
        .offset(offset);

      return {
        data: results,
        page: input.page,
        perPage: input.perPage,
        total: results.length // TODO: Adicionar count total
      };
    }),

  // Buscar proposta por ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [proposal] = await db
        .select()
        .from(proposals)
        .where(
          and(
            eq(proposals.id, input.id),
            eq(proposals.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Buscar items da proposta
      const items = await db
        .select()
        .from(proposalItems)
        .where(eq(proposalItems.proposalId, input.id));

      return {
        ...proposal,
        items
      };
    }),

  // Criar proposta
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid(),
        validUntil: z.string(),
        observations: z.string().optional(),
        items: z.array(
          z.object({
            serviceId: z.string().uuid(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            adjustmentPersonalization: z.number().default(0),
            adjustmentRisk: z.number().default(0),
            adjustmentSeniority: z.number().default(0),
            volumeDiscount: z.number().default(0)
          })
        )
      })
    )
    .mutation(async ({ input, ctx }) => {
      const proposalId = crypto.randomUUID();
      
      // Calcular valor total
      const totalValue = input.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      // Criar proposta
      await db.insert(proposals).values({
        id: proposalId,
        clientId: input.clientId,
        number: `PROP-${Date.now()}`, // TODO: Gerar número sequencial
        status: 'rascunho',
        totalValue: totalValue.toString(),
        validUntil: new Date(input.validUntil),
        observations: input.observations,
        tenantId: ctx.user.tenantId,
        createdBy: ctx.user.userId
      });

      // Criar items
      for (const item of input.items) {
        const itemId = crypto.randomUUID();
        const itemTotal = item.quantity * item.unitPrice;

        await db.insert(proposalItems).values({
          id: itemId,
          proposalId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          adjustmentPersonalization: item.adjustmentPersonalization.toString(),
          adjustmentRisk: item.adjustmentRisk.toString(),
          adjustmentSeniority: item.adjustmentSeniority.toString(),
          volumeDiscount: item.volumeDiscount.toString(),
          totalValue: itemTotal.toString()
        });
      }

      return { id: proposalId, success: true };
    })
});
```

#### 2.3 Atualizar Router de Risk Assessments

**Arquivo**: `backend/src/trpc/routers/risk-assessments.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../../database/connection';
import { riskAssessments, clients } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export const riskAssessmentsRouter = router({
  // Listar avaliações
  list: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(20)
      })
    )
    .query(async ({ input, ctx }) => {
      const offset = (input.page - 1) * input.perPage;

      const whereClause = input.clientId
        ? and(
            eq(riskAssessments.tenantId, ctx.user.tenantId),
            eq(riskAssessments.clientId, input.clientId)
          )
        : eq(riskAssessments.tenantId, ctx.user.tenantId);

      const results = await db
        .select({
          id: riskAssessments.id,
          clientId: riskAssessments.clientId,
          clientName: clients.name,
          sector: riskAssessments.sector,
          riskLevel: riskAssessments.riskLevel,
          createdAt: riskAssessments.createdAt
        })
        .from(riskAssessments)
        .leftJoin(clients, eq(riskAssessments.clientId, clients.id))
        .where(whereClause)
        .orderBy(desc(riskAssessments.createdAt))
        .limit(input.perPage)
        .offset(offset);

      return {
        data: results,
        page: input.page,
        perPage: input.perPage
      };
    }),

  // Criar avaliação de risco
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid(),
        sector: z.string(),
        riskLevel: z.enum(['baixo', 'médio', 'alto', 'muito_alto']),
        psychosocialFactors: z.string().optional(),
        recommendations: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = crypto.randomUUID();

      await db.insert(riskAssessments).values({
        id,
        clientId: input.clientId,
        sector: input.sector,
        riskLevel: input.riskLevel,
        psychosocialFactors: input.psychosocialFactors,
        recommendations: input.recommendations,
        tenantId: ctx.user.tenantId
      });

      return { id, success: true };
    })
});
```

#### 2.4 Atualizar tRPC Context para incluir User

**Arquivo**: `backend/src/trpc/trpc.ts`

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { JWTPayload, verifyToken } from '../auth/jwt';

// Context type
export interface Context {
  user?: JWTPayload;
}

// Create context from request
export const createContext = ({ req, res }: CreateExpressContextOptions): Context => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return {};
  }

  try {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const user = verifyToken(token);
      return { user };
    }
  } catch (error) {
    // Token inválido, retornar context vazio
  }

  return {};
};

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure que requer autenticação
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    });
  }

  return next({
    ctx: {
      user: ctx.user
    }
  });
});
```

---

### 3. Testes (1-2 dias)

#### 3.1 Testes de Autenticação

**Arquivo**: `backend/tests/auth.test.ts`

```typescript
import { describe, test, expect } from '@jest/globals';
import { generateToken, verifyToken } from '../src/auth/jwt';
import { AuthService } from '../src/auth/authService';

describe('JWT Authentication', () => {
  test('should generate and verify token', () => {
    const payload = {
      userId: '123',
      email: 'test@example.com',
      role: 'admin',
      tenantId: 'tenant-1'
    };

    const token = generateToken(payload);
    expect(token).toBeTruthy();

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  test('should reject invalid token', () => {
    expect(() => {
      verifyToken('invalid-token');
    }).toThrow();
  });
});

describe('AuthService', () => {
  const authService = new AuthService();

  test('should hash password', async () => {
    const password = 'test123';
    const hashed = await authService.hashPassword(password);
    
    expect(hashed).toBeTruthy();
    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(50);
  });
});
```

---

## 🚀 Ordem de Implementação Recomendada

### Dia 1-2: Autenticação JWT
1. Instalar dependências
2. Criar módulos JWT (jwt.ts, authService.ts)
3. Criar middleware de autenticação
4. Atualizar variáveis de ambiente
5. Criar router de autenticação
6. Testar login básico

### Dia 3-4: Integração DB Real
1. Atualizar tRPC context
2. Atualizar router de pricing
3. Atualizar router de proposals
4. Atualizar router de risk-assessments
5. Testar endpoints

### Dia 5: Testes e Documentação
1. Criar testes unitários
2. Testar integração end-to-end
3. Atualizar documentação
4. Code review

---

## ✅ Checklist de Validação

### Autenticação
- [ ] JWT tokens sendo gerados corretamente
- [ ] Login funcionando com credenciais válidas
- [ ] Login rejeitando credenciais inválidas
- [ ] Middleware protegendo rotas corretamente
- [ ] Tokens expirados sendo rejeitados

### Integração DB
- [ ] Pricing router consultando banco real
- [ ] Proposals router criando/listando propostas
- [ ] Risk assessments router funcionando
- [ ] Queries retornando dados corretos
- [ ] Erros sendo tratados adequadamente

### Testes
- [ ] Testes unitários passando
- [ ] Coverage mínimo de 60%
- [ ] Testes de integração funcionando

---

## 📚 Próximos Passos (Sprint 2)

Após completar Sprint 1:

1. **COPSOQ II Schema** - Expandir risk_assessments
2. **Sistema de Email** - Envio de questionários
3. **Testes E2E** - Playwright para testes completos
4. **CI/CD** - GitHub Actions

---

## 🆘 Troubleshooting

### Erro: "JWT_SECRET is required"
- Verifique se `.env` contém JWT_SECRET e JWT_REFRESH_SECRET
- Reinicie o servidor após adicionar variáveis

### Erro: "Invalid token"
- Verifique se o token está sendo enviado no header: `Authorization: Bearer <token>`
- Confirme que o JWT_SECRET é o mesmo usado para gerar o token

### Erro: Database connection failed
- Verifique se MySQL está rodando
- Confirme credenciais no `.env`
- Execute `npm run db:push` para criar tabelas

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `PHASE_4_ROADMAP.md`
2. Revise os logs em `logs/combined.log`
3. Verifique os exemplos de código neste guia

---

**Versão**: 1.0.0  
**Data**: 2025-11-14  
**Autor**: GitHub Copilot
