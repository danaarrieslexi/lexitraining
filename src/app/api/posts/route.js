import { NextResponse } from "next/server";

export async function GET() {
  // This endpoint returns a list of posts
  const posts = [
    { id: 1, slug: "my-first-post", title: "My First Post" },
    { id: 2, slug: "hello-world", title: "Hello World" },
    { id: 3, slug: "learning-nextjs", title: "Learning Next.js" },
  ];

  return NextResponse.json({ posts }, { status: 200 });
}
