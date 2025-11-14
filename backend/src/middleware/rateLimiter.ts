// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { log } from '../utils/logger';

/**
 * Rate limiter para APIs gerais
 * Permite 100 requisições por 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de requisições por janela
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  handler: (req, res) => {
    log.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas requisições deste IP, tente novamente mais tarde',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});

/**
 * Rate limiter mais restritivo para endpoints de autenticação
 * Permite apenas 5 tentativas por 15 minutos
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login, tente novamente mais tarde',
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  handler: (req, res) => {
    log.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas tentativas de login, tente novamente mais tarde'
    });
  }
});

/**
 * Rate limiter para operações de escrita
 * Permite 30 requisições por 15 minutos
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Limite de operações de escrita excedido',
  handler: (req, res) => {
    log.warn(`Write rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Limite de operações de escrita excedido'
    });
  }
});
