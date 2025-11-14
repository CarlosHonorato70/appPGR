// backend/src/trpc/routers/copsoq.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../../database/connection';
import { copsoqQuestionnaires, copsoqResponses } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateId } from '../../database/helpers';

// Zod schemas para validação
const createQuestionnaireSchema = z.object({
  clientId: z.string(),
  tenantId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional()
});

const submitResponseSchema = z.object({
  questionnaireId: z.string(),
  respondentName: z.string().min(1).max(255),
  respondentEmail: z.string().email(),
  responses: z.record(z.string(), z.number().min(0).max(4)), // Score 0-4 for each question
  completedAt: z.date().optional()
});

const analysisInputSchema = z.object({
  questionnaireId: z.string()
});

/**
 * Router tRPC para COPSOQ II (Copenhagen Psychosocial Questionnaire)
 * 
 * Implementa as 7 dimensões psicossociais:
 * 1. Exigências no Trabalho (demands)
 * 2. Organização do Trabalho (organization)
 * 3. Relações Sociais e Liderança (social_relations)
 * 4. Interface Trabalho-Indivíduo (work_individual)
 * 5. Valores no Local de Trabalho (values)
 * 6. Saúde e Bem-estar (health)
 * 7. Comportamentos Ofensivos (offensive_behaviors)
 */
export const copsoqRouter = router({
  /**
   * Lista questionários de um tenant
   */
  listQuestionnaires: publicProcedure
    .input(z.object({
      tenantId: z.string(),
      clientId: z.string().optional()
    }))
    .query(async ({ input }) => {
      const where = input.clientId 
        ? and(
            eq(copsoqQuestionnaires.tenantId, input.tenantId),
            eq(copsoqQuestionnaires.clientId, input.clientId)
          )
        : eq(copsoqQuestionnaires.tenantId, input.tenantId);

      const questionnaires = await db
        .select()
        .from(copsoqQuestionnaires)
        .where(where)
        .orderBy(desc(copsoqQuestionnaires.createdAt));

      return questionnaires;
    }),

  /**
   * Busca um questionário específico por ID
   */
  getQuestionnaire: publicProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ input }) => {
      const [questionnaire] = await db
        .select()
        .from(copsoqQuestionnaires)
        .where(eq(copsoqQuestionnaires.id, input.id));

      if (!questionnaire) {
        throw new Error('Questionnaire not found');
      }

      return questionnaire;
    }),

  /**
   * Cria novo questionário COPSOQ II
   */
  createQuestionnaire: publicProcedure
    .input(createQuestionnaireSchema)
    .mutation(async ({ input }) => {
      const id = generateId('copsoq');
      
      const [questionnaire] = await db
        .insert(copsoqQuestionnaires)
        .values({
          id,
          ...input,
          status: 'active'
        });

      return { id, ...input, status: 'active' };
    }),

  /**
   * Atualiza questionário
   */
  updateQuestionnaire: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      status: z.enum(['active', 'closed', 'draft']).optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      await db
        .update(copsoqQuestionnaires)
        .set(updates)
        .where(eq(copsoqQuestionnaires.id, id));

      return { id, ...updates };
    }),

  /**
   * Lista respostas de um questionário
   */
  listResponses: publicProcedure
    .input(z.object({
      questionnaireId: z.string()
    }))
    .query(async ({ input }) => {
      const responses = await db
        .select()
        .from(copsoqResponses)
        .where(eq(copsoqResponses.questionnaireId, input.questionnaireId))
        .orderBy(desc(copsoqResponses.submittedAt));

      // Parse JSON responses
      return responses.map(r => ({
        ...r,
        responses: typeof r.responses === 'string' 
          ? JSON.parse(r.responses) 
          : r.responses
      }));
    }),

  /**
   * Submete resposta de um questionário
   */
  submitResponse: publicProcedure
    .input(submitResponseSchema)
    .mutation(async ({ input }) => {
      const id = generateId('resp');
      
      await db
        .insert(copsoqResponses)
        .values({
          id,
          questionnaireId: input.questionnaireId,
          respondentName: input.respondentName,
          respondentEmail: input.respondentEmail,
          responses: JSON.stringify(input.responses),
          completedAt: input.completedAt || new Date(),
          submittedAt: new Date()
        });

      return { id, message: 'Response submitted successfully' };
    }),

  /**
   * Calcula análise agregada de um questionário
   * Retorna scores médios por dimensão psicossocial
   */
  getAnalysis: publicProcedure
    .input(analysisInputSchema)
    .query(async ({ input }) => {
      const responses = await db
        .select()
        .from(copsoqResponses)
        .where(eq(copsoqResponses.questionnaireId, input.questionnaireId));

      if (responses.length === 0) {
        return {
          totalResponses: 0,
          dimensions: {},
          overallRisk: 'no_data'
        };
      }

      // Definição das dimensões e suas perguntas
      const dimensions = {
        demands: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
        organization: ['q7', 'q8', 'q9', 'q10', 'q11'],
        social_relations: ['q12', 'q13', 'q14', 'q15', 'q16', 'q17'],
        work_individual: ['q18', 'q19', 'q20', 'q21', 'q22'],
        values: ['q23', 'q24', 'q25', 'q26', 'q27'],
        health: ['q28', 'q29', 'q30', 'q31', 'q32', 'q33'],
        offensive_behaviors: ['q34', 'q35', 'q36', 'q37', 'q38', 'q39', 'q40']
      };

      // Calcula scores médios por dimensão
      const dimensionScores: Record<string, { avgScore: number; risk: string }> = {};

      for (const [dimension, questions] of Object.entries(dimensions)) {
        let totalScore = 0;
        let count = 0;

        responses.forEach(response => {
          const parsed = typeof response.responses === 'string' 
            ? JSON.parse(response.responses) 
            : response.responses;

          questions.forEach(q => {
            if (parsed[q] !== undefined) {
              totalScore += parsed[q];
              count++;
            }
          });
        });

        const avgScore = count > 0 ? totalScore / count : 0;
        
        // Classifica risco (0-4 scale)
        let risk = 'low';
        if (avgScore >= 3) risk = 'high';
        else if (avgScore >= 2) risk = 'medium';
        
        dimensionScores[dimension] = { avgScore, risk };
      }

      // Calcula risco geral
      const avgScores = Object.values(dimensionScores).map(d => d.avgScore);
      const overallAvg = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
      
      let overallRisk = 'low';
      if (overallAvg >= 3) overallRisk = 'high';
      else if (overallAvg >= 2) overallRisk = 'medium';

      return {
        totalResponses: responses.length,
        dimensions: dimensionScores,
        overallRisk,
        overallScore: overallAvg
      };
    }),

  /**
   * Gera relatório individual de uma resposta
   */
  getIndividualReport: publicProcedure
    .input(z.object({
      responseId: z.string()
    }))
    .query(async ({ input }) => {
      const [response] = await db
        .select()
        .from(copsoqResponses)
        .where(eq(copsoqResponses.id, input.responseId));

      if (!response) {
        throw new Error('Response not found');
      }

      const parsed = typeof response.responses === 'string' 
        ? JSON.parse(response.responses) 
        : response.responses;

      // Mesma lógica de dimensões
      const dimensions = {
        demands: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
        organization: ['q7', 'q8', 'q9', 'q10', 'q11'],
        social_relations: ['q12', 'q13', 'q14', 'q15', 'q16', 'q17'],
        work_individual: ['q18', 'q19', 'q20', 'q21', 'q22'],
        values: ['q23', 'q24', 'q25', 'q26', 'q27'],
        health: ['q28', 'q29', 'q30', 'q31', 'q32', 'q33'],
        offensive_behaviors: ['q34', 'q35', 'q36', 'q37', 'q38', 'q39', 'q40']
      };

      const dimensionScores: Record<string, { score: number; risk: string }> = {};

      for (const [dimension, questions] of Object.entries(dimensions)) {
        let totalScore = 0;
        let count = 0;

        questions.forEach(q => {
          if (parsed[q] !== undefined) {
            totalScore += parsed[q];
            count++;
          }
        });

        const score = count > 0 ? totalScore / count : 0;
        
        let risk = 'low';
        if (score >= 3) risk = 'high';
        else if (score >= 2) risk = 'medium';
        
        dimensionScores[dimension] = { score, risk };
      }

      return {
        respondent: {
          name: response.respondentName,
          email: response.respondentEmail,
          completedAt: response.completedAt,
          submittedAt: response.submittedAt
        },
        dimensions: dimensionScores,
        responses: parsed
      };
    })
});
