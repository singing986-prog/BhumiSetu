import fs from 'fs';

async function run() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
  }).then(r => r.json());
  const token = loginRes.token;

  // Change one byte of the file
  let content = fs.readFileSync('uploads/DOC-001.pdf', 'utf8');
  content = content + " "; // Add space
  fs.writeFileSync('uploads/DOC-001.pdf', content);

  const docsRes = await fetch("http://localhost:3000/api/documents?project=PRJ-2026-001", {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json());
  
  const doc1 = docsRes.find(d => d.id === "DOC-001");
  console.log("Modified Doc 1 checksum:", doc1.checksum);
  console.log("Modified Doc 1 computed:", doc1.calculatedChecksum);
  console.log("Modified Doc 1 status:", doc1.verificationStatus);
}
run().catch(console.error);
