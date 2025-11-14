// backend/src/trpc/routers/proposals.ts
import { router, publicProcedure } from '../router';
import { z } from 'zod';
import { db } from '../../database/connection';
import { proposals, proposalItems } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { generateId, toNumber } from '../../database/helpers';

export const proposalsRouter = router({
  listProposals: publicProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: proposals.id,
          clientId: proposals.clientId,
          title: proposals.title,
          status: proposals.status,
          totalValue: proposals.totalValue,
          tenantId: proposals.tenantId
        })
        .from(proposals)
        .where(eq(proposals.tenantId, input.tenantId))
        .orderBy(proposals.createdAt);

      return result.map(row => ({
        ...row,
        totalValue: toNumber(row.totalValue)
      }));
    }),

  getProposalById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [proposal] = await db
        .select()
        .from(proposals)
        .where(eq(proposals.id, input.id))
        .limit(1);

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      const items = await db
        .select()
        .from(proposalItems)
        .where(eq(proposalItems.proposalId, input.id));

      return {
        ...proposal,
        totalValue: toNumber(proposal.totalValue),
        discountGeneral: toNumber(proposal.discountGeneral),
        displacementFee: toNumber(proposal.displacementFee),
        items: items.map(item => ({
          ...item,
          unitPrice: toNumber(item.unitPrice),
          totalValue: toNumber(item.totalValue),
          adjustmentPersonalization: toNumber(item.adjustmentPersonalization),
          adjustmentRisk: toNumber(item.adjustmentRisk),
          adjustmentSeniority: toNumber(item.adjustmentSeniority),
          volumeDiscount: toNumber(item.volumeDiscount)
        }))
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

      // Insert proposal
      const proposalId = generateId();
      await db.insert(proposals).values({
        id: proposalId,
        tenantId: input.tenantId,
        clientId: input.clientId,
        title: input.title,
        description: input.description,
        status: 'draft',
        totalValue: finalTotal.toString(),
        discountGeneral: input.discountGeneral.toString(),
        displacementFee: input.displacementFee.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Insert proposal items
      for (const item of input.items) {
        const itemTotal = item.unitPrice * item.quantity;
        await db.insert(proposalItems).values({
          id: generateId(),
          proposalId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          totalValue: itemTotal.toString(),
          adjustmentPersonalization: item.adjustmentPersonalization.toString(),
          adjustmentRisk: item.adjustmentRisk.toString(),
          adjustmentSeniority: item.adjustmentSeniority.toString(),
          volumeDiscount: item.volumeDiscount.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return {
        id: proposalId,
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
