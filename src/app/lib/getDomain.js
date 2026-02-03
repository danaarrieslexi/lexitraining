export default function getDomain() {
  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV === 
    "production" ? "https" : "http";
  
  // Get the domain URL - use Vercel's URL if available, otherwise use localhost
  const domain = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? process.env.NEXT_PUBLIC_VERCEL_URL 
    : "localhost:3000";
  
  // Combine protocol and domain to create the full URL
  return `${protocol}://${domain}`;
}
