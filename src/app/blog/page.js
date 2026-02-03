import getDomain from "../lib/getDomain";
async function getData() {
  const domain = getDomain();
  const endpoint = `${domain}/api/posts`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
  return {items: []}
}


export default async function BlogPage() {
  const data = await getData();
  //console.log(data);
  return (
    <main>
      <h1>Dana was here</h1>
      {data && JSON.stringify(data)}
    </main>
  );
}