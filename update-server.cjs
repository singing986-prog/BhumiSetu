const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// We will replace the handlers to use query parameters
content = content.replace(
  'app.get("/api/kpis", (req, res) => {',
  `app.get("/api/kpis", (req, res) => {
    const state = req.query.state || "All States";
    const dist = req.query.district || "All Districts";
    const factor = state === "Delhi" ? 0.1 : state === "Maharashtra" ? 0.3 : state === "Tamil Nadu" ? 0.2 : 1;
    const isLocal = dist !== "All Districts";
    const f = isLocal ? factor * 0.1 : factor;
    
    res.json({
      areaNotified: Math.round(145210 * f).toLocaleString("en-IN") + " Ha",
      areaAcquired: Math.round(128500 * f).toLocaleString("en-IN") + " Ha",
      compensationAssessed: "₹" + Math.round(42450 * f).toLocaleString("en-IN") + " Cr",
      compensationDisbursed: "₹" + Math.round(39800 * f).toLocaleString("en-IN") + " Cr",
      familiesAffected: Math.round(34205 * f).toLocaleString("en-IN"),
      familiesRnR: Math.round(28450 * f).toLocaleString("en-IN")
    });
    return;`
);

content = content.replace(
  'app.get("/api/workflow", (req, res) => {',
  `// workflow handler already exists?`
);

// We need to add API endpoints for workflow and risk
content = content.replace(
  'app.get("/api/kpis", (req, res) => {',
  `app.get("/api/workflow", (req, res) => {
    const state = req.query.state || "All States";
    if (state === "Delhi") {
      res.json([
        { id: 1, name: "notification", status: "completed", date: "15 Sep 2025" },
        { id: 2, name: "declaration", status: "current", date: "Pending (Due: 12 Nov)" },
        { id: 3, name: "award", status: "pending", date: "-" },
        { id: 4, name: "compensation", status: "pending", date: "-" },
        { id: 5, name: "possession", status: "pending", date: "-" },
        { id: 6, name: "rnr", status: "pending", date: "-" },
      ]);
    } else {
      res.json([
        { id: 1, name: "notification", status: "completed", date: "12 Oct 2025" },
        { id: 2, name: "declaration", status: "completed", date: "05 Nov 2025" },
        { id: 3, name: "award", status: "current", date: "Pending (Due: 10 Dec)" },
        { id: 4, name: "compensation", status: "pending", date: "-" },
        { id: 5, name: "possession", status: "pending", date: "-" },
        { id: 6, name: "rnr", status: "pending", date: "-" },
      ]);
    }
  });

  app.get("/api/risk", (req, res) => {
    const state = req.query.state || "All States";
    if (state === "Delhi") {
      res.json([
        { level: "high", name: "Delhi Metro Phase 4 Ext." },
        { level: "medium", name: "Dwarka Expressway Link" },
        { level: "low", name: "Okhla Underpass" }
      ]);
    } else {
      res.json([
        { level: "high", name: "Western Dedicated Freight Corridor Phase 3" },
        { level: "medium", name: "Godavari Irrigation Canal Ext." },
        { level: "low", name: "Delhi-Dehradun Expressway" }
      ]);
    }
  });

  app.get("/api/kpis", (req, res) => {`
);

content = content.replace(
  'app.get("/api/alerts", (req, res) => {',
  `app.get("/api/alerts", (req, res) => {
    const state = req.query.state || "All States";
    const alerts = [
      { id: "ALT-001", type: "Lapse Risk", message: "Section 24(2) lapse risk: Award is 4.8 years old with pending possession for CBIC Node 2.", projectId: "PRJ-2026-003", projectName: "CBIC Node 2", timestamp: "2026-09-08T10:30:00Z", severity: "Critical", isRead: false },
      { id: "ALT-002", type: "SLA Breach", message: "Sec 19 Declaration delayed by 45 days beyond SIA clearance.", projectId: "PRJ-2026-002", projectName: "Pune-Nashik Semi High-Speed Rail", timestamp: "2026-09-08T08:15:00Z", severity: "Warning", isRead: false },
      { id: "ALT-003", type: "Approval Pending", message: "District LAO submitted compensation award for Nuh Expressway Phase.", projectId: "PRJ-2026-001", projectName: "Delhi-Mumbai Expressway", timestamp: "2026-09-07T16:45:00Z", severity: "Info", isRead: true },
    ];
    if (state === "Delhi") {
      res.json([{ id: "ALT-DEL-1", type: "SLA Breach", message: "Urban encroachment causing delay in Okhla Underpass.", projectId: "PRJ-2026-009", projectName: "Okhla Underpass", timestamp: "2026-09-08T11:00:00Z", severity: "Critical", isRead: false }]);
    } else {
      res.json(alerts);
    }
    return;`
);

fs.writeFileSync('server.ts', content);
