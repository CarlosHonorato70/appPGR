// backend/drizzle.config.ts
import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'blackbelt_user',
    password: process.env.DB_PASSWORD || 'blackbelt_pass',
    database: process.env.DB_NAME || 'blackbelt',
  },
  verbose: true,
  strict: true,
} satisfies Config;
