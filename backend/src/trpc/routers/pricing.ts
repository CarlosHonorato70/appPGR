// backend/src/trpc/routers/pricing.ts
import { router, publicProcedure } from '../router';
import { z } from 'zod';
import { PricingCalculator } from '../../utils/calculations';

export const pricingRouter = router({
  calculateTechnicalHour: publicProcedure
    .input(z.object({
      fixedCosts: z.number(),
      proLabor: z.number(),
      productiveHours: z.number()
    }))
    .query(({ input }) => {
      const technicalHour = PricingCalculator.calculateTechnicalHour(
        input.fixedCosts,
        input.proLabor,
        input.productiveHours
      );

      return { technicalHour };
    }),

  calculateProposalItem: publicProcedure
    .input(z.object({
      basePrice: z.number(),
      estimatedHours: z.number(),
      taxRate: z.number(),
      adjustmentPersonalization: z.number().default(0),
      adjustmentRisk: z.number().default(0),
      adjustmentSeniority: z.number().default(0),
      volumeDiscount: z.number().default(0)
    }))
    .query(({ input }) => {
      const result = PricingCalculator.calculateProposalItem({
        basePrice: input.basePrice,
        estimatedHours: input.estimatedHours,
        taxRate: input.taxRate,
        adjustmentPersonalization: input.adjustmentPersonalization,
        adjustmentRisk: input.adjustmentRisk,
        adjustmentSeniority: input.adjustmentSeniority,
        volumeDiscount: input.volumeDiscount
      });

      return result;
    })
});
