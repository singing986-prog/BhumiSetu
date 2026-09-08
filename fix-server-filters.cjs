const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace mock proposals with a bigger set and better filter logic
const mockProposalsSetup = `
  let mockProposals = [
    {
      id: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway (Phase 4)", ministry: "MoRTH", category: "Highway", state: "Haryana", district: "Nuh",
      status: "Approved", dateSubmitted: "2025-11-12", areaRequired: 450.5, stage: "Notification", riskProfile: { level: "Low", score: 12, factors: ["Favorable historical state timeline", "Low objection count (12)"] }
    },
    {
      id: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", ministry: "Ministry of Railways", category: "Rail", state: "Maharashtra", district: "Pune",
      status: "Under Scrutiny", dateSubmitted: "2026-01-05", areaRequired: 120.0, stage: "Declaration", riskProfile: { level: "High", score: 84, factors: ["High historical district delay rate (68%)", "Urban density delays", "High objection volume (450+)"] }
    },
    {
      id: "PRJ-2026-003", projectName: "Chennai-Bengaluru Industrial Corridor (Node 2)", ministry: "DPIIT", category: "Industrial Corridor", state: "Tamil Nadu", district: "Kanchipuram",
      status: "Under Scrutiny", dateSubmitted: "2025-08-20", areaRequired: 315.2, stage: "Award", riskProfile: { level: "Medium", score: 45, factors: ["Approaching Sec 19 Declaration SLA", "Moderate objection count (142)"] }
    },
    {
      id: "PRJ-2026-004", projectName: "Kalyan Tollway Expansion", ministry: "MoRTH", category: "Highway", state: "Maharashtra", district: "Thane",
      status: "Approved", dateSubmitted: "2024-05-10", areaRequired: 80.0, stage: "Compensation", riskProfile: { level: "Low", score: 20, factors: ["Funds disbursed", "Minimal objections"] }
    },
    {
      id: "PRJ-2026-005", projectName: "Okhla Underpass", ministry: "MoUD", category: "Urban Development", state: "Delhi", district: "South Delhi",
      status: "Delayed", dateSubmitted: "2025-10-01", areaRequired: 15.0, stage: "Possession", riskProfile: { level: "High", score: 90, factors: ["Urban encroachment", "Court stay on possession"] }
    }
  ];

  app.get("/api/locations", (req, res) => {
    // Generate state/district hierarchy from projects
    const states = {};
    states["All States"] = ["All Districts"];
    mockProposals.forEach(p => {
      if (!states[p.state]) states[p.state] = ["All Districts"];
      if (!states[p.state].includes(p.district)) states[p.state].push(p.district);
    });
    // Add some fallbacks just in case
    if (!states["Delhi"]) states["Delhi"] = ["All Districts", "New Delhi", "South Delhi"];
    if (!states["Haryana"]) states["Haryana"] = ["All Districts", "Nuh", "Gurugram"];
    res.json(states);
  });
`;

content = content.replace(/let mockProposals = \[[\s\S]*?\}\n  \];/, mockProposalsSetup.trim());

const projectFilterEndpoint = `
  app.get("/api/projects", (req, res) => {
    const { state, district, stage, category, risk } = req.query;
    let projs = mockProposals;
    
    if (state && state !== "All States") projs = projs.filter(p => p.state === state);
    if (district && district !== "All Districts") projs = projs.filter(p => p.district === district);
    if (stage && stage !== "All Stages") projs = projs.filter(p => p.stage === stage);
    if (category && category !== "All Categories") projs = projs.filter(p => p.category === category);
    if (risk && risk !== "All Risks") projs = projs.filter(p => p.riskProfile.level === risk);

    res.json(projs.map(p => ({ id: p.id, name: p.projectName })));
  });
`;

content = content.replace(/app\.get\("\/api\/projects", \([\s\S]*?\}\);/, projectFilterEndpoint.trim());

fs.writeFileSync('server.ts', content);
