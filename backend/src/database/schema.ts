// backend/src/database/schema.ts
import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  timestamp,
  boolean,
  mysqlEnum,
  index
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Tabela de Usuários
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'consultant', 'client', 'manager']).notNull(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  tenantIdx: index('idx_tenant').on(table.tenantId),
  emailIdx: index('idx_email').on(table.email)
}));

// Tabela de Clientes
export const clients = mysqlTable('clients', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  cnpj: varchar('cnpj', { length: 18 }).unique(),
  taxRegime: mysqlEnum('tax_regime', ['MEI', 'Simples Nacional', 'Lucro Presumido', 'Autônomo']).notNull(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  tenantIdx: index('idx_tenant').on(table.tenantId)
}));

// Tabela de Serviços
export const services = mysqlTable('services', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 12, scale: 2 }).notNull(),
  estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }).notNull(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  tenantIdx: index('idx_tenant').on(table.tenantId)
}));

// Tabela de Parâmetros de Precificação
export const pricingParameters = mysqlTable('pricing_parameters', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().unique(),
  taxRateMEI: decimal('tax_rate_mei', { precision: 5, scale: 2 }).default('0.00'),
  taxRateSimples: decimal('tax_rate_simples', { precision: 5, scale: 2 }).default('0.00'),
  taxRateLucroPresumido: decimal('tax_rate_lucro', { precision: 5, scale: 2 }).default('0.00'),
  taxRateAutonomo: decimal('tax_rate_autonomo', { precision: 5, scale: 2 }).default('0.00'),
  fixedCosts: decimal('fixed_costs', { precision: 12, scale: 2 }).notNull(),
  proLabor: decimal('pro_labor', { precision: 12, scale: 2 }).notNull(),
  productiveHours: decimal('productive_hours', { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  tenantIdx: index('idx_tenant').on(table.tenantId)
}));

// Tabela de Propostas
export const proposals = mysqlTable('proposals', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['draft', 'sent', 'approved', 'rejected', 'archived']).default('draft'),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull(),
  discountGeneral: decimal('discount_general', { precision: 12, scale: 2 }).default('0.00'),
  displacementFee: decimal('displacement_fee', { precision: 12, scale: 2 }).default('0.00'),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  clientIdx: index('idx_client').on(table.clientId),
  tenantIdx: index('idx_tenant').on(table.tenantId)
}));

// Tabela de Itens da Proposta
export const proposalItems = mysqlTable('proposal_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  proposalId: varchar('proposal_id', { length: 36 }).notNull(),
  serviceId: varchar('service_id', { length: 36 }).notNull(),
  quantity: int('quantity').default(1),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  adjustmentPersonalization: decimal('adjustment_personalization', { precision: 5, scale: 2 }).default('0.00'),
  adjustmentRisk: decimal('adjustment_risk', { precision: 5, scale: 2 }).default('0.00'),
  adjustmentSeniority: decimal('adjustment_seniority', { precision: 5, scale: 2 }).default('0.00'),
  volumeDiscount: decimal('volume_discount', { precision: 5, scale: 2 }).default('0.00'),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  proposalIdx: index('idx_proposal').on(table.proposalId),
  serviceIdx: index('idx_service').on(table.serviceId)
}));

// Tabela de Avaliações de Risco (NR-01)
export const riskAssessments = mysqlTable('risk_assessments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull(),
  sector: varchar('sector', { length: 255 }).notNull(),
  riskLevel: mysqlEnum('risk_level', ['baixo', 'médio', 'alto', 'muito_alto']).notNull(),
  psychosocialFactors: text('psychosocial_factors'),
  recommendations: text('recommendations'),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  clientIdx: index('idx_client').on(table.clientId),
  tenantIdx: index('idx_tenant').on(table.tenantId)
}));

// Tabela de Logs de Auditoria
export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 36 }).notNull(),
  changes: text('changes'),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow()
}, (table) => ({
  userIdx: index('idx_user').on(table.userId),
  tenantIdx: index('idx_tenant').on(table.tenantId),
  timestampIdx: index('idx_timestamp').on(table.timestamp)
}));

// Relações (Drizzle Relations)
export const usersRelations = relations(users, ({ many }) => ({
  proposals: many(proposals),
  auditLogs: many(auditLogs)
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  proposals: many(proposals),
  riskAssessments: many(riskAssessments)
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id]
  }),
  items: many(proposalItems)
}));

export const proposalItemsRelations = relations(proposalItems, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalItems.proposalId],
    references: [proposals.id]
  }),
  service: one(services, {
    fields: [proposalItems.serviceId],
    references: [services.id]
  })
}));
