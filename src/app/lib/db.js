import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { LinksTable } from './schema';

// Get database connection - don't throw at module load time
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  return neon(process.env.DATABASE_URL);
}

// Initialize SQL client
const sql = process.env.DATABASE_URL ? getSql() : null;

// Initialize Drizzle with the Neon serverless client
const db = sql ? drizzle(sql) : null;

export async function helloWorld() {
  if (!sql) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add it to your .env.local file or set it in your Vercel environment variables.'
    );
  }
  
  const [dbResponse] = await sql`SELECT NOW();`;
  return dbResponse; }

  

    async function CheckLatency() {
      const start = new Date();
      const [dbResponse] = await sql`SELECT NOW();`;
      const dbNow = dbResponse && dbResponse.now ? dbResponse.now : ""
      const end = new Date();
      return{dbNow: dbNow, latency: Math.abs(end - start)};
    }

  

    async function configureDatabase() {
      const start = new Date();
      const [dbResponse] = await sql`CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"short" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);`;
    console.log("Db response for new table:", dbResponse);
    }

    configureDatabase().catch(error => {
      console.log('Error configuring database:', error);
      return {dbNow: "N/A", latency: "N/A"};
    });

   

export async function addLink(url) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  
  if (!sql || !db) {
    throw new Error('Database connection not available. Please check DATABASE_URL.');
  }
  
  try {
    const newlink = { url: url };
    const result = await db.insert(LinksTable).values(newlink).returning();
    
    if (!result || result.length === 0) {
      throw new Error('Failed to insert link - no result returned');
    }
    
    return result[0];
  } catch (error) {
    console.error('Database insert error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail
    });
    throw error;
  }
}