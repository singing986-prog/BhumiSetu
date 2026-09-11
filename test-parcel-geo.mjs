async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  
  const token = loginRes.token;
  
  const geometry = {
    type: "Polygon",
    coordinates: [[
      [77.017, 28.124],
      [77.019, 28.124],
      [77.019, 28.126],
      [77.017, 28.126],
      [77.017, 28.124]
    ]]
  };

  const parcelReq = await fetch("http://localhost:3000/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", geometry: geometry, area: 1.25 })
  }).then(r => r.json());
  
  console.log("Parcel Saved:", JSON.stringify(parcelReq));
  
  const getReq = await fetch("http://localhost:3000/api/parcels?project=PRJ-2026-001", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  
  const lastParcel = getReq[getReq.length - 1];
  console.log("Retrieved Parcel ID:", lastParcel.parcelId);
  console.log("Retrieved Geometry:", JSON.stringify(lastParcel.geometry));
}
run().catch(console.error);
