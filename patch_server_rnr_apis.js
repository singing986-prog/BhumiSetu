import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// 1. Update KPIs
const oldKpiSnippet = `    projs.forEach(p => {
      areaNotified += p.areaNotified || 0;
      areaAcquired += p.areaAcquired || 0;
      familiesAffected += p.familiesAffected || 0;
      rrSettled += p.rrSettled || 0;
    });`;

const newKpiSnippet = `    projs.forEach(p => {
      areaNotified += p.areaNotified || 0;
      areaAcquired += p.areaAcquired || 0;
    });
    
    // R&R underlying metrics
    const rnrRecords = (db as any).rnr.filter(r => projIds.includes(r.projectId));
    familiesAffected = rnrRecords.length;
    rrSettled = rnrRecords.filter(r => r.approvalStatus === "SETTLED").length;`;

content = content.replace(oldKpiSnippet, newKpiSnippet);

// 2. Add R&R APIs
const rnrApiOld = `  app.get("/api/rnr", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user).map(p => p.id);
    res.json((db as any).rnr.filter(r => projs.includes(r.projectId)));
  });`;

const rnrApiNew = `  app.get("/api/rnr", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user).map(p => p.id);
    let rnrRecords = (db as any).rnr.filter(r => projs.includes(r.projectId));
    
    // Additional filters if provided
    if (req.query.q) {
       const q = (req.query.q as string).toLowerCase();
       rnrRecords = rnrRecords.filter(r => r.referenceId.toLowerCase().includes(q) || r.ulpin.toLowerCase().includes(q) || r.parcelId.toLowerCase().includes(q) || r.familyHead.toLowerCase().includes(q) || r.familyId.toLowerCase().includes(q));
    }
    if (req.query.category && req.query.category !== 'All Categories') {
       rnrRecords = rnrRecords.filter(r => r.category === req.query.category);
    }
    if (req.query.approvalStatus && req.query.approvalStatus !== 'All Statuses') {
       rnrRecords = rnrRecords.filter(r => r.approvalStatus === req.query.approvalStatus);
    }
    
    res.json(rnrRecords);
  });

  // Verify Role/Jurisdiction for R&R
  const checkRnrJurisdiction = (rnr: any, user: any) => {
    if (user.role === "Affected Citizen") return false;
    if (user.role === "Auditor") return false;
    if (user.role === "State Nodal Officer" && user.jurisdiction !== "All" && rnr.state !== user.jurisdiction) return false;
    if (user.role === "District LAO" && user.jurisdiction !== "All" && rnr.district !== user.jurisdiction) return false;
    return true;
  };

  app.post("/api/rnr/:id/assess-eligibility", authenticateToken, (req, res) => {
    const rnr = (db as any).rnr.find(r => r.id === req.params.id);
    const user = (req as any).user;
    if (!rnr) return res.status(404).json({ error: "R&R case not found" });
    if (!checkRnrJurisdiction(rnr, user)) return res.status(403).json({ error: "Unauthorized scope" });

    const { status, remarks } = req.body;
    rnr.eligibilityStatus = status;
    rnr.remarks = remarks || rnr.remarks;
    rnr.updatedAt = new Date().toISOString();
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId,
       action: "ELIGIBILITY_ASSESSED", stage: "R&R", remarks: \`Eligibility marked as \${status}\`,
       executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id
    });
    res.json({ success: true, data: rnr });
  });

  app.post("/api/rnr/:id/assess-entitlement", authenticateToken, (req, res) => {
    const rnr = (db as any).rnr.find(r => r.id === req.params.id);
    const user = (req as any).user;
    if (!rnr) return res.status(404).json({ error: "R&R case not found" });
    if (!checkRnrJurisdiction(rnr, user)) return res.status(403).json({ error: "Unauthorized scope" });

    const { housingEntitlement, landEntitlement, livelihoodEntitlement, assistanceAssessed, relocationRequired } = req.body;
    
    if (assistanceAssessed < 0) return res.status(400).json({ error: "Assistance cannot be negative" });

    rnr.housingEntitlement = housingEntitlement;
    rnr.landEntitlement = landEntitlement;
    rnr.livelihoodEntitlement = livelihoodEntitlement;
    rnr.assistanceAssessed = assistanceAssessed || 0;
    rnr.relocationRequired = relocationRequired;
    rnr.entitlementStatus = "ASSESSED";
    
    if(rnr.approvalStatus === "DRAFT" || rnr.approvalStatus === "RETURNED") rnr.approvalStatus = "UNDER_REVIEW";

    rnr.updatedAt = new Date().toISOString();
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId,
       action: "ENTITLEMENT_ASSESSED", stage: "R&R", remarks: \`Entitlement assessed. Assistance: \${assistanceAssessed}\`,
       executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id
    });
    createNotification(user, "ENTITLEMENT_ASSESSED", "R&R Entitlement Assessed", \`Assessed R&R entitlements for \${rnr.referenceId}\`, rnr.projectId);
    res.json({ success: true, data: rnr });
  });

  app.post("/api/rnr/:id/verify", authenticateToken, (req, res) => {
    const rnr = (db as any).rnr.find(r => r.id === req.params.id);
    const user = (req as any).user;
    if (!rnr) return res.status(404).json({ error: "R&R case not found" });
    if (!checkRnrJurisdiction(rnr, user)) return res.status(403).json({ error: "Unauthorized scope" });

    const { status, remarks } = req.body; // status can be VERIFIED or RETURNED
    if (status === "RETURNED" && !remarks) return res.status(400).json({ error: "RETURNED_REASON_REQUIRED" });

    rnr.verificationStatus = status;
    rnr.verifiedBy = user.username;
    rnr.verifiedAt = new Date().toISOString();
    rnr.remarks = remarks || rnr.remarks;
    if (status === "RETURNED") rnr.approvalStatus = "RETURNED";
    
    rnr.updatedAt = new Date().toISOString();
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId,
       action: status === "RETURNED" ? "RNR_RETURNED" : "RNR_VERIFIED", stage: "R&R", remarks: remarks || "Verified",
       executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id
    });
    res.json({ success: true, data: rnr });
  });

  app.post("/api/rnr/:id/approve", authenticateToken, (req, res) => {
    const rnr = (db as any).rnr.find(r => r.id === req.params.id);
    const user = (req as any).user;
    if (!rnr) return res.status(404).json({ error: "R&R case not found" });
    if (!checkRnrJurisdiction(rnr, user)) return res.status(403).json({ error: "Unauthorized scope" });

    const { status, remarks } = req.body; // APPROVED, REJECTED, RETURNED
    
    if ((status === "REJECTED" || status === "RETURNED") && !remarks) {
        return res.status(400).json({ error: "REJECTION_REASON_REQUIRED" });
    }
    
    if (status === "APPROVED" && rnr.verificationStatus !== "VERIFIED") {
        return res.status(400).json({ error: "Must be verified before approval" });
    }

    rnr.approvalStatus = status;
    rnr.approvedBy = user.username;
    rnr.approvedAt = new Date().toISOString();
    rnr.remarks = remarks || rnr.remarks;
    rnr.updatedAt = new Date().toISOString();
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId,
       action: \`RNR_\${status}\`, stage: "R&R", remarks: remarks || \`Case \${status}\`,
       executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id
    });
    createNotification(user, \`RNR_\${status}\`, \`R&R \${status}\`, \`R&R \${rnr.referenceId} was \${status}\`, rnr.projectId);
    res.json({ success: true, data: rnr });
  });

  app.post("/api/rnr/:id/pay-assistance", authenticateToken, (req, res) => {
    const rnr = (db as any).rnr.find(r => r.id === req.params.id);
    const user = (req as any).user;
    if (!rnr) return res.status(404).json({ error: "R&R case not found" });
    if (!checkRnrJurisdiction(rnr, user)) return res.status(403).json({ error: "Unauthorized scope" });

    if (rnr.approvalStatus !== "APPROVED" && rnr.approvalStatus !== "IMPLEMENTATION_IN_PROGRESS") {
        return res.status(400).json({ error: "R&R must be APPROVED or IMPLEMENTATION_IN_PROGRESS to disburse assistance" });
    }

    const { amount } = req.body;
    if (amount <= 0 || amount > rnr.assistanceBalance) return res.status(400).json({ error: "Invalid payment amount" });

    rnr.assistancePaid += amount;
    rnr.assistanceBalance = rnr.assistanceAssessed - rnr.assistancePaid;
    rnr.approvalStatus = "IMPLEMENTATION_IN_PROGRESS";
    rnr.updatedAt = new Date().toISOString();
    
    (db as any).auditEvents.push({
       id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId,
       action: "ASSISTANCE_DISBURSED", stage: "R&R", remarks: \`Disbursed ₹\${amount}\`,
       executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id
    });
    createNotification(user, "ASSISTANCE_DISBURSED", "R&R Assistance Paid", \`Disbursed ₹\${amount} for \${rnr.referenceId}\`, rnr.projectId);
    res.json({ success: true, data: rnr });
  });

  app.post("/api/rnr/:id/update-implementation", authenticateToken, (req, res) => {
    const rnr = (db as any).rnr.find(r => r.id === req.params.id);
    const user = (req as any).user;
    if (!rnr) return res.status(404).json({ error: "R&R case not found" });
    if (!checkRnrJurisdiction(rnr, user)) return res.status(403).json({ error: "Unauthorized scope" });
    if (rnr.approvalStatus === "SETTLED") return res.status(400).json({ error: "Cannot modify SETTLED R&R case" });

    const { housingStatus, landStatus, livelihoodStatus, trainingStatus, relocationStatus, markSettled } = req.body;
    
    if (housingStatus) {
        rnr.housingStatus = housingStatus;
        (db as any).auditEvents.push({ id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId, action: "HOUSING_UPDATED", stage: "R&R", remarks: \`Housing \${housingStatus}\`, executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id });
    }
    if (landStatus) rnr.landStatus = landStatus;
    if (livelihoodStatus || trainingStatus) {
        rnr.livelihoodStatus = livelihoodStatus || rnr.livelihoodStatus;
        rnr.trainingStatus = trainingStatus || rnr.trainingStatus;
        (db as any).auditEvents.push({ id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId, action: "LIVELIHOOD_UPDATED", stage: "R&R", remarks: \`Livelihood updated\`, executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id });
    }
    if (relocationStatus) {
        rnr.relocationStatus = relocationStatus;
        (db as any).auditEvents.push({ id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId, action: "RELOCATION_UPDATED", stage: "R&R", remarks: \`Relocation \${relocationStatus}\`, executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id });
    }
    
    if (markSettled) {
        if (rnr.assistanceBalance > 0) return res.status(400).json({ error: "Cannot settle with pending assistance balance" });
        if (rnr.relocationRequired && rnr.relocationStatus !== "COMPLETED") return res.status(400).json({ error: "Relocation must be completed" });
        rnr.approvalStatus = "SETTLED";
        (db as any).auditEvents.push({ id: "AUD-" + Date.now(), projectId: rnr.projectId, parcelId: rnr.parcelId, action: "RNR_SETTLED", stage: "R&R", remarks: "R&R Case Settled", executedBy: user.username, timestamp: new Date().toISOString(), ulpin: rnr.ulpin, rnrId: rnr.id });
        createNotification(user, "RNR_SETTLED", "R&R Settled", \`R&R case \${rnr.referenceId} has been successfully settled.\`, rnr.projectId);
    } else if (rnr.approvalStatus === "APPROVED") {
        rnr.approvalStatus = "IMPLEMENTATION_IN_PROGRESS";
    }

    rnr.updatedAt = new Date().toISOString();
    res.json({ success: true, data: rnr });
  });`;

content = content.replace(rnrApiOld, rnrApiNew);

fs.writeFileSync('server.ts', content);
