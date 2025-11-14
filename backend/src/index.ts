// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import dotenv from 'dotenv';
import { env } from './config/env';
import { log } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './database/connection';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: env.CORS_ORIGIN.split(','),
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  log.info(`${req.method} ${req.path}`);
  next();
});

// tRPC route
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: async ({ req }) => ({
      userId: req.headers['x-user-id'] as string,
      tenantId: req.headers['x-tenant-id'] as string
    })
  })
);

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Black Belt Integrated Platform API',
    version: '1.1.0',
    endpoints: {
      health: '/health',
      trpc: '/trpc'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  log.info(`🚀 Server running on port ${PORT}`);
  log.info(`📊 Health check: http://localhost:${PORT}/health`);
  log.info(`🔌 tRPC endpoint: http://localhost:${PORT}/trpc`);
  log.info(`🌍 Environment: ${env.NODE_ENV}`);
  
  // Test database connection on startup
  await testConnection();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    log.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    log.info('HTTP server closed');
  });
});
