/**
 * Testes para Autenticação JWT
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { generateToken, verifyToken, generateRefreshToken, extractToken, JWTPayload } from '../src/utils/jwt';
import bcrypt from 'bcrypt';

describe('JWT Utilities', () => {
  const mockPayload: JWTPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'consultant',
    tenantId: 'tenant-1'
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should generate token with custom expiry', () => {
      const token = generateToken(mockPayload, '1h');
      expect(token).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(mockPayload);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.tenantId).toBe(mockPayload.tenantId);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here');
      }).toThrow('Token inválido ou expirado');
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('');
      }).toThrow();
    });
  });

  describe('extractToken', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const authHeader = `Bearer ${token}`;
      const extracted = extractToken(authHeader);
      
      expect(extracted).toBe(token);
    });

    it('should return null for undefined header', () => {
      const extracted = extractToken(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer', () => {
      const extracted = extractToken('token123');
      expect(extracted).toBeNull();
    });

    it('should return null for empty Bearer', () => {
      const extracted = extractToken('Bearer ');
      expect(extracted).toBeNull();
    });
  });
});

describe('Password Hashing (bcrypt)', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'MySecurePassword123!';
      const hash = await bcrypt.hash(password, 10);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'MySecurePassword123!';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2); // Salt makes each hash unique
    });
  });

  describe('comparePassword', () => {
    it('should validate correct password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'MySecurePassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare('', hash);
      
      expect(isValid).toBe(false);
    });
  });
});

describe('Auth Flow Integration', () => {
  it('should simulate complete login flow', async () => {
    // 1. User registers with password
    const password = 'UserPassword123!';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 2. Password is stored as hash
    expect(passwordHash).not.toBe(password);
    
    // 3. User logs in, password is validated
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    expect(isPasswordValid).toBe(true);
    
    // 4. JWT token is generated
    const payload: JWTPayload = {
      userId: 'user-456',
      email: 'newuser@example.com',
      role: 'client',
      tenantId: 'tenant-2'
    };
    const token = generateToken(payload, '7d');
    
    // 5. Token is sent to client and can be verified later
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    
    // 6. Refresh token is also generated
    const refreshToken = generateRefreshToken(payload);
    const decodedRefresh = verifyToken(refreshToken);
    expect(decodedRefresh.userId).toBe(payload.userId);
  });

  it('should handle token expiration scenario', () => {
    // Note: Testing actual expiration would require waiting
    // This test validates the structure is correct
    const payload: JWTPayload = {
      userId: 'user-789',
      email: 'expire@example.com',
      role: 'manager',
      tenantId: 'tenant-3'
    };
    
    // Short-lived token
    const shortToken = generateToken(payload, '1s');
    
    // Should be valid immediately
    const decoded = verifyToken(shortToken);
    expect(decoded.userId).toBe(payload.userId);
  });
});

describe('Role-Based Access Control', () => {
  it('should include role in token payload', () => {
    const adminPayload: JWTPayload = {
      userId: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
      tenantId: 'tenant-1'
    };
    
    const token = generateToken(adminPayload);
    const decoded = verifyToken(token);
    
    expect(decoded.role).toBe('admin');
  });

  it('should support different roles', () => {
    const roles = ['admin', 'consultant', 'client', 'manager'];
    
    roles.forEach((role) => {
      const payload: JWTPayload = {
        userId: `user-${role}`,
        email: `${role}@example.com`,
        role,
        tenantId: 'tenant-1'
      };
      
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.role).toBe(role);
    });
  });
});

describe('Multi-Tenancy Support', () => {
  it('should include tenantId in token', () => {
    const payload: JWTPayload = {
      userId: 'user-mt',
      email: 'multitenant@example.com',
      role: 'consultant',
      tenantId: 'tenant-special'
    };
    
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    
    expect(decoded.tenantId).toBe('tenant-special');
  });

  it('should isolate different tenants', () => {
    const tenant1Payload: JWTPayload = {
      userId: 'user-1',
      email: 'user1@example.com',
      role: 'consultant',
      tenantId: 'tenant-1'
    };
    
    const tenant2Payload: JWTPayload = {
      userId: 'user-2',
      email: 'user2@example.com',
      role: 'consultant',
      tenantId: 'tenant-2'
    };
    
    const token1 = generateToken(tenant1Payload);
    const token2 = generateToken(tenant2Payload);
    
    const decoded1 = verifyToken(token1);
    const decoded2 = verifyToken(token2);
    
    expect(decoded1.tenantId).not.toBe(decoded2.tenantId);
  });
});
