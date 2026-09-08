const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const filterHelper = `
  function filterProjects(query) {
    const { state, district, project, stage, category, risk } = query;
    let projs = mockProposals;
    if (state && state !== "All States") projs = projs.filter(p => p.state === state);
    if (district && district !== "All Districts") projs = projs.filter(p => p.district === district);
    if (project && project !== "All Projects") {
       // project could be the ID or name
       projs = projs.filter(p => p.id === project || p.projectName === project);
    }
    if (stage && stage !== "All Stages") projs = projs.filter(p => p.stage === stage);
    if (category && category !== "All Categories") projs = projs.filter(p => p.category === category);
    if (risk && risk !== "All Risks") projs = projs.filter(p => p.riskProfile.level === risk);
    return projs;
  }
`;

// Inject helper
content = content.replace('app.get("/api/projects"', filterHelper + '\n  app.get("/api/projects"');

// Rewrite /api/projects again to use helper
content = content.replace(
  /app\.get\("\/api\/projects", \([\s\S]*?\}\);/,
  `app.get("/api/projects", (req, res) => {
    const projs = filterProjects(req.query);
    res.json(projs.map(p => ({ id: p.id, name: p.projectName })));
  });`
);

// Rewrite /api/proposals
content = content.replace(
  /app\.get\("\/api\/proposals", \([\s\S]*?\}\);/,
  `app.get("/api/proposals", (req, res) => {
    res.json(filterProjects(req.query));
  });`
);

// Rewrite /api/risk
content = content.replace(
  /app\.get\("\/api\/risk", \([\s\S]*?\}\);/,
  `app.get("/api/risk", (req, res) => {
    const projs = filterProjects(req.query);
    const risks = projs.map(p => ({
      id: p.id, projectName: p.projectName, state: p.state, district: p.district,
      level: p.riskProfile.level, score: p.riskProfile.score, factors: p.riskProfile.factors,
      stage: p.stage
    }));
    res.json(risks);
  });`
);

fs.writeFileSync('server.ts', content);
