/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/app/lib/schema.js',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
