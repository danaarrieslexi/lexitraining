async function getData() {
  // const endpoint = "http://localhost:3000/api/posts";
  // const res = await fetch(endpoint);

  // if (!res.ok) {
  //   throw new Error("Failed to fetch data");
  // }
  // return res.json();
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