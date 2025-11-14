// backend/src/trpc/routers/risk-assessments.ts
import { router, publicProcedure } from '../router';
import { z } from 'zod';
import { db } from '../../database/connection';
import { riskAssessments } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '../../database/helpers';

export const riskAssessmentsRouter = router({
  listAssessments: publicProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(riskAssessments)
        .where(eq(riskAssessments.tenantId, input.tenantId))
        .orderBy(riskAssessments.createdAt);
      
      return result.map(row => ({
        ...row,
        psychosocialFactors: row.psychosocialFactors 
          ? JSON.parse(row.psychosocialFactors) 
          : null,
        recommendations: row.recommendations 
          ? JSON.parse(row.recommendations) 
          : []
      }));
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
      const assessmentId = generateId();
      
      await db.insert(riskAssessments).values({
        id: assessmentId,
        clientId: input.clientId,
        sector: input.sector,
        riskLevel: input.riskLevel,
        psychosocialFactors: input.psychosocialFactors || null,
        recommendations: input.recommendations || null,
        tenantId: input.tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        id: assessmentId,
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
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (input.riskLevel) updateData.riskLevel = input.riskLevel;
      if (input.psychosocialFactors !== undefined) {
        updateData.psychosocialFactors = input.psychosocialFactors;
      }
      if (input.recommendations !== undefined) {
        updateData.recommendations = input.recommendations;
      }

      await db
        .update(riskAssessments)
        .set(updateData)
        .where(eq(riskAssessments.id, input.id));
      
      return { success: true, id: input.id };
    })
});
