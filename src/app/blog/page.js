import { getPosts } from "../lib/posts";
import Blogcard from './card'
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
  //console.log(data);
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