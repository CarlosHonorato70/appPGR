// backend/src/validators/schemas.ts
import { z } from 'zod';

/**
 * Valida CNPJ usando algoritmo oficial
 */
function validateCNPJ(cnpj: string): boolean {
  // Remove formatação
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights[i];
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cnpj[12])) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights[i];
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cnpj[13])) return false;
  
  return true;
}

/**
 * Valida CPF usando algoritmo oficial
 */
function validateCPF(cpf: string): boolean {
  // Remove formatação
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf[9])) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf[10])) return false;
  
  return true;
}

// Custom validators para Zod
const cnpjValidator = z.string().refine(validateCNPJ, {
  message: 'CNPJ inválido'
});

const cpfValidator = z.string().refine(validateCPF, {
  message: 'CPF inválido'
});

// Schemas centralizados
export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido').optional(),
  cnpj: cnpjValidator.optional(),
  taxRegime: z.enum(['MEI', 'Simples Nacional', 'Lucro Presumido', 'Autônomo']),
  tenantId: z.string().uuid()
});

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  basePrice: z.number().positive('Preço deve ser positivo'),
  estimatedHours: z.number().positive('Horas devem ser positivas'),
  tenantId: z.string().uuid()
});

export const proposalSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres').max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'archived']).default('draft'),
  totalValue: z.number().positive(),
  discountGeneral: z.number().min(0).default(0),
  displacementFee: z.number().min(0).default(0),
  tenantId: z.string().uuid()
});

export const proposalItemSchema = z.object({
  id: z.string().uuid().optional(),
  proposalId: z.string().uuid(),
  serviceId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive(),
  adjustmentPersonalization: z.number().min(0).max(100).default(0),
  adjustmentRisk: z.number().min(0).max(100).default(0),
  adjustmentSeniority: z.number().min(0).max(100).default(0),
  volumeDiscount: z.number().min(0).max(100).default(0),
  totalValue: z.number().positive()
});

export const riskAssessmentSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  sector: z.string().min(3).max(255),
  riskLevel: z.enum(['baixo', 'médio', 'alto', 'muito_alto']),
  psychosocialFactors: z.string().optional(),
  recommendations: z.string().optional(),
  tenantId: z.string().uuid()
});

export const pricingParametersSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  taxRateMEI: z.number().min(0).max(100).default(0),
  taxRateSimples: z.number().min(0).max(100).default(0),
  taxRateLucroPresumido: z.number().min(0).max(100).default(0),
  taxRateAutonomo: z.number().min(0).max(100).default(0),
  fixedCosts: z.number().positive(),
  proLabor: z.number().positive(),
  productiveHours: z.number().positive()
});

// Export validators
export { validateCNPJ, validateCPF };

// Export types
export type ClientInput = z.infer<typeof clientSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type ProposalItemInput = z.infer<typeof proposalItemSchema>;
export type RiskAssessmentInput = z.infer<typeof riskAssessmentSchema>;
export type PricingParametersInput = z.infer<typeof pricingParametersSchema>;
