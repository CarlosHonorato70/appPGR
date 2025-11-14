// backend/src/trpc/router.ts
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Import routers
import { pricingRouter } from './routers/pricing';
import { proposalsRouter } from './routers/proposals';
import { riskAssessmentsRouter } from './routers/risk-assessments';
import { authRouter } from './routers/auth';

export const appRouter = router({
  auth: authRouter,
  pricing: pricingRouter,
  proposals: proposalsRouter,
  riskAssessments: riskAssessmentsRouter
});

export type AppRouter = typeof appRouter;
