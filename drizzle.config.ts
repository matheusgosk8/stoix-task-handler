import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './src/migrations',
  schema: './src/config/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    user: 'postgres',
    url: process.env.DATABASE_URL!,
  },
});
