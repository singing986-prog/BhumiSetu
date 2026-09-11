async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  
  const token = loginRes.token;
  
  const parcelReq = await fetch("http://localhost:3000/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", geometry: { type: "Polygon", coordinates: [] }, area: 1.25 })
  }).then(r => r.json());
  
  console.log("Parcel Saved:", JSON.stringify(parcelReq));
}
run().catch(console.error);
