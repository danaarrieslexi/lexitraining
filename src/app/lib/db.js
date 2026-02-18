import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { desc,eq, sql as sqld, count} from 'drizzle-orm'; 
import * as schema from './schema';
import { getSessionUser } from './session';
import { LinksTable, VisitsTable, LinksTableRelations, VisitsTableRelations  } from './schema';

// Get database connection - lazy initialization for Vercel compatibility
let sql = null;
let db = null;
async function configureDatabase() {

sql`CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"short" varchar(50),
	"user_id" integer,
	"created_at" timestamp DEFAULT now()
);`
sql`CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now()
);`

sql`CREATE TABLE "visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);`

sql`ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "username_idx" ON "users" USING btree ("username");`
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

function getDb() {
  if (!db) {
    const connection = getSql();
    db = drizzle(connection, { schema: { LinksTable, VisitsTable, LinksTableRelations, VisitsTableRelations } });
  }
  return db;
}

export async function helloWorld() {
  const db = getSql();
  const [dbResponse] = await db`SELECT NOW();`;
  return dbResponse;
}

  

async function CheckLatency() {
  const start = new Date();
  const db = getSql();
  const [dbResponse] = await db`SELECT NOW();`;
  const dbNow = dbResponse && dbResponse.now ? dbResponse.now : ""
  const end = new Date();
  return {dbNow: dbNow, latency: Math.abs(end - start)};
}

  

// Removed configureDatabase - tables should be created via migrations (drizzle-kit)
// If you need to manually create tables, use: pnpm run db:push

export async function getLinks(limit, offset) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
  // Use raw SQL for Edge Runtime compatibility
  const db = getSql();
  return await db`
    SELECT id, url, short, created_at, userId 
    FROM links 
    ORDER BY created_at DESC
    LIMIT ${lookupLimit} OFFSET ${lookupOffset}
  `;
}

export async function getShortLinkRecord(shortSlugValue) {
  try {
    // Use raw SQL for Edge Runtime compatibility
    const db = getSql();
    const result = await db`
      SELECT id, url, short, created_at 
      FROM links 
      WHERE short = ${shortSlugValue}
      LIMIT 1
    `;
    console.log('Database query result for short:', shortSlugValue, 'Result:', result);
    return result;
  } catch (error) {
    console.error('Error in getShortLinkRecord:', error);
    throw error;
  }
}

export async function saveLinkVisit(linkIdValue) {
  const database = getDb();
  return await database.insert(VisitsTable).values({linkId: linkIdValue})
}

// Generate a random short code
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  // Use a simple random generator that works in Edge Runtime
  for (let i = 0; i < length; i++) {
    // Use Date.now() and Math.random() for Edge Runtime compatibility
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

// Check if a short code already exists
async function shortCodeExists(shortCode) {
  try {
    // Use raw SQL for Edge Runtime compatibility
    const db = getSql();
    const result = await db`
      SELECT id FROM links WHERE short = ${shortCode} LIMIT 1
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Error checking short code:', error);
    // If there's an error, assume it doesn't exist to avoid blocking
    return false;
  }
}

// Generate a unique short code
async function generateUniqueShortCode(length = 6, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateShortCode(length);
    const exists = await shortCodeExists(code);
    if (!exists) {
      return code;
    }
  }
  // If we can't find a unique code after max attempts, try with a longer code
  return generateShortCode(length + 2);
}

export async function addLink(url, shortCode = null) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set. Please add it in Vercel project settings.');
  }

  try {
    // Generate a short code if one wasn't provided
    if (!shortCode) {
      shortCode = await generateUniqueShortCode();
      console.log('Generated short code:', shortCode);
    } else {
      // Check if the provided short code already exists
      const exists = await shortCodeExists(shortCode);
      if (exists) {
        throw new Error(`Short code "${shortCode}" already exists. Please choose a different one.`);
      }
    }

    // Get SQL client (lazy initialization)
    const db = getSql();
    
    // Use direct SQL insert - more reliable with Neon
    const result = await db`
      INSERT INTO links (url, short) 
      VALUES (${url}, ${shortCode}) 
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

export async function getMinLinks(limit, offset, sessionUser = null) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
  // Use raw SQL for Edge Runtime compatibility
  const db = getSql();
  // userId doesn't exist in schema, so we'll get all links
  return await db`
    SELECT id, url, created_at as timestamp
    FROM links 
    ORDER BY created_at DESC
    LIMIT ${lookupLimit} OFFSET ${lookupOffset}
  `;
}

export async function getMinLinksAndVisits(limit, offset, sessionUser = null) {
  const lookupLimit = limit ? limit : 10
  const lookupOffset = offset ? offset : 0
  // Use raw SQL for Edge Runtime compatibility
  const db = getSql();
  
  // Get links first - userId doesn't exist in schema, so we'll get all links
  const links = await db`
    SELECT id, url, short, created_at as "createdAt"
    FROM links 
    ORDER BY created_at DESC
    LIMIT ${lookupLimit} OFFSET ${lookupOffset}
  `;
  
  // Get visits for each link
  const linksWithVisits = await Promise.all(
    links.map(async (link) => {
      // Get visits for this link
      const visits = await db`
        SELECT created_at as "createdAt"
        FROM visits 
        WHERE link_id = ${link.id}
      `;
      
      // Get visit count
      const [visitCount] = await db`
        SELECT COUNT(*) as count
        FROM visits 
        WHERE link_id = ${link.id}
      `;
      
      return {
        ...link,
        visits,
        visitCount: visitCount?.count || 0
      };
    })
  );
  
  return linksWithVisits;
}