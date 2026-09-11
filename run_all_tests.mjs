import fetch from 'node-fetch';

async function run() {
  console.log("=== LOGGING IN AS SUPER ADMIN ===");
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
       projectName: "Test Complete Proposal 404",
       ministry: "MoUD",
       category: "Urban Development",
       state: "Haryana", 
       district: "Gurugram",
       areaRequired: 5.5,
       action: "submit"
    })
  });
  const created = await createRes.json();
  console.log("Create Status:", createRes.status, created.success ? "SUCCESS" : created);
  if(!created.proposal) return;
  const pid = created.proposal.id;

  console.log("=== RAISE QUERY ===");
  const queryRes = await fetch(`http://localhost:3000/api/proposals/${pid}/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       actionId: "RAISE_QUERY",
       remarks: "Please attach geojson footprint"
    })
  });
  console.log("Query Status:", queryRes.status, (await queryRes.json()).success ? "SUCCESS" : "FAIL");

  console.log("=== APPROVE ===");
  const approveRes = await fetch(`http://localhost:3000/api/proposals/${pid}/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
       actionId: "APPROVE",
       remarks: "All good"
    })
  });
  console.log("Approve Status:", approveRes.status, (await approveRes.json()).success ? "SUCCESS" : "FAIL");

  console.log("=== GET NOTIFICATIONS ===");
  const notifRes = await fetch("http://localhost:3000/api/notifications", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const notifs = await notifRes.json();
  console.log("Notifications Count:", notifs.length);
  if(notifs.length > 0) {
      console.log("Latest:", notifs[0].title, "-", notifs[0].message);
  }
}
run().catch(console.error);
