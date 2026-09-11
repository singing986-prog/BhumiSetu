import fs from 'fs';

async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  const token = loginRes.token;

  // Let's create a new project or reset one
  // PRJ-2026-001 is now in Declaration from the previous script

  const wf = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    // Frontend sends 'stage: "Possession"' but backend is in "Declaration"
    // Action 'ADVANCE_TO_RNR' is valid for Possession but NOT for Declaration
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Possession", actionId: "ADVANCE_TO_RNR", remarks: "" })
  });
  console.log("Fake Stage Test:", wf.status, await wf.text());
}
run().catch(console.error);
