// backend/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('blackbelt_user'),
  DB_PASSWORD: z.string().default('blackbelt_pass'),
  DB_NAME: z.string().default('blackbelt'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:8501'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // JWT (for future use)
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d')
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Environment validation failed');
  }
}

export const env = validateEnv();
