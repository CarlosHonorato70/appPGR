// backend/src/database/helpers.ts
import { randomUUID } from 'crypto';

/**
 * Generate a unique ID for database records
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Convert Decimal.js or string to number safely
 */
export function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  return 0;
}

/**
 * Format decimal values for database (2 decimal places)
 */
export function formatDecimal(value: number): string {
  return value.toFixed(2);
}
