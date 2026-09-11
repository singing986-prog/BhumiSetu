const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

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
       projectName: "Test Proposal Doc 123",
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

  fs.writeFileSync('testdoc.pdf', 'dummy pdf content for sha256 test');

  console.log("=== UPLOAD DOC ===");
  const formData = new FormData();
  formData.append('file', fs.createReadStream('testdoc.pdf'));
  
  const docRes = await fetch(`http://localhost:3000/api/proposals/${pid}/documents`, {
    method: "POST",
    headers: { 
        "Authorization": `Bearer ${token}`,
        ...formData.getHeaders()
    },
    body: formData
  });
  
  console.log("Doc Status:", docRes.status, await docRes.json());
}
run().catch(console.error);
