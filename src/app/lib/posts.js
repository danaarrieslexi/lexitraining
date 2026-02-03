// Shared data fetching function
export async function getPosts() {
  // In a real app, this would fetch from a database
  const posts = [
    { id: 1, slug: "my-first-post", title: "My First Post" },
    { id: 2, slug: "hello-world", title: "Hello World" },
    { id: 3, slug: "learning-nextjs", title: "Learning Next.js" },
  ];
  return posts;
}
