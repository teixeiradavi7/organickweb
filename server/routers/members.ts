import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, saveOnboardingResponses, getOnboardingResponses } from "../db";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../../drizzle/schema";

export const membersRouter = router({
  /**
   * Get member dashboard data (protected).
   * Returns user profile, onboarding status, and survey answers.
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Fetch survey answers for the diagnostic display
    let surveyAnswers: Record<string, string> | null = null;
    try {
      surveyAnswers = await getOnboardingResponses(ctx.user.id);
    } catch {
      // Survey data might not exist yet
    }

    return {
      userId: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      onboardingCompleted: ctx.user.onboardingCompleted,
      surveyAnswers,
    };
  }),

  /**
   * Complete onboarding survey.
   * Marks onboardingCompleted as true and stores survey answers.
   */
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        answers: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = drizzle(process.env.DATABASE_URL!);

      try {
        // Save survey responses
        await saveOnboardingResponses(ctx.user.id, input.answers);

        // Update user's onboarding status
        await db
          .update(users)
          .set({ onboardingCompleted: "true" })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true as const,
          message: "Onboarding completed successfully",
        };
      } catch (error) {
        console.error("[Onboarding] Failed to complete onboarding:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete onboarding",
        });
      }
    }),
});
