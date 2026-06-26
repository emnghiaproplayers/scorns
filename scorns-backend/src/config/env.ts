import * as dotenv from 'dotenv';
import { envSchema, type Env } from './env.schema';

// Load .env file
dotenv.config();

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Print every invalid/missing key, then refuse to boot
    console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}
