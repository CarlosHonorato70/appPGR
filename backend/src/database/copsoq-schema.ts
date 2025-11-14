// backend/src/database/copsoq-schema.ts
import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
  mysqlEnum,
  index
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Tabela de Questionários COPSOQ II
export const copsoqQuestionnaires = mysqlTable('copsoq_questionnaires', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['draft', 'active', 'completed', 'archived']).notNull().default('draft'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  tenantIdx: index('idx_copsoq_tenant').on(table.tenantId),
  clientIdx: index('idx_copsoq_client').on(table.clientId),
  statusIdx: index('idx_copsoq_status').on(table.status)
}));

// Tabela de Respostas COPSOQ II
export const copsoqResponses = mysqlTable('copsoq_responses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  questionnaireId: varchar('questionnaire_id', { length: 36 }).notNull(),
  respondentEmail: varchar('respondent_email', { length: 255 }),
  respondentName: varchar('respondent_name', { length: 255 }),
  
  // Dimensão 1: Exigências no Trabalho (Demands at Work)
  quantitativeDemandsScore: int('quantitative_demands_score'), // 1-5
  workPaceScore: int('work_pace_score'), // 1-5
  emotionalDemandsScore: int('emotional_demands_score'), // 1-5
  cognitiveDemandsScore: int('cognitive_demands_score'), // 1-5
  
  // Dimensão 2: Organização do Trabalho e Conteúdo (Work Organization)
  influenceScore: int('influence_score'), // 1-5
  developmentPossibilitiesScore: int('development_possibilities_score'), // 1-5
  meaningOfWorkScore: int('meaning_of_work_score'), // 1-5
  commitmentToWorkplaceScore: int('commitment_to_workplace_score'), // 1-5
  
  // Dimensão 3: Relações Sociais e Liderança (Interpersonal Relations)
  predictabilityScore: int('predictability_score'), // 1-5
  qualityOfLeadershipScore: int('quality_of_leadership_score'), // 1-5
  socialSupportFromColleaguesScore: int('social_support_from_colleagues_score'), // 1-5
  socialSupportFromSupervisorsScore: int('social_support_from_supervisors_score'), // 1-5
  senseCommunityScore: int('sense_community_score'), // 1-5
  
  // Dimensão 4: Interface Trabalho-Indivíduo (Work-Individual Interface)
  insecurityScore: int('insecurity_score'), // 1-5
  workLifeBalanceScore: int('work_life_balance_score'), // 1-5
  trustScore: int('trust_score'), // 1-5
  justiceScore: int('justice_score'), // 1-5
  
  // Dimensão 5: Valores no Local de Trabalho (Values at Workplace)
  qualityOfWorkScore: int('quality_of_work_score'), // 1-5
  recognitionScore: int('recognition_score'), // 1-5
  
  // Dimensão 6: Saúde e Bem-estar (Health and Well-being)
  generalHealthScore: int('general_health_score'), // 1-5
  stressScore: int('stress_score'), // 1-5
  burnoutScore: int('burnout_score'), // 1-5
  sleepProblemsScore: int('sleep_problems_score'), // 1-5
  depressionScore: int('depression_score'), // 1-5
  
  // Dimensão 7: Comportamentos Ofensivos (Offensive Behaviors)
  sexualHarassmentScore: int('sexual_harassment_score'), // 0-4
  threatsOfViolenceScore: int('threats_of_violence_score'), // 0-4
  bullyingScore: int('bullying_score'), // 0-4
  
  // Scores agregados por dimensão (média calculada)
  demandsAvgScore: int('demands_avg_score'), // Média dimensão 1
  organizationAvgScore: int('organization_avg_score'), // Média dimensão 2
  relationsAvgScore: int('relations_avg_score'), // Média dimensão 3
  interfaceAvgScore: int('interface_avg_score'), // Média dimensão 4
  valuesAvgScore: int('values_avg_score'), // Média dimensão 5
  healthAvgScore: int('health_avg_score'), // Média dimensão 6
  offensiveBehaviorsAvgScore: int('offensive_behaviors_avg_score'), // Média dimensão 7
  
  // Score total e classificação de risco
  totalScore: int('total_score'),
  riskLevel: mysqlEnum('risk_level', ['baixo', 'médio', 'alto', 'crítico']),
  
  // Respostas detalhadas em JSON (todas as 40+ perguntas)
  detailedResponses: text('detailed_responses'), // JSON string
  
  // Metadados
  isComplete: boolean('is_complete').default(false),
  completedAt: timestamp('completed_at'),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  tenantIdx: index('idx_copsoq_resp_tenant').on(table.tenantId),
  questionnaireIdx: index('idx_copsoq_resp_questionnaire').on(table.questionnaireId),
  riskLevelIdx: index('idx_copsoq_resp_risk').on(table.riskLevel)
}));

// Relações
export const copsoqQuestionnairesRelations = relations(copsoqQuestionnaires, ({ many }) => ({
  responses: many(copsoqResponses)
}));

export const copsoqResponsesRelations = relations(copsoqResponses, ({ one }) => ({
  questionnaire: one(copsoqQuestionnaires, {
    fields: [copsoqResponses.questionnaireId],
    references: [copsoqQuestionnaires.id]
  })
}));
