import { headers } from "next/headers";

// Make this page dynamic - don't try to pre-render at build time
export const dynamic = 'force-dynamic';

// fetch caching options - look up something and store it in memory

// force-cache is default - look up only once when been built and thats it 
// revalidate: 60 (60 seconds) - look up again after 60 seconds and store it in memory
// no store: will trigger it everytime blogpage is rendered
async function getData() {
  try {
    // Get the host from request headers - most reliable in Vercel
    const headersList = headers();
    const host = headersList.get('host') || headersList.get('x-forwarded-host');
    const protocol = process.env.VERCEL_URL ? 'https' : (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    
    // Build the endpoint URL
    let baseUrl;
    if (process.env.VERCEL_URL) {
      // Use VERCEL_URL in Vercel deployments
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (host) {
      // Use host from headers
      baseUrl = `${protocol}://${host}`;
    } else {
      // Fallback to localhost
      baseUrl = 'http://localhost:3000';
    }
    
    const endpoint = `${baseUrl}/api/posts`;
    
    console.log('Fetching from:', endpoint);
    
    const res = await fetch(endpoint, {
      cache: 'no-store' // Always fetch fresh data
    });

    console.log('Response status:', res.status, res.statusText);

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("Content-Type");
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      console.warn('Response is not JSON, returning empty items');
      return { items: [] };
    }
    
    const data = await res.json();
    console.log('Fetched data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    // Return empty data instead of throwing to prevent Server Component errors
    return { items: [] };
  }
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