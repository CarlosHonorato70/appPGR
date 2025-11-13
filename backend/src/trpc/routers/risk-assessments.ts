// backend/src/trpc/routers/risk-assessments.ts
import { router, publicProcedure } from '../router';
import { z } from 'zod';

export const riskAssessmentsRouter = router({
  listAssessments: publicProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      // Mock data - will be replaced with database query
      return [
        {
          id: 'risk-1',
          clientId: 'client-1',
          sector: 'TI',
          riskLevel: 'médio',
          tenantId: input.tenantId
        }
      ];
    }),

  createAssessment: publicProcedure
    .input(z.object({
      clientId: z.string(),
      sector: z.string(),
      riskLevel: z.enum(['baixo', 'médio', 'alto', 'muito_alto']),
      psychosocialFactors: z.string().optional(),
      recommendations: z.string().optional(),
      tenantId: z.string()
    }))
    .mutation(async ({ input }) => {
      // Mock response - will be replaced with database insert
      return {
        id: `risk-${Date.now()}`,
        ...input
      };
    }),

  updateAssessment: publicProcedure
    .input(z.object({
      id: z.string(),
      riskLevel: z.enum(['baixo', 'médio', 'alto', 'muito_alto']).optional(),
      psychosocialFactors: z.string().optional(),
      recommendations: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Mock response - will be replaced with database update
      return { success: true, id: input.id };
    })
});
