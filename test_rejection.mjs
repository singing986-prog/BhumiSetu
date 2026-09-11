import fetch from 'node-fetch'; 

async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" }) // Super admin
  }).then(r => r.json());
  
  const token = loginRes.token;

  console.log("=== CREATE PROPOSAL ===");
  const createRes = await fetch("http://localhost:3000/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       projectName: "Test Proposal 999",
       ministry: "MoUD",
       category: "Urban Development",
       state: "Haryana", 
       district: "Gurugram",
       areaRequired: 5.5,
       action: "submit"
    })
  });
  const created = await createRes.json();
  console.log("Create Status:", createRes.status, created);
  if(!created.proposal) return;
  
  const pid = created.proposal.id;

  console.log("=== REJECT WITH BLANK REMARKS ===");
  const rejectRes1 = await fetch(`http://localhost:3000/api/proposals/${pid}/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       actionId: "REJECT",
       remarks: "   "
    })
  });
  console.log("Reject 1 Status:", rejectRes1.status, await rejectRes1.json());

  console.log("=== REJECT WITH VALID REMARKS ===");
  const rejectRes2 = await fetch(`http://localhost:3000/api/proposals/${pid}/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       actionId: "REJECT",
       remarks: "Not feasible due to cost"
    })
  });
  console.log("Reject 2 Status:", rejectRes2.status, await rejectRes2.json());
}
run().catch(console.error);
