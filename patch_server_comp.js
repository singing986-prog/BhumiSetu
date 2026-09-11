import fs from 'fs';
let serverContent = fs.readFileSync('server.ts', 'utf-8');

const compRoutes = `
  app.post("/api/compensation/:id/assess", authenticateToken, (req, res) => {
    const comp = db.compensation.find(c => c.id === req.params.id);
    if (!comp) return res.status(404).json({ error: "Not found" });
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") return res.status(403).json({ error: "Unauthorized" });

    // Enforce Jurisdiction
    if (user.role === "State Nodal Officer" && user.state !== "All" && user.state !== comp.state) return res.status(403).json({ error: "Unauthorized state" });
    if (user.role === "District LAO" && user.district !== "All" && user.district !== comp.district) return res.status(403).json({ error: "Unauthorized district" });

    const { marketValue, additionalComponents = [] } = req.body;
    if (typeof marketValue !== 'number' || marketValue < 0) return res.status(400).json({ error: "Invalid market value" });
    
    comp.marketValue = marketValue;
    comp.solatium = marketValue; // 100% solatium rule
    comp.additionalComponents = additionalComponents;
    comp.totalAssessed = comp.marketValue + comp.solatium + additionalComponents.reduce((acc, c) => acc + (c.amount || 0), 0);
    comp.assessmentStatus = "SUBMITTED";
    comp.updatedAt = new Date().toISOString();

    res.json(comp);
  });

  app.post("/api/compensation/:id/approve", authenticateToken, (req, res) => {
    const comp = db.compensation.find(c => c.id === req.params.id);
    if (!comp) return res.status(404).json({ error: "Not found" });
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") return res.status(403).json({ error: "Unauthorized" });

    // Enforce Jurisdiction
    if (user.role === "State Nodal Officer" && user.state !== "All" && user.state !== comp.state) return res.status(403).json({ error: "Unauthorized state" });
    if (user.role === "District LAO" && user.district !== "All" && user.district !== comp.district) return res.status(403).json({ error: "Unauthorized district" });

    const { action, remarks } = req.body;
    if (action === "REJECT" || action === "RETURN") {
        if (!remarks) return res.status(400).json({ error: "Remarks required" });
        comp.assessmentStatus = action;
    } else if (action === "APPROVE") {
        comp.assessmentStatus = "APPROVED";
        comp.approvedAmount = comp.totalAssessed;
        comp.balanceAmount = comp.approvedAmount - comp.disbursedAmount;
    } else {
        return res.status(400).json({ error: "Invalid action" });
    }
    comp.updatedAt = new Date().toISOString();

    res.json(comp);
  });

  app.post("/api/compensation/:id/pay", authenticateToken, (req, res) => {
    const comp = db.compensation.find(c => c.id === req.params.id);
    if (!comp) return res.status(404).json({ error: "Not found" });
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") return res.status(403).json({ error: "Unauthorized" });

    // Enforce Jurisdiction
    if (user.role === "State Nodal Officer" && user.state !== "All" && user.state !== comp.state) return res.status(403).json({ error: "Unauthorized state" });
    if (user.role === "District LAO" && user.district !== "All" && user.district !== comp.district) return res.status(403).json({ error: "Unauthorized district" });

    if (comp.assessmentStatus !== "APPROVED") return res.status(400).json({ error: "Assessment not approved" });
    
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0 || amount > comp.balanceAmount) return res.status(400).json({ error: "Invalid payment amount" });

    comp.disbursedAmount += amount;
    comp.balanceAmount = comp.approvedAmount - comp.disbursedAmount;
    
    if (comp.balanceAmount === 0) {
        comp.paymentStatus = "PAID";
    } else {
        comp.paymentStatus = "PARTIALLY_PAID";
    }

    const paymentRef = "PFMS-DEMO-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().split('T')[0];

    comp.paymentHistory.push({
        id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
        reference: paymentRef,
        amount: amount,
        date: date,
        status: "PAID",
        initiatedBy: user.role
    });

    comp.updatedAt = new Date().toISOString();

    res.json(comp);
  });

  app.get("/api/rnr", authenticateToken, (req, res) => {
`;

serverContent = serverContent.replace(/app\.get\("\/api\/rnr", authenticateToken, \(req, res\) => \{/, compRoutes);

// Also need to fix the GET /api/compensation route to respect Citizen access
const compGetRoute = `
  app.get("/api/compensation", authenticateToken, (req, res) => {
    const user = req.user;
    let comps = db.compensation;
    
    // Role based filtering
    if (user.role === "State Nodal Officer" && user.state !== "All") {
       comps = comps.filter(c => c.state === user.state);
    } else if (user.role === "District LAO" && user.district !== "All") {
       comps = comps.filter(c => c.district === user.district);
    } else if (user.role === "Affected Citizen") {
       comps = comps.filter(c => c.ulpin === "06122344556677"); // Demo citizen ULPIN
    }
    
    const projs = filterProjects(req.query, user).map(p => p.id);
    comps = comps.filter(c => projs.includes(c.projectId));
    
    res.json(comps);
  });
`;

serverContent = serverContent.replace(/app\.get\("\/api\/compensation", authenticateToken, \(req, res\) => \{[\s\S]*?\}\);/, compGetRoute);


fs.writeFileSync('server.ts', serverContent);
