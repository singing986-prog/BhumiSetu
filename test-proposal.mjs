import fetch from 'node-fetch'; // although fetch is global in Node 22

async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  
  const token = loginRes.token;

  console.log("=== CREATE PROPOSAL ===");
  const createRes = await fetch("http://localhost:3000/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       projectName: "Test Proposal 123",
       ministry: "MoUD",
       category: "Urban Development",
       state: "Haryana",
       district: "Gurugram",
       areaRequired: 5.5,
       action: "save"
    })
  });
  const created = await createRes.json();
  console.log("Create Status:", createRes.status, created);

  if (!created.proposal) return;
  const propId = created.proposal.id;

  console.log("\n=== SUBMIT PROPOSAL ===");
  const submitRes = await fetch(`http://localhost:3000/api/proposals/${propId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ action: "submit" })
  });
  console.log("Submit Status:", submitRes.status, await submitRes.json());

  console.log("\n=== RAISE QUERY ===");
  const queryRes = await fetch(`http://localhost:3000/api/proposals/${propId}/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ actionId: "RAISE_QUERY", remarks: "Please provide alignment map" })
  });
  console.log("Query Status:", queryRes.status, await queryRes.json());
}
run().catch(console.error);
