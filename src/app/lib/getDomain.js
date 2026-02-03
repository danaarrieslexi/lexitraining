export default function getDomain() {
  // In Vercel, use VERCEL_URL (server-side) or construct from environment
  // For Server Components, prefer relative URLs, but if absolute is needed:
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Fallback - try NEXT_PUBLIC_VERCEL_URL if available
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "https" : "http";
    return `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // Last resort fallback
  return 'http://localhost:3000';
}
