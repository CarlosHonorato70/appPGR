/**
 * Router de Autenticação
 * 
 * Endpoints para login, registro e gerenciamento de tokens
 */

import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { db } from '../../database/connection';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken } from '../../utils/jwt';
import { log } from '../../utils/logger';
import { generateId } from '../../database/helpers';

// Schema de validação para registro
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  role: z.enum(['admin', 'consultant', 'client', 'manager']).default('client'),
  tenantId: z.string().min(1, 'Tenant ID é obrigatório')
});

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Schema de validação para refresh token
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
});

export const authRouter = router({
  /**
   * Registra um novo usuário
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      // Verifica se o email já existe
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      
      if (existingUser.length > 0) {
        throw new Error('Email já cadastrado');
      }
      
      // Hash da senha
      const passwordHash = await bcrypt.hash(input.password, 10);
      
      // Cria o usuário
      const userId = generateId();
      await db.insert(users).values({
        id: userId,
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        tenantId: input.tenantId,
        isActive: true
      });
      
      log.info('Novo usuário registrado', { userId, email: input.email });
      
      // Gera tokens
      const payload = {
        userId,
        email: input.email,
        role: input.role,
        tenantId: input.tenantId
      };
      
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);
      
      return {
        user: {
          id: userId,
          email: input.email,
          name: input.name,
          role: input.role,
          tenantId: input.tenantId
        },
        token,
        refreshToken
      };
    }),
  
  /**
   * Faz login de um usuário
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      // Busca o usuário
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      
      if (!user) {
        throw new Error('Email ou senha incorretos');
      }
      
      // Verifica se o usuário está ativo
      if (!user.isActive) {
        throw new Error('Usuário inativo');
      }
      
      // Verifica a senha
      const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
      if (!passwordMatch) {
        throw new Error('Email ou senha incorretos');
      }
      
      log.info('Usuário autenticado', { userId: user.id, email: user.email });
      
      // Gera tokens
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      };
      
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId
        },
        token,
        refreshToken
      };
    }),
  
  /**
   * Renova o token usando um refresh token
   */
  refreshToken: publicProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input }) => {
      try {
        // Verifica o refresh token (usa a mesma função de verify)
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(input.refreshToken, process.env.JWT_SECRET || 'secret') as any;
        
        // Busca o usuário para validar se ainda está ativo
        const [user] = await db.select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);
        
        if (!user || !user.isActive) {
          throw new Error('Usuário inválido ou inativo');
        }
        
        // Gera novo token
        const payload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId
        };
        
        const newToken = generateToken(payload);
        const newRefreshToken = generateRefreshToken(payload);
        
        return {
          token: newToken,
          refreshToken: newRefreshToken
        };
      } catch (error) {
        throw new Error('Refresh token inválido');
      }
    }),
  
  /**
   * Busca o perfil do usuário autenticado (requer autenticação)
   */
  me: publicProcedure
    .query(async ({ ctx }) => {
      // Nota: Este endpoint deveria usar um procedimento protegido
      // Por enquanto, retorna null se não autenticado
      if (!ctx.user) {
        return null;
      }
      
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        tenantId: users.tenantId,
        isActive: users.isActive
      })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);
      
      return user || null;
    })
});
