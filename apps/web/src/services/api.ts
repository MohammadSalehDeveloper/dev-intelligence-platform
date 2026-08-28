export async function getHealth() {

  const res = await fetch("http://localhost:4000/health")

  return res.json()
}