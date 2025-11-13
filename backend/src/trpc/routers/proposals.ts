// backend/src/trpc/routers/proposals.ts
import { router, publicProcedure } from '../router';
import { z } from 'zod';

export const proposalsRouter = router({
  listProposals: publicProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      // Mock data for now - will be replaced with actual database queries
      return [
        {
          id: 'prop-1',
          clientId: 'client-1',
          title: 'Proposta de Consultoria',
          status: 'draft',
          totalValue: 15000,
          tenantId: input.tenantId
        }
      ];
    }),

  getProposalById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Mock data - will be replaced with database query
      return {
        id: input.id,
        clientId: 'client-1',
        title: 'Proposta de Consultoria',
        description: 'Consultoria em segurança do trabalho',
        status: 'draft',
        totalValue: 15000,
        items: []
      };
    }),

  createProposal: publicProcedure
    .input(z.object({
      clientId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      tenantId: z.string(),
      items: z.array(z.object({
        serviceId: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        adjustmentPersonalization: z.number().default(0),
        adjustmentRisk: z.number().default(0),
        adjustmentSeniority: z.number().default(0),
        volumeDiscount: z.number().default(0)
      })),
      discountGeneral: z.number().default(0),
      displacementFee: z.number().default(0)
    }))
    .mutation(async ({ input }) => {
      // Calculate total value
      let totalValue = 0;
      for (const item of input.items) {
        const itemTotal = item.unitPrice * item.quantity;
        totalValue += itemTotal;
      }

      const finalTotal = totalValue - input.discountGeneral + input.displacementFee;

      // Mock response - will be replaced with database insert
      return {
        id: `prop-${Date.now()}`,
        totalValue: finalTotal
      };
    }),

  updateProposalStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['draft', 'sent', 'approved', 'rejected', 'archived'])
    }))
    .mutation(async ({ input }) => {
      // Mock response - will be replaced with database update
      return { success: true, id: input.id, status: input.status };
    })
});
