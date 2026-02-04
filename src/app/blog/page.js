import { getPosts } from "../lib/posts";
import Blogcard from './card';
import { helloWorld } from '../lib/db';

//Make this page dynamic - don't try to pre-render at build time
export const dynamic = 'force-dynamic';

// Direct data fetching (recommended for Server Components)
// This avoids HTTP overhead and works reliably in Vercel
async function getData() {
  const posts = await getPosts();
  return { posts };
}

export default async function BlogPage() {
  const data = await getData();
  const dbHello = await helloWorld();
  console.log(dbHello);
  return (
    <main>
      <h1>Dana was here</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No data available</p>
      )}
    </main>
  );
}
export const runtime = 'edge'; //node.js -- whenever you use Neon
export const preferredRegion = 'iad1'; //use the closest region to the user


async function configureDatabase() {
  const dbConfig = await configureDatabase();
  console.log("Database configuration:", dbConfig);
}

configureDatabase().catch(error => {
  console.log('Error configuring database:', error);
});