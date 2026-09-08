const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const profileEndpoints = `
  let userProfile = { name: "Ramesh Kumar", email: "ramesh.k@bhoomisetu.gov.in", role: "District LAO", district: "New Delhi", notifEmail: true, notifSms: true };
  let currentPasswordHash = "dummyhash";

  app.get("/api/profile", (req, res) => {
    res.json(userProfile);
  });

  app.post("/api/profile", (req, res) => {
    const { name, email, notifEmail, notifSms } = req.body;
    if (name) userProfile.name = name;
    if (email) userProfile.email = email;
    if (notifEmail !== undefined) userProfile.notifEmail = notifEmail;
    if (notifSms !== undefined) userProfile.notifSms = notifSms;
    res.json(userProfile);
  });

  app.post("/api/password", (req, res) => {
    const { current, newPass } = req.body;
    // In a real app, verify hash. Here we just mock verify.
    if (!current || !newPass) return res.status(400).json({ error: "Missing fields" });
    if (current === newPass) return res.status(400).json({ error: "New password must be different" });
    if (newPass.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    // Mocking that any current password except "wrong" works for demo purposes, since we don't have login session yet
    if (current === "wrong") return res.status(401).json({ error: "Incorrect current password" });
    
    currentPasswordHash = newPass; // mock update
    res.json({ success: true });
  });
`;

content = content.replace('app.get("/api/projects"', profileEndpoints + '\n  app.get("/api/projects"');
fs.writeFileSync('server.ts', content);
