import { neon } from '@neondatabase/serverless';

// Initialize SQL client only if DATABASE_URL is available
let sql = null;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
}

export async function helloWorld() {
  if (!sql) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add it to your .env.local file or set it in your Vercel environment variables.'
    );
  }
  
  const [dbResponse] = await sql`SELECT NOW();`;
  return dbResponse;
}