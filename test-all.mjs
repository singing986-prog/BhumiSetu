import fs from 'fs';
import crypto from 'crypto';

async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  const token = loginRes.token;

  console.log("=== DOCUMENT TEST ===");
  const docsRes = await fetch("http://localhost:3000/api/documents?project=PRJ-2026-001", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  
  const doc1 = docsRes.find(d => d.id === "DOC-001");
  console.log("Doc 1 checksum:", doc1.checksum);
  console.log("Doc 1 computed:", doc1.calculatedChecksum);
  console.log("Doc 1 status:", doc1.verificationStatus);
  
  const doc3 = docsRes.find(d => d.id === "DOC-003");
  console.log("Doc 3 status:", doc3.verificationStatus);

  console.log("\n=== WORKFLOW TEST ===");
  const wf1 = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Notification", actionId: "ADVANCE_TO_DECLARATION", remarks: "" })
  });
  console.log("WF1 (Valid Action):", wf1.status, await wf1.text());

  const wf2 = await fetch("http://localhost:3000/api/workflow/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ projectId: "PRJ-2026-001", stage: "Declaration", actionId: "ADVANCE_TO_RNR", remarks: "" })
  });
  console.log("WF2 (Invalid Action for Stage):", wf2.status, await wf2.text());
}
run().catch(console.error);
