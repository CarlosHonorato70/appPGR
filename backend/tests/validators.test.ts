// backend/tests/validators.test.ts
import { validateCNPJ, validateCPF, clientSchema, serviceSchema } from '../src/validators/schemas';

describe('CNPJ Validator', () => {
  it('should validate correct CNPJ with formatting', () => {
    expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
  });

  it('should validate correct CNPJ without formatting', () => {
    expect(validateCNPJ('11222333000181')).toBe(true);
  });

  it('should reject invalid CNPJ', () => {
    expect(validateCNPJ('11.222.333/0001-82')).toBe(false);
  });

  it('should reject CNPJ with all same digits', () => {
    expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
  });

  it('should reject CNPJ with wrong length', () => {
    expect(validateCNPJ('11.222.333/0001')).toBe(false);
  });
});

describe('CPF Validator', () => {
  it('should validate correct CPF with formatting', () => {
    expect(validateCPF('123.456.789-09')).toBe(true);
  });

  it('should validate correct CPF without formatting', () => {
    expect(validateCPF('12345678909')).toBe(true);
  });

  it('should reject invalid CPF', () => {
    expect(validateCPF('123.456.789-10')).toBe(false);
  });

  it('should reject CPF with all same digits', () => {
    expect(validateCPF('111.111.111-11')).toBe(false);
  });

  it('should reject CPF with wrong length', () => {
    expect(validateCPF('123.456.789')).toBe(false);
  });
});

describe('Client Schema', () => {
  it('should validate correct client data', () => {
    const validClient = {
      name: 'Empresa Teste',
      email: 'teste@empresa.com',
      phone: '(11) 98765-4321',
      cnpj: '11.222.333/0001-81',
      taxRegime: 'MEI' as const,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = clientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it('should reject client with invalid email', () => {
    const invalidClient = {
      name: 'Empresa Teste',
      email: 'invalid-email',
      taxRegime: 'MEI' as const,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = clientSchema.safeParse(invalidClient);
    expect(result.success).toBe(false);
  });

  it('should reject client with short name', () => {
    const invalidClient = {
      name: 'AB',
      email: 'teste@empresa.com',
      taxRegime: 'MEI' as const,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = clientSchema.safeParse(invalidClient);
    expect(result.success).toBe(false);
  });

  it('should reject client with invalid CNPJ', () => {
    const invalidClient = {
      name: 'Empresa Teste',
      email: 'teste@empresa.com',
      cnpj: '11.222.333/0001-82',
      taxRegime: 'MEI' as const,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = clientSchema.safeParse(invalidClient);
    expect(result.success).toBe(false);
  });
});

describe('Service Schema', () => {
  it('should validate correct service data', () => {
    const validService = {
      name: 'Consultoria SST',
      description: 'Consultoria em Segurança do Trabalho',
      basePrice: 5000,
      estimatedHours: 40,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = serviceSchema.safeParse(validService);
    expect(result.success).toBe(true);
  });

  it('should reject service with negative price', () => {
    const invalidService = {
      name: 'Consultoria SST',
      basePrice: -5000,
      estimatedHours: 40,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = serviceSchema.safeParse(invalidService);
    expect(result.success).toBe(false);
  });

  it('should reject service with zero hours', () => {
    const invalidService = {
      name: 'Consultoria SST',
      basePrice: 5000,
      estimatedHours: 0,
      tenantId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = serviceSchema.safeParse(invalidService);
    expect(result.success).toBe(false);
  });
});
