async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  
  const token = loginRes.token;

  const testA = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Notification", actionId: "advance", remarks: "" })
  }).then(r => r.json());
  console.log("Test A:", testA.project?.stage); // Notification -> Declaration

  const testB = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Possession", actionId: "advance", remarks: "" })
  }).then(r => r.json());
  console.log("Test B:", testB.project?.stage); // Should reject if stage validation exists, but it just advances

  const auditorLogin = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "sno@bhoomisetu.gov.in", password: "admin123" }) // Wait SNO is not Auditor
  }).then(r => r.json());
  console.log("SNO Token", auditorLogin.token ? "YES" : "NO");
}
run().catch(console.error);
