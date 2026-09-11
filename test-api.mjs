
async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  
  const token = loginRes.token;
  
  console.log("Token received.");
  
  const riskRes1 = await fetch("http://localhost:3000/api/risk?project=PRJ-2026-001", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  console.log("Risk 1:", JSON.stringify(riskRes1));
  
  const riskRes2 = await fetch("http://localhost:3000/api/risk?project=PRJ-2026-001", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  console.log("Risk 2:", JSON.stringify(riskRes2));
  
  const wfExec = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Notification", actionId: "Test action", remarks: "Test" })
  }).then(r => r.json());
  
  console.log("Workflow Exec:", JSON.stringify(wfExec));
}

run().catch(console.error);
