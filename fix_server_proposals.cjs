const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add demo proposals
const demoProposals = `
      {
        id: "PROP-2026-0001", projectName: "Gurugram Metro Extension", ministry: "MoUD", category: "Urban Development", state: "Haryana", district: "Gurugram",
        status: "Draft", dateSubmitted: null, areaRequired: 12.5, areaNotified: 0, areaAcquired: 0, compensationAssessed: 0, compensationPaid: 0, familiesAffected: 0, rrSettled: 0, stage: "Proposal", objectionCount: 0, historicalDelayRate: 0, riskProfile: null, implementingAgency: "DMRC", objective: "Extend metro to sector 22"
      },
      {
        id: "PROP-2026-0002", projectName: "Pune Ring Road Phase 2", ministry: "MoRTH", category: "Highway", state: "Maharashtra", district: "Pune",
        status: "Under Scrutiny", dateSubmitted: "2026-08-15", areaRequired: 150.0, areaNotified: 0, areaAcquired: 0, compensationAssessed: 0, compensationPaid: 0, familiesAffected: 0, rrSettled: 0, stage: "Proposal", objectionCount: 0, historicalDelayRate: 0, riskProfile: null, implementingAgency: "NHAI", objective: "Decongest traffic"
      },
      {
        id: "PROP-2026-0003", projectName: "Noida Airport Link", ministry: "MoCA", category: "Rail", state: "Uttar Pradesh", district: "Gautam Buddha Nagar",
        status: "Query Raised", dateSubmitted: "2026-08-20", areaRequired: 55.0, areaNotified: 0, areaAcquired: 0, compensationAssessed: 0, compensationPaid: 0, familiesAffected: 0, rrSettled: 0, stage: "Proposal", objectionCount: 0, historicalDelayRate: 0, riskProfile: null, implementingAgency: "RVNL", objective: "Airport connectivity", scrutinyQuery: "Please attach alignment map"
      },
      {
        id: "PROP-2026-0004", projectName: "Karnal Solar Park", ministry: "MNRE", category: "Renewable Energy", state: "Haryana", district: "Karnal",
        status: "Returned for Correction", dateSubmitted: "2026-09-01", areaRequired: 200.0, areaNotified: 0, areaAcquired: 0, compensationAssessed: 0, compensationPaid: 0, familiesAffected: 0, rrSettled: 0, stage: "Proposal", objectionCount: 0, historicalDelayRate: 0, riskProfile: null, implementingAgency: "SECI", objective: "Solar farm", scrutinyCorrection: "Area requirement mismatch with footprint"
      },
`;

