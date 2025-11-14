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
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
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

// Tabela de Questionários COPSOQ II
export const copsoqQuestionnaires = mysqlTable('copsoq_questionnaires', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull(),
  employeeName: varchar('employee_name', { length: 255 }),
  employeeRole: varchar('employee_role', { length: 255 }),
  department: varchar('department', { length: 255 }),
  status: mysqlEnum('status', ['draft', 'in_progress', 'completed', 'cancelled']).default('draft').notNull(),
  completedAt: timestamp('completed_at'),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  clientIdx: index('idx_client').on(table.clientId),
  tenantIdx: index('idx_tenant').on(table.tenantId),
  statusIdx: index('idx_status').on(table.status)
}));

// Tabela de Respostas COPSOQ II (7 dimensões psicossociais)
export const copsoqResponses = mysqlTable('copsoq_responses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  questionnaireId: varchar('questionnaire_id', { length: 36 }).notNull(),
  
  // Dimensão 1: Exigências no Trabalho (6 questões)
  workPace: int('work_pace'), // 0-4: Ritmo de trabalho
  quantitativeLoad: int('quantitative_load'), // 0-4: Quantidade de trabalho
  cognitiveLoad: int('cognitive_load'), // 0-4: Exigências cognitivas
  emotionalLoad: int('emotional_load'), // 0-4: Exigências emocionais
  workLifeConflict: int('work_life_conflict'), // 0-4: Conflito trabalho-vida
  workTime: int('work_time'), // 0-4: Tempo de trabalho
  
  // Dimensão 2: Organização do Trabalho (7 questões)
  influence: int('influence'), // 0-4: Influência no trabalho
  possibilitiesDevelopment: int('possibilities_development'), // 0-4: Possibilidades de desenvolvimento
  meaningWork: int('meaning_work'), // 0-4: Significado do trabalho
  commitment: int('commitment'), // 0-4: Comprometimento
  predictability: int('predictability'), // 0-4: Previsibilidade
  roleClarity: int('role_clarity'), // 0-4: Clareza do papel
  roleConflicts: int('role_conflicts'), // 0-4: Conflitos de papel
  
  // Dimensão 3: Relações Sociais e Liderança (8 questões)
  qualityLeadership: int('quality_leadership'), // 0-4: Qualidade da liderança
  socialSupport: int('social_support'), // 0-4: Apoio social de colegas
  socialSupportSupervisor: int('social_support_supervisor'), // 0-4: Apoio social do supervisor
  senseCommunity: int('sense_community'), // 0-4: Senso de comunidade
  feedbackWork: int('feedback_work'), // 0-4: Feedback sobre o trabalho
  socialRelations: int('social_relations'), // 0-4: Relações sociais
  trust: int('trust'), // 0-4: Confiança horizontal
  trustVertical: int('trust_vertical'), // 0-4: Confiança vertical
  
  // Dimensão 4: Interface Trabalho-Indivíduo (6 questões)
  insecurity: int('insecurity'), // 0-4: Insegurança laboral
  insecurityChanges: int('insecurity_changes'), // 0-4: Insegurança quanto a mudanças
  jobSatisfaction: int('job_satisfaction'), // 0-4: Satisfação no trabalho
  workFamilyEnrichment: int('work_family_enrichment'), // 0-4: Enriquecimento trabalho-família
  familyWorkEnrichment: int('family_work_enrichment'), // 0-4: Enriquecimento família-trabalho
  motivationWork: int('motivation_work'), // 0-4: Motivação no trabalho
  
  // Dimensão 5: Valores no Local de Trabalho (5 questões)
  recognitionSupervisor: int('recognition_supervisor'), // 0-4: Reconhecimento do supervisor
  recognitionManagement: int('recognition_management'), // 0-4: Reconhecimento da gestão
  fairness: int('fairness'), // 0-4: Justiça e respeito
  qualityWork: int('quality_work'), // 0-4: Qualidade do trabalho
  corporateSocialResponsibility: int('corporate_social_responsibility'), // 0-4: Responsabilidade social corporativa
  
  // Dimensão 6: Saúde e Bem-estar (6 questões)
  generalHealth: int('general_health'), // 0-4: Saúde geral
  mentalHealth: int('mental_health'), // 0-4: Saúde mental
  burnout: int('burnout'), // 0-4: Burnout
  stress: int('stress'), // 0-4: Estresse
  sleepProblems: int('sleep_problems'), // 0-4: Problemas de sono
  cognitiveStress: int('cognitive_stress'), // 0-4: Estresse cognitivo
  
  // Dimensão 7: Comportamentos Ofensivos (4 questões)
  bullying: int('bullying'), // 0-4: Assédio moral
  unwantedSexualAttention: int('unwanted_sexual_attention'), // 0-4: Atenção sexual indesejada
  threatsViolence: int('threats_violence'), // 0-4: Ameaças de violência
  unpleasantTeasing: int('unpleasant_teasing'), // 0-4: Zombaria desagradável
  
  // Scores calculados por dimensão (0-100)
  scoreWorkDemands: decimal('score_work_demands', { precision: 5, scale: 2 }),
  scoreWorkOrganization: decimal('score_work_organization', { precision: 5, scale: 2 }),
  scoreSocialRelations: decimal('score_social_relations', { precision: 5, scale: 2 }),
  scoreWorkIndividualInterface: decimal('score_work_individual_interface', { precision: 5, scale: 2 }),
  scoreWorkplaceValues: decimal('score_workplace_values', { precision: 5, scale: 2 }),
  scoreHealthWellbeing: decimal('score_health_wellbeing', { precision: 5, scale: 2 }),
  scoreOffensiveBehaviors: decimal('score_offensive_behaviors', { precision: 5, scale: 2 }),
  
  // Score global (média ponderada)
  totalScore: decimal('total_score', { precision: 5, scale: 2 }),
  riskLevel: mysqlEnum('risk_level', ['baixo', 'médio', 'alto', 'crítico']),
  
  // Metadados
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  questionnaireIdx: index('idx_questionnaire').on(table.questionnaireId),
  riskLevelIdx: index('idx_risk_level').on(table.riskLevel)
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
