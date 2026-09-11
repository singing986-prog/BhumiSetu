async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "auditor@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  
  const token = loginRes.token;

  const res = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Notification", actionId: "advance", remarks: "" })
  });
  console.log("Auditor Execute:", res.status, await res.text());
}
run().catch(console.error);
