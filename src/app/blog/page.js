import getDomain from "../lib/getDomain";

// fetch caching options - look up something and store it in memory

// force-cache is default - look up only once when been built and thats it 
// revalidate: 60 (60 seconds) - look up again after 60 seconds and store it in memory
// no store: will trigger it everytime blogpage is rendered
async function getData() {
  const domain = getDomain();
  const endpoint = `${domain}/api/posts`;
  const res = await fetch(endpoint);

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

  if (res.headers.get("Content-Type") !== "application/json") {
    return {items: []} }
  return res.json();
 
  
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