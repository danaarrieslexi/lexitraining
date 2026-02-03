import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  console.log('=== API ROUTE CALLED ===');
  
  // In Next.js 15+, params is a Promise and needs to be awaited
  const { slug } = await params;
  console.log('Slug extracted:', slug);
  
  if (!slug) {
    console.log('ERROR: Slug is missing!');
    return NextResponse.json({ error: 'Slug is missing' }, { status: 400 });
  }
  
  console.log('Returning response with slug:', slug);
  return NextResponse.json({ 
    message: 'Success!',
    slug: slug 
  }, { status: 200 });
}


