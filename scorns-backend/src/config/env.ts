import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { envSchema, type Env } from './env.schema';

// Load .env file
dotenv.config();

let cached: Env | null = null;

function writeEnvExample() {
  try {
    const shape = envSchema.shape;
    const lines: string[] = [];

    for (const key of Object.keys(shape)) {
      const field = shape[key as keyof typeof shape];
      let defaultValue = '';
      if (field instanceof z.ZodDefault) {
        const val = (field._def as any).defaultValue;
        defaultValue = typeof val === 'function' ? String(val()) : String(val);
      }
      lines.push(`${key}=${defaultValue}`);
    }

    const outputPath = path.join(process.cwd(), '.env.example');
    fs.writeFileSync(outputPath, lines.join('\n') + '\n');
  } catch (error) {
    console.error('Failed to generate .env.example:', error);
  }
}

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Print every invalid/missing key, then refuse to boot
    console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  // Freeze the config to make it immutable
  cached = Object.freeze(parsed.data);
  // Generate the .env.example dynamically from Zod Schema
  writeEnvExample();
  return cached;
}
