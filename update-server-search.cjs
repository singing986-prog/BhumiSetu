const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Add projects endpoint for dropdown
content = content.replace(
  'app.get("/api/proposals", (req, res) => {',
  `app.get("/api/projects", (req, res) => {
    const state = req.query.state || "All States";
    const district = req.query.district || "All Districts";
    let projs = mockProposals;
    if (state !== "All States") {
      projs = projs.filter(p => p.state === state || state === "Delhi");
    }
    if (district !== "All Districts") {
      projs = projs.filter(p => p.district === district || state === "Delhi");
    }
    res.json(projs.map(p => ({ id: p.id, name: p.projectName })));
  });

  app.get("/api/proposals", (req, res) => {`
);

// Add search endpoint
content = content.replace(
  'app.get("/api/alerts", (req, res) => {',
  `app.get("/api/search", (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : "";
    if (!q) return res.json([]);
    
    const results = [];
    if ("06122344556677".includes(q) || "khedki".includes(q)) {
      results.push({ type: "Parcel", id: "06122344556677", name: "Gram Panchayat, Khedki", detail: "Haryana • Nuh" });
    }
    if ("delhi-mumbai expressway".includes(q) || "prj-2026-001".includes(q)) {
      results.push({ type: "Project", id: "PRJ-2026-001", name: "Delhi-Mumbai Expressway (Phase 4)", detail: "Haryana • Nuh" });
    }
    if (results.length === 0) {
      results.push({ type: "Project", id: "PRJ-MOCK", name: \`Result for \${q}\`, detail: "Mock Data" });
    }
    res.json(results);
  });

  app.get("/api/alerts", (req, res) => {`
);

fs.writeFileSync('server.ts', content);
