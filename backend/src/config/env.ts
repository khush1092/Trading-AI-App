import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required"
    })
    .min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string({
      required_error: "JWT_SECRET is required"
    })
    .min(1, "JWT_SECRET is required"),
  PORT: z.coerce
    .number({
      invalid_type_error: "PORT must be a number"
    })
    .int("PORT must be an integer")
    .positive("PORT must be greater than 0"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  DEFAULT_VIRTUAL_BALANCE: z.coerce.number().default(100000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedIssues = parsedEnv.error.issues
    .map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid backend environment configuration:\n${formattedIssues}`);
}

export const env = parsedEnv.data;
