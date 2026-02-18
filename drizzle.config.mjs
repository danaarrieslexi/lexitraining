// Note: drizzle-kit has issues loading .env files in ES modules
// Use drizzle.config.js instead, or export DATABASE_URL before running:
// export DATABASE_URL="your-connection-string" && pnpm run db:migrate

/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/app/lib/schema.js',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
