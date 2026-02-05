import { neon } from '@neondatabase/serverless';

// Get database connection - lazy initialization for Vercel compatibility
let sql = null;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

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


await sql `CREATE TABLE "visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);`

await sql 
`ALTER TABLE "links" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE no action ON UPDATE no action;`
//console.log("Db response for new table:", dbResponse);
    }
    configureDatabase().catch(error => {
      console.log('Error configuring database:', error);
      return {dbNow: "N/A", latency: "N/A"};
    });

   

export async function addLink(url) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set. Please add it in Vercel project settings.');
  }
  
  try {
    // Get SQL client (lazy initialization)
    const db = getSql();
    
    // Use direct SQL insert - more reliable with Neon
    const result = await db`
      INSERT INTO links (url) 
      VALUES (${url}) 
      RETURNING id, url, short, created_at
    `;
    
    if (!result || result.length === 0) {
      throw new Error('Failed to insert link - no result returned');
    }
    
    return result[0];
  } catch (error) {
    console.error('Database insert error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      severity: error?.severity
    });
    
    // Provide helpful error messages
    if (error?.message?.includes('does not exist')) {
      throw new Error(
        'Table "links" does not exist. Please run: npx drizzle-kit push'
      );
    }
    
    if (error?.code) {
      // PostgreSQL error codes
      throw new Error(
        `Database error (${error.code}): ${error.message || error.detail || 'Unknown error'}`
      );
    }
    
    throw new Error(
      `Failed to insert link: ${error?.message || 'Unknown error'}`
    );
  }
}