sed -i.bak '/app.get("\/api\/awards",/c\
  app.get("/api/awards", authenticateToken, (req, res) => {\
    const user = (req as any).user;\
    let validAwards = (db as any).awards;\
    if (user.role === "Citizen") {\
      const citizenUlpin = "06122344556677";\
      validAwards = validAwards.filter(a => a.awardItems.some(i => i.ulpin === citizenUlpin));\
    } else {\
      const projs = filterProjects(req.query, user).map(p => p.id);\
      validAwards = validAwards.filter(a => projs.includes(a.projectId));\
    }\
    res.json(validAwards);\
  });\
\
  app.get("/api/awards/:id", authenticateToken, (req, res) => {\
    const award = (db as any).awards.find(a => a.id === req.params.id);\
    if (!award) return res.status(404).json({ error: "Not found" });\
    const user = (req as any).user;\
    if (user.role === "Citizen") {\
      const citizenUlpin = "06122344556677";\
      if (!award.awardItems.some(i => i.ulpin === citizenUlpin)) return res.status(403).json({ error: "Unauthorized access" });\
    } else {\
      const proj = filterProjects({}, user).find(p => p.id === award.projectId);\
      if (!proj) return res.status(403).json({ error: "Unauthorized access" });\
    }\
    res.json(award);\
  });\
\
  app.post("/api/awards", authenticateToken, (req, res) => {\
    const user = (req as any).user;\
    if (["Auditor", "Citizen"].includes(user.role)) return res.status(403).json({ error: "Unauthorized role" });\
    const award = req.body;\
    const proj = filterProjects({}, user).find(p => p.id === award.projectId);\
    if (!proj) return res.status(403).json({ error: "Unauthorized access" });\
    award.id = "AWD-" + Date.now();\
    award.status = "DRAFT";\
    award.createdBy = user.email;\
    award.createdAt = new Date().toISOString();\
    award.updatedAt = award.createdAt;\
    let totalAmount = 0;\
    award.awardItems.forEach((item, index) => {\
      item.id = award.id + "-" + index;\
      item.awardId = award.id;\
      item.status = "DRAFT";\
      totalAmount += Number(item.awardAmount);\
    });\
    award.totalAmount = totalAmount;\
    award.beneficiaryCount = new Set(award.awardItems.map(i => i.beneficiaryId)).size;\
    (db as any).awards.push(award);\
    logAudit(user, award.projectId, award.id, "AWARD_CREATED", "Created draft award");\
    res.json(award);\
  });\
\
  app.put("/api/awards/:id", authenticateToken, (req, res) => {\
    const user = (req as any).user;\
    if (["Auditor", "Citizen"].includes(user.role)) return res.status(403).json({ error: "Unauthorized role" });\
    const existing = (db as any).awards.find(a => a.id === req.params.id);\
    if (!existing) return res.status(404).json({ error: "Not found" });\
    if (existing.status !== "DRAFT") return res.status(400).json({ error: "Cannot modify non-draft award" });\
    const proj = filterProjects({}, user).find(p => p.id === existing.projectId);\
    if (!proj) return res.status(403).json({ error: "Unauthorized access" });\
    \
    const updates = req.body;\
    Object.assign(existing, updates, { updatedAt: new Date().toISOString() });\
    \
    let totalAmount = 0;\
    existing.awardItems.forEach(item => {\
      totalAmount += Number(item.awardAmount);\
    });\
    existing.totalAmount = totalAmount;\
    existing.beneficiaryCount = new Set(existing.awardItems.map(i => i.beneficiaryId)).size;\
    logAudit(user, existing.projectId, existing.id, "AWARD_UPDATED", "Updated draft award");\
    res.json(existing);\
  });\
\
  app.post("/api/awards/:id/:action", authenticateToken, (req, res) => {\
    const user = (req as any).user;\
    const { id, action } = req.params;\
    const { remarks, rejectionReason } = req.body;\
    const award = (db as any).awards.find(a => a.id === id);\
    if (!award) return res.status(404).json({ error: "Not found" });\
    const proj = filterProjects({}, user).find(p => p.id === award.projectId);\
    if (!proj) return res.status(403).json({ error: "Unauthorized access" });\
\
    if (["Auditor", "Citizen"].includes(user.role)) return res.status(403).json({ error: "Unauthorized role" });\
\
    const now = new Date().toISOString();\
    if (action === "submit") {\
      if (award.status !== "DRAFT") return res.status(400).json({ error: "Invalid transition" });\
      award.status = "SUBMITTED";\
      award.awardItems.forEach(i => i.status = "SUBMITTED");\
      award.updatedAt = now;\
      logAudit(user, award.projectId, award.id, "AWARD_SUBMITTED", "Submitted award for verification");\
    } else if (action === "verify") {\
      if (award.status !== "SUBMITTED") return res.status(400).json({ error: "Invalid transition" });\
      award.status = "VERIFIED";\
      award.awardItems.forEach(i => i.status = "VERIFIED");\
      award.verifiedBy = user.email;\
      award.verifiedAt = now;\
      award.updatedAt = now;\
      logAudit(user, award.projectId, award.id, "AWARD_VERIFIED", "Verified award");\
    } else if (action === "return") {\
      if (award.status !== "SUBMITTED") return res.status(400).json({ error: "Invalid transition" });\
      if (!remarks) return res.status(400).json({ error: "Remarks required" });\
      award.status = "RETURNED";\
      award.awardItems.forEach(i => i.status = "RETURNED");\
      award.remarks = remarks;\
      award.updatedAt = now;\
      logAudit(user, award.projectId, award.id, "AWARD_RETURNED", "Returned award: " + remarks);\
    } else if (action === "approve") {\
      if (award.status !== "VERIFIED") return res.status(400).json({ error: "Invalid transition" });\
      award.status = "APPROVED";\
      award.awardItems.forEach(i => i.status = "APPROVED");\
      award.approvedBy = user.email;\
      award.approvedAt = now;\
      award.updatedAt = now;\
      logAudit(user, award.projectId, award.id, "AWARD_APPROVED", "Approved award");\
    } else if (action === "reject") {\
      if (award.status !== "VERIFIED") return res.status(400).json({ error: "Invalid transition" });\
      if (!rejectionReason) return res.status(400).json({ error: "REJECTION_REASON_REQUIRED" });\
      award.status = "REJECTED";\
      award.awardItems.forEach(i => i.status = "REJECTED");\
      award.rejectedBy = user.email;\
      award.rejectedAt = now;\
      award.rejectionReason = rejectionReason;\
      award.updatedAt = now;\
      logAudit(user, award.projectId, award.id, "AWARD_REJECTED", "Rejected award: " + rejectionReason);\
    } else if (action === "issue") {\
      if (award.status !== "APPROVED") return res.status(400).json({ error: "Invalid transition" });\
      award.status = "ISSUED";\
      award.issueDate = new Date().toISOString().split("T")[0];\
      award.awardItems.forEach(i => i.status = "ISSUED");\
      award.issuedBy = user.email;\
      award.issuedAt = now;\
      award.updatedAt = now;\
      logAudit(user, award.projectId, award.id, "AWARD_ISSUED", "Issued award");\
    } else {\
      return res.status(400).json({ error: "Unknown action" });\
    }\
    res.json(award);\
  });' server.ts