code = code.replace(
  /projects: \[/,
  'projects: [\n' + demoProposals
);

// Add API routes for proposals
const proposalRoutes = `
  app.post("/api/proposals", authenticateToken, (req, res) => {
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    // Validation
    const { projectName, category, ministry, state, district, areaRequired, implementingAgency, objective, action } = req.body;
    if (!projectName || projectName.trim().length === 0) return res.status(400).json({ error: "Project Name required" });
    if (!ministry) return res.status(400).json({ error: "Ministry required" });
    if (!category) return res.status(400).json({ error: "Category required" });
    if (!state) return res.status(400).json({ error: "State required" });
    if (areaRequired <= 0) return res.status(400).json({ error: "Invalid area" });

    const newId = "PROP-2026-" + String(db.projects.length + 1).padStart(4, '0');
    
    const status = action === "submit" ? "Submitted" : "Draft";
    
    const newProposal = {
      id: newId,
      projectName: projectName.trim(),
      ministry,
      category,
      state,
      district: district || "Unspecified",
      implementingAgency: implementingAgency || "",
      objective: objective || "",
      status,
      dateSubmitted: status === "Submitted" ? new Date().toISOString().split('T')[0] : null,
      areaRequired: parseFloat(areaRequired),
      areaNotified: 0,
      areaAcquired: 0,
      compensationAssessed: 0,
      compensationPaid: 0,
      familiesAffected: 0,
      rrSettled: 0,
      stage: status === "Submitted" ? "Scrutiny" : "Draft",
      objectionCount: 0,
      historicalDelayRate: 0,
      riskProfile: null,
      footprint: req.body.footprint || null
    };

    db.projects.push(newProposal);
    
    const auditEvent = {
       id: "AUD-" + Date.now(),
       projectId: newId,
       action: status === "Submitted" ? "PROPOSAL_SUBMITTED" : "PROPOSAL_DRAFT_SAVED",
       stage: newProposal.stage,
       remarks: \`Proposal created as \${status}\`,
       executedBy: user.username,
       timestamp: new Date().toISOString()
    };
    db.auditEvents = db.auditEvents || [];
    db.auditEvents.push(auditEvent);

    res.json({ success: true, proposal: newProposal, auditEvent });
  });

  app.put("/api/proposals/:id", authenticateToken, (req, res) => {
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const proposal = db.projects.find(p => p.id === req.params.id);
    if (!proposal) return res.status(404).json({ error: "Not found" });
    
    if (proposal.status !== "Draft" && proposal.status !== "Returned for Correction" && proposal.status !== "Query Raised") {
       return res.status(400).json({ error: "Cannot edit proposal in current status" });
    }

    const { projectName, category, ministry, state, district, areaRequired, implementingAgency, objective, action, footprint } = req.body;
    
    if (projectName) proposal.projectName = projectName.trim();
    if (category) proposal.category = category;
    if (ministry) proposal.ministry = ministry;
    if (state) proposal.state = state;
    if (district) proposal.district = district;
    if (areaRequired) proposal.areaRequired = parseFloat(areaRequired);
    if (implementingAgency) proposal.implementingAgency = implementingAgency;
    if (objective) proposal.objective = objective;
    if (footprint) proposal.footprint = footprint;

    if (action === "submit") {
      proposal.status = "Submitted";
      proposal.stage = "Scrutiny";
      proposal.dateSubmitted = new Date().toISOString().split('T')[0];
    } else if (action === "resubmit") {
      proposal.status = "Submitted";
      proposal.stage = "Scrutiny";
    }
    
    const auditEvent = {
       id: "AUD-" + Date.now(),
       projectId: proposal.id,
       action: action === "submit" ? "PROPOSAL_SUBMITTED" : (action === "resubmit" ? "PROPOSAL_RESUBMITTED" : "PROPOSAL_UPDATED"),
       stage: proposal.stage,
       remarks: \`Proposal updated\`,
       executedBy: user.username,
       timestamp: new Date().toISOString()
    };
    db.auditEvents.push(auditEvent);

    res.json({ success: true, proposal, auditEvent });
  });

  app.post("/api/proposals/:id/workflow", authenticateToken, (req, res) => {
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen" || user.role === "Field Surveyor") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const proposal = db.projects.find(p => p.id === req.params.id);
    if (!proposal) return res.status(404).json({ error: "Not found" });
    
    const { actionId, remarks, deadline } = req.body;
    
    const allowedTransitions = {
      "Submitted": ["START_SCRUTINY"],
      "Under Scrutiny": ["APPROVE", "REJECT", "RETURN_FOR_CORRECTION", "RAISE_QUERY"],
      "Query Raised": ["RESPOND_QUERY"],
      "Returned for Correction": ["RESUBMIT"]
    };
    
    // Normalize status for logic if needed, but here we can map specific actions
    if (actionId === "START_SCRUTINY") proposal.status = "Under Scrutiny";
    else if (actionId === "APPROVE") {
       proposal.status = "Approved";
       proposal.stage = "Notification";
    }
    else if (actionId === "REJECT") proposal.status = "Rejected";
    else if (actionId === "RETURN_FOR_CORRECTION") {
       proposal.status = "Returned for Correction";
       proposal.scrutinyCorrection = remarks;
    }
    else if (actionId === "RAISE_QUERY") {
       proposal.status = "Query Raised";
       proposal.scrutinyQuery = remarks;
    }
    else if (actionId === "RESPOND_QUERY") proposal.status = "Under Scrutiny";
    else {
       return res.status(400).json({ error: "Invalid action" });
    }
    
    const auditEvent = {
       id: "AUD-" + Date.now(),
       projectId: proposal.id,
       action: actionId,
       stage: proposal.stage,
       remarks: remarks || "",
       executedBy: user.username,
       timestamp: new Date().toISOString()
    };
    db.auditEvents.push(auditEvent);

    res.json({ success: true, proposal, auditEvent });
  });
`;

code = code.replace(
  /app\.get\("\/api\/proposals"[\s\S]*?\}\);/,
  `app.get("/api/proposals", authenticateToken, (req, res) => {
    res.json(filterProjects(req.query, req.user));
  });\n\n` + proposalRoutes
);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts for Proposal Module");
