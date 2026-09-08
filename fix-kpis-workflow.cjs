const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Rewrite /api/kpis
content = content.replace(
  /app\.get\("\/api\/kpis", \([\s\S]*?\}\);/,
  `app.get("/api/kpis", (req, res) => {
    const projs = filterProjects(req.query);
    const totalArea = projs.reduce((sum, p) => sum + p.areaRequired, 0);
    const totalProjects = projs.length;
    const disbursed = totalProjects * 15.4;
    const pending = totalProjects * 4;
    const grievances = totalProjects * 120;
    
    res.json({
      activeProjects: totalProjects,
      areaAcquired: Math.round(totalArea * 0.4),
      compensationDisbursed: disbursed.toFixed(1),
      pendingAwards: pending,
      activeGrievances: grievances,
      slaBreaches: Math.round(totalProjects * 0.8)
    });
  });`
);

// Rewrite /api/workflow
content = content.replace(
  /app\.get\("\/api\/workflow", \([\s\S]*?\}\);/,
  `app.get("/api/workflow", (req, res) => {
    const projs = filterProjects(req.query);
    if (projs.length === 0) return res.json([]);
    
    // Aggregate or use the first project's data if a specific one is selected
    const p = projs[0];
    const stages = [
      { id: 1, name: "notification", status: p.stage === "Notification" ? "current" : "completed", date: p.dateSubmitted },
      { id: 2, name: "declaration", status: p.stage === "Declaration" ? "current" : (["Award", "Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "2026-03-15" },
      { id: 3, name: "award", status: p.stage === "Award" ? "current" : (["Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-06-15" },
      { id: 4, name: "compensation", status: p.stage === "Compensation" ? "current" : (["Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-08-01" },
      { id: 5, name: "possession", status: p.stage === "Possession" ? "current" : (p.stage === "R&R" ? "completed" : "pending"), date: "Pending · Due 2026-10-15" },
      { id: 6, name: "rnr", status: p.stage === "R&R" ? "current" : "pending", date: "Pending" }
    ];
    res.json(stages);
  });`
);

fs.writeFileSync('server.ts', content);
