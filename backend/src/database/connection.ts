// backend/src/database/connection.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'blackbelt_user',
  password: process.env.DB_PASSWORD || 'blackbelt_pass',
  database: process.env.DB_NAME || 'blackbelt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema, mode: 'default' });

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Close pool function
export async function closePool(): Promise<void> {
  await pool.end();
}
