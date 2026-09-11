import fs from 'fs';
let serverContent = fs.readFileSync('server.ts', 'utf-8');

const kpiCode = `
  app.get("/api/kpis", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user);
    const projIds = projs.map(p => p.id);
    
    let areaNotified = 0; let areaAcquired = 0; let familiesAffected = 0; let rrSettled = 0;
    
    projs.forEach(p => {
      areaNotified += p.areaNotified || 0;
      areaAcquired += p.areaAcquired || 0;
      familiesAffected += p.familiesAffected || 0;
      rrSettled += p.rrSettled || 0;
    });

    // Calculate compensation from underlying records
    let compensationAssessed = 0;
    let compensationPaid = 0;
    
    const comps = (db as any).compensation.filter(c => projIds.includes(c.projectId));
    comps.forEach(c => {
       if (c.assessmentStatus === "APPROVED" || c.paymentStatus === "PAID" || c.paymentStatus === "PARTIALLY_PAID") {
           compensationAssessed += (c.totalAssessed || 0);
           compensationPaid += (c.disbursedAmount || 0);
       }
    });

    const curr = {
      areaNotified: Number(areaNotified.toFixed(1)),
      areaAcquired: Number(areaAcquired.toFixed(1)),
      compensationAssessed: Number(compensationAssessed.toFixed(1)),
      compensationDisbursed: Number(compensationPaid.toFixed(1)),
      familiesAffected: Math.floor(familiesAffected),
      familiesRnR: Math.floor(rrSettled),
      activeProjects: projs.length
    };
`;

serverContent = serverContent.replace(/app\.get\("\/api\/kpis", authenticateToken, \(req, res\) => \{[\s\S]*?activeProjects: projs\.length\n    \};/, kpiCode);

fs.writeFileSync('server.ts', serverContent);
