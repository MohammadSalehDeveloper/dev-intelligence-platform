export default async function Home() {

  const res = await fetch("http://localhost:4000/   ")

  const data = await res.json()

  return (
    <div>
      API Status: {data.status}
    </div>
  )
}