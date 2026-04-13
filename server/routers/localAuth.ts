import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";
import { createLocalUser, getLocalCredentialByEmail, getUserById } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "../../shared/const";

const BCRYPT_ROUNDS = 12;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

interface MinimalReq {
  protocol: string;
  headers: Record<string, string | string[] | undefined>;
}
interface MinimalRes {
  cookie: (name: string, value: string, options: object) => void;
}

async function issueSessionCookie(
  userId: number,
  res: MinimalRes,
  req: MinimalReq
) {
  const token = await new SignJWT({ sub: String(userId), type: "local" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());

  const forwardedProto = req.headers["x-forwarded-proto"];
  const isHttps =
    req.protocol === "https" ||
    (typeof forwardedProto === "string" && forwardedProto.includes("https"));

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isHttps,
    maxAge: 60 * 60 * 24 * 30,
  });
  return token;
}

export const localAuthRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(128, "Password too long"),
        name: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if email already registered
      const existing = await getLocalCredentialByEmail(input.email.toLowerCase());
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
      const { userId } = await createLocalUser(
        input.email.toLowerCase(),
        passwordHash,
        input.name
      );

      await issueSessionCookie(userId, ctx.res as unknown as MinimalRes, ctx.req as unknown as MinimalReq);

      const user = await getUserById(userId);
      return { success: true as const, user };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const credential = await getLocalCredentialByEmail(input.email.toLowerCase());
      if (!credential) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const valid = await bcrypt.compare(input.password, credential.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      await issueSessionCookie(credential.userId, ctx.res as unknown as MinimalRes, ctx.req as unknown as MinimalReq);

      const user = await getUserById(credential.userId);
      return { success: true as const, user };
    }),
});
