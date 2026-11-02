import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

// npm workspace scripts run with `server/` as the working directory, while
// this project keeps its development environment file at the repository root.
const localEnv = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../.env')]
  .find((file) => existsSync(file));
if (localEnv) config({ path: localEnv });

const EnvironmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-3.6-flash'),
  CASE_GENERATION_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  DEMO_MODE: z.enum(['true','false']).default('true')
});

const parsed = EnvironmentSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid server configuration:', parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '));
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  mongoUri: parsed.data.MONGODB_URI,
  geminiKey: parsed.data.GEMINI_API_KEY,
  geminiModel: parsed.data.GEMINI_MODEL,
  geminiFallbackModel: parsed.data.GEMINI_FALLBACK_MODEL,
  retries: parsed.data.CASE_GENERATION_MAX_RETRIES,
  demoMode: parsed.data.DEMO_MODE === 'true'
};
