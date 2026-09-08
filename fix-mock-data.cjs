const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /let mockProposals = \[([\s\S]*?)\];/;
const match = content.match(regex);
if (match) {
  const newProposalsStr = `
    {
      id: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway (Phase 4)", ministry: "MoRTH", category: "Highway", state: "Haryana", district: "Nuh",
      status: "Approved", dateSubmitted: "2025-11-12", areaRequired: 450.5, areaNotified: 450.5, areaAcquired: 180.2, compensationAssessed: 675.7, compensationPaid: 360.4, familiesAffected: 900, rrSettled: 540, stage: "Notification", riskProfile: { level: "Low", score: 12, factors: ["Favorable historical state timeline", "Low objection count (12)"] }
    },
    {
      id: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", ministry: "Ministry of Railways", category: "Rail", state: "Maharashtra", district: "Pune",
      status: "Under Scrutiny", dateSubmitted: "2026-01-05", areaRequired: 120.0, areaNotified: 120.0, areaAcquired: 48.0, compensationAssessed: 180.0, compensationPaid: 96.0, familiesAffected: 240, rrSettled: 144, stage: "Declaration", riskProfile: { level: "High", score: 84, factors: ["High historical district delay rate (68%)", "Urban density delays", "High objection volume (450+)"] }
    },
    {
      id: "PRJ-2026-003", projectName: "Chennai-Bengaluru Industrial Corridor (Node 2)", ministry: "DPIIT", category: "Industrial Corridor", state: "Tamil Nadu", district: "Kanchipuram",
      status: "Under Scrutiny", dateSubmitted: "2025-08-20", areaRequired: 315.2, areaNotified: 315.2, areaAcquired: 126.1, compensationAssessed: 472.8, compensationPaid: 252.1, familiesAffected: 630, rrSettled: 378, stage: "Award", riskProfile: { level: "Medium", score: 45, factors: ["Approaching Sec 19 Declaration SLA", "Moderate objection count (142)"] }
    },
    {
      id: "PRJ-2026-004", projectName: "Kalyan Tollway Expansion", ministry: "MoRTH", category: "Highway", state: "Maharashtra", district: "Thane",
      status: "Approved", dateSubmitted: "2024-05-10", areaRequired: 80.0, areaNotified: 80.0, areaAcquired: 32.0, compensationAssessed: 120.0, compensationPaid: 64.0, familiesAffected: 160, rrSettled: 96, stage: "Compensation", riskProfile: { level: "Low", score: 20, factors: ["Funds disbursed", "Minimal objections"] }
    },
    {
      id: "PRJ-2026-005", projectName: "Okhla Underpass", ministry: "MoUD", category: "Urban Development", state: "Delhi", district: "South Delhi",
      status: "Delayed", dateSubmitted: "2025-10-01", areaRequired: 15.0, areaNotified: 15.0, areaAcquired: 6.0, compensationAssessed: 22.5, compensationPaid: 12.0, familiesAffected: 30, rrSettled: 18, stage: "Possession", riskProfile: { level: "High", score: 90, factors: ["Urban encroachment", "Court stay on possession"] }
    }
  `;
  content = content.replace(match[0], 'let mockProposals = [' + newProposalsStr + '];');
}

const kpiRegex = /app\.get\("\/api\/kpis", \(req, res\) => \{[\s\S]*?\}\);/;
const kpiMatch = content.match(kpiRegex);
if (kpiMatch) {
  const newKpiEndpoint = `
  app.get("/api/kpis", (req, res) => {
    const projs = filterProjects(req.query);
    
    let areaNotified = 0;
    let areaAcquired = 0;
    let compensationAssessed = 0;
    let compensationPaid = 0;
    let familiesAffected = 0;
    let rrSettled = 0;
    
    projs.forEach(p => {
      areaNotified += p.areaNotified || 0;
      areaAcquired += p.areaAcquired || 0;
      compensationAssessed += p.compensationAssessed || 0;
      compensationPaid += p.compensationPaid || 0;
      familiesAffected += p.familiesAffected || 0;
      rrSettled += p.rrSettled || 0;
    });

    res.json({
      areaNotified: Number(areaNotified.toFixed(1)),
      areaAcquired: Number(areaAcquired.toFixed(1)),
      compensationAssessed: Number(compensationAssessed.toFixed(1)),
      compensationDisbursed: Number(compensationPaid.toFixed(1)),
      familiesAffected: Math.floor(familiesAffected),
      familiesRnR: Math.floor(rrSettled),
      activeProjects: projs.length
    });
  });`;
  content = content.replace(kpiMatch[0], newKpiEndpoint.trim());
}

fs.writeFileSync('server.ts', content);
