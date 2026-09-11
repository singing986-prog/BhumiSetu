const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldRiskStr = `  app.get("/api/risk", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user);
    const risks = projs.map(p => ({
      id: p.id, projectName: p.projectName, state: p.state, district: p.district,
      level: p.riskProfile.level, score: p.riskProfile.score, factors: p.riskProfile.factors,
      stage: p.stage, overdueDays: p.riskProfile.level === "High" ? 45 : (p.riskProfile.level === "Medium" ? 12 : 0),
      recommendation: p.riskProfile.level === "High" ? "Immediate escalation to State Nodal Officer" : "Monitor weekly progress"
    }));
    res.json(risks);
  });`;

const newRiskStr = `  app.get("/api/risk", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user);
    const risks = projs.map(p => {
      // Predictive Delay-Risk Engine
      const dDate = addDays(p.dateSubmitted, 180);
      const aDate = addDays(dDate, 365);
      const cDate = addDays(aDate, 90);
      const pDate = addDays(cDate, 60);
      
      let targetDate = p.dateSubmitted;
      if (p.stage === "Declaration") targetDate = dDate;
      if (p.stage === "Award") targetDate = aDate;
      if (p.stage === "Compensation") targetDate = cDate;
      if (p.stage === "Possession") targetDate = pDate;
      if (p.stage === "R&R") targetDate = addDays(pDate, 180);

      const diffTime = new Date().getTime() - new Date(targetDate).getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const objectionCount = Math.floor(Math.random() * 50); // Simulate some objections for hackathon logic transparency
      const historicalDelayRate = p.district === "Pune" || p.district === "South Delhi" ? 35 : 15;
      
      let score = 20 + (objectionCount * 0.5) + (historicalDelayRate * 0.5);
      if (overdueDays > 0) {
         score += Math.min(overdueDays, 50); // cap penalty
      } else {
         score -= 10;
      }
      
      score = Math.max(0, Math.min(100, Math.floor(score)));
      
      let level = "Low";
      if (score > 40) level = "Medium";
      if (score > 75) level = "High";
      
      let factors = [];
      if (overdueDays > 0) factors.push(\`\${overdueDays} days overdue\`);
      if (objectionCount > 10) factors.push(\`\${objectionCount} unresolved objections\`);
      if (p.familiesAffected > 50) factors.push(\`\${p.familiesAffected} affected families\`);
      factors.push(\`district historical delay rate: \${historicalDelayRate}%\`);
      
      // Section-24(2)-style Lapse Risk
      let lapseRisk = "LOW";
      let lapseReason = "Within safe operational margins.";
      if (p.stage === "Possession" && overdueDays > 365) {
         lapseRisk = "HIGH";
         lapseReason = "Possession pending for > 1 year after Award/Compensation deadline.";
      } else if (p.stage === "Compensation" && overdueDays > 180) {
         lapseRisk = "MEDIUM";
         lapseReason = "Compensation unpaid for > 6 months after Award.";
      }

      return {
        id: p.id, projectName: p.projectName, state: p.state, district: p.district,
        level: level, score: score, factors: factors, lapseRisk, lapseReason,
        stage: p.stage, overdueDays: Math.max(0, overdueDays),
        recommendation: level === "High" ? "Immediate escalation to State Nodal Officer" : (level === "Medium" ? "Schedule review meeting within 7 days" : "Monitor weekly progress")
      };
    });
    res.json(risks);
  });`;

code = code.replace(oldRiskStr, newRiskStr);
fs.writeFileSync('server.ts', code);
