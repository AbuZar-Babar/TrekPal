import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variables validation schema
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  // Make DATABASE_URL optional in development for easier setup
  DATABASE_URL: z.string().url().optional(),
  // Make JWT_SECRET optional in development (will use a default)
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // Firebase is optional in development
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

/**
 * Validated environment variables with defaults for development
 */
const parsedEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

// Provide defaults for development mode
const defaultDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/trekpal?schema=public';
const defaultJwtSecret = 'development-jwt-secret-key-minimum-32-characters-long-for-local-testing-only';

export const env = {
  ...parsedEnv,
  DATABASE_URL: parsedEnv.DATABASE_URL || (parsedEnv.NODE_ENV === 'development' 
    ? defaultDatabaseUrl
    : (() => { throw new Error('DATABASE_URL is required'); })()),
  JWT_SECRET: parsedEnv.JWT_SECRET || (parsedEnv.NODE_ENV === 'development'
    ? defaultJwtSecret
    : (() => { throw new Error('JWT_SECRET is required'); })()),
} as {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_PRIVATE_KEY?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_STORAGE_BUCKET?: string;
  CORS_ORIGIN: string;
};

// Validate required fields in production
if (env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

// Warn in development if using defaults
if (env.NODE_ENV === 'development') {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set, using default: postgresql://postgres:postgres@localhost:5432/trekpal');
    console.warn('⚠️  Make sure PostgreSQL is running and the database "trekpal" exists');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not set, using development default (not secure for production)');
  }
}

