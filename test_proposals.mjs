import fetch from 'node-fetch'; 

async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "sno.up@bhoomisetu.gov.in", password: "admin123" }) // State Nodal UP
  }).then(r => r.json());
  
  const token = loginRes.token;

  console.log("=== CREATE PROPOSAL IN WRONG STATE (Should FAIL) ===");
  const createRes1 = await fetch("http://localhost:3000/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       projectName: "Test Proposal 123",
       ministry: "MoUD",
       category: "Urban Development",
       state: "Haryana", // Wrong state
       district: "Gurugram",
       areaRequired: 5.5,
       action: "save"
    })
  });
  console.log("Create Status:", createRes1.status, await createRes1.json());

  console.log("=== CREATE PROPOSAL IN WRONG DISTRICT (Should FAIL due to district not matching state) ===");
  const createRes2 = await fetch("http://localhost:3000/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       projectName: "Test Proposal 123",
       ministry: "MoUD",
       category: "Urban Development",
       state: "Uttar Pradesh", 
       district: "Gurugram", // Not in UP
       areaRequired: 5.5,
       action: "save"
    })
  });
  console.log("Create Status:", createRes2.status, await createRes2.json());


  console.log("=== CREATE PROPOSAL WITH INVALID CATEGORY (Should FAIL) ===");
  const createRes3 = await fetch("http://localhost:3000/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       projectName: "Test Proposal 123",
       ministry: "MoUD",
       category: "Space exploration", // Invalid
       state: "Uttar Pradesh", 
       district: "Lucknow", 
       areaRequired: 5.5,
       action: "save"
    })
  });
  console.log("Create Status:", createRes3.status, await createRes3.json());
}
run().catch(console.error);
