/**
 * Middleware de Autenticação JWT
 * 
 * Middleware para proteger rotas que requerem autenticação
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, JWTPayload } from '../utils/jwt';
import { log } from '../utils/logger';

// Estende o tipo Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware que verifica se o usuário está autenticado
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }
    
    const payload = verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    log.warn('Tentativa de acesso com token inválido', { error });
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * Middleware que verifica se o usuário tem uma role específica
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      log.warn('Acesso negado por falta de permissão', {
        userId: req.user.userId,
        requiredRoles: roles,
        userRole: req.user.role
      });
      res.status(403).json({ error: 'Permissão insuficiente' });
      return;
    }
    
    next();
  };
}

/**
 * Middleware opcional de autenticação (não bloqueia se não autenticado)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Ignora erros de token em auth opcional
    log.debug('Token opcional inválido', { error });
  }
  
  next();
}
