const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The `server.ts` routes: /api/kpis, /api/risk, /api/workflow, /api/parcels need to be filtered

// For /api/kpis:
content = content.replace(
  'app.get("/api/kpis", (req, res) => {',
  `app.get("/api/kpis", (req, res) => {
    const { state, district, project, stage, category, risk } = req.query;
    let baseArea = 2450.8;
    if (state !== "All States" && state) baseArea = 1200;
    if (district !== "All Districts" && district) baseArea = 400;
    if (project !== "All Projects" && project) baseArea = 150;
    if (category !== "All Categories" && category) baseArea = baseArea * 0.6;
    if (stage === "Possession") baseArea = baseArea * 0.2;
    
    res.json({
      areaNotified: (baseArea).toFixed(1) + " Ha",
      areaAcquired: (baseArea * 0.8).toFixed(1) + " Ha",
      compensationAssessed: "₹" + (baseArea * 1.5).toFixed(1) + " Cr",
      compensationDisbursed: "₹" + (baseArea * 1.2).toFixed(1) + " Cr",
      familiesAffected: Math.floor(baseArea * 12),
      familiesRnR: Math.floor(baseArea * 8),
    });
  });
  
  // replace the old one
  /*`
);

content = content.replace(
  '    });\n  });\n\n  app.get("/api/risk"',
  '    });\n  }); */\n\n  app.get("/api/risk"'
);

// For /api/workflow:
content = content.replace(
  'app.get("/api/workflow", (req, res) => {',
  `app.get("/api/workflow", (req, res) => {
    const { state, district, project, stage, category, risk } = req.query;
    // basic mock that reacts to project
    let stages = [
      { id: 1, name: "notification", status: "completed", date: "12 Oct 2025" },
      { id: 2, name: "declaration", status: "completed", date: "05 Nov 2025" },
      { id: 3, name: "award", status: "current", date: "Pending (Due: 10 Dec)" },
      { id: 4, name: "compensation", status: "pending", date: "-" },
      { id: 5, name: "possession", status: "pending", date: "-" },
      { id: 6, name: "rnr", status: "pending", date: "-" },
    ];
    
    if (project === "PRJ-2026-003") {
      stages = [
        { id: 1, name: "notification", status: "completed", date: "12 Jan 2019" },
        { id: 2, name: "declaration", status: "completed", date: "05 Feb 2019" },
        { id: 3, name: "award", status: "completed", date: "10 Dec 2019" },
        { id: 4, name: "compensation", status: "current", date: "Pending · Due 10 Dec 2026" },
        { id: 5, name: "possession", status: "pending", date: "-" },
        { id: 6, name: "rnr", status: "pending", date: "-" },
      ];
    } else if (stage === "Possession") {
      stages = [
        { id: 1, name: "notification", status: "completed", date: "12 Oct 2025" },
        { id: 2, name: "declaration", status: "completed", date: "05 Nov 2025" },
        { id: 3, name: "award", status: "completed", date: "10 Dec 2025" },
        { id: 4, name: "compensation", status: "completed", date: "15 Jan 2026" },
        { id: 5, name: "possession", status: "current", date: "Pending · Due 20 Feb 2026" },
        { id: 6, name: "rnr", status: "pending", date: "-" },
      ];
    }

    res.json(stages);
  });
  
  /*`
);

content = content.replace(
  '    ];\n    res.json(stages);\n  });\n\n  app.get("/api/parcels"',
  '    ];\n    res.json(stages);\n  }); */\n\n  app.get("/api/parcels"'
);

fs.writeFileSync('server.ts', content);
