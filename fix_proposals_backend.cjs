const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const validationLogic = `
function authorizeProposalAccess(user, proposal) {
  if (user.role === "Super Admin" || user.role === "Central Ministry Officer") return true;
  if (user.role === "State Nodal Officer") return proposal.state === user.state;
  if (user.role === "District LAO") return proposal.state === user.state && proposal.district === user.district;
  if (user.role === "Project Implementing Agency") {
    const uObj = demoUsers.find(u => u.id === user.id);
    return uObj && uObj.assignedProjects && uObj.assignedProjects.includes(proposal.id);
  }
  return false;
}

const VALID_STATES = ["Uttar Pradesh", "Haryana", "Maharashtra", "Karnataka"];
const VALID_DISTRICTS = {
  "Uttar Pradesh": ["Gautam Buddha Nagar", "Lucknow", "Kanpur"],
  "Haryana": ["Gurugram", "Nuh", "Karnal", "Panipat"],
  "Maharashtra": ["Pune", "Mumbai", "Thane"],
  "Karnataka": ["Bengaluru", "Mysuru"]
};
const VALID_MINISTRIES = ["MoRTH", "Ministry of Railways", "MoHUA", "MNRE", "MoUD", "MoCA"];
const VALID_CATEGORIES = ["Highway", "Rail", "Irrigation", "Industrial Corridor", "Urban Development", "Renewable Energy"];
`;

code = code.replace(/function filterProjects\(query, user\) \{/, validationLogic + '\nfunction filterProjects(query, user) {');

// Fix POST /api/proposals
const postProposalReplace = `
  app.post("/api/proposals", authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    // Validation
    const { projectName, category, ministry, state, district, areaRequired, implementingAgency, objective, action, footprint } = req.body;
    if (!projectName || projectName.trim().length === 0) return res.status(400).json({ error: "Project Name required", code: "ERR_INVALID_NAME" });
    if (!VALID_MINISTRIES.includes(ministry)) return res.status(400).json({ error: "Invalid ministry", code: "ERR_INVALID_MINISTRY" });
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category", code: "ERR_INVALID_CATEGORY" });
    if (!VALID_STATES.includes(state)) return res.status(400).json({ error: "Invalid state", code: "ERR_INVALID_STATE" });
    if (!VALID_DISTRICTS[state] || !VALID_DISTRICTS[state].includes(district)) return res.status(400).json({ error: "Invalid district for the selected state", code: "ERR_INVALID_DISTRICT" });
    if (areaRequired <= 0) return res.status(400).json({ error: "Invalid area" });

    // Validate scope for creation
    if (user.role === "State Nodal Officer" && user.state !== state) return res.status(403).json({ error: "Cannot create proposal outside your jurisdiction" });
    if (user.role === "District LAO" && (user.state !== state || user.district !== district)) return res.status(403).json({ error: "Cannot create proposal outside your jurisdiction" });
`;
code = code.replace(
  /app\.post\("\/api\/proposals", authenticateToken, \(req, res\) => \{[\s\S]*?if \(areaRequired <= 0\) return res\.status\(400\)\.json\(\{ error: "Invalid area" \}\);/,
  postProposalReplace
);

// Fix PUT /api/proposals/:id
const putProposalReplace = `
  app.put("/api/proposals/:id", authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const proposal = db.projects.find(p => p.id === req.params.id);
    if (!proposal) return res.status(404).json({ error: "Not found" });
    
    if (!authorizeProposalAccess(user, proposal)) return res.status(403).json({ error: "Unauthorized for this proposal" });
    
    if (proposal.status !== "Draft" && proposal.status !== "Returned for Correction" && proposal.status !== "Query Raised") {
       return res.status(400).json({ error: "Cannot edit proposal in current status" });
    }

    const { projectName, category, ministry, state, district, areaRequired, implementingAgency, objective, action, footprint } = req.body;
    
    if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category", code: "ERR_INVALID_CATEGORY" });
    if (ministry && !VALID_MINISTRIES.includes(ministry)) return res.status(400).json({ error: "Invalid ministry", code: "ERR_INVALID_MINISTRY" });
    if (state && !VALID_STATES.includes(state)) return res.status(400).json({ error: "Invalid state", code: "ERR_INVALID_STATE" });
    const finalState = state || proposal.state;
    const finalDistrict = district || proposal.district;
    if (district && (!VALID_DISTRICTS[finalState] || !VALID_DISTRICTS[finalState].includes(finalDistrict))) return res.status(400).json({ error: "Invalid district for the selected state", code: "ERR_INVALID_DISTRICT" });
`;
code = code.replace(
  /app\.put\("\/api\/proposals\/:id", authenticateToken, \(req, res\) => \{[\s\S]*?const \{ projectName, category, ministry, state, district, areaRequired, implementingAgency, objective, action, footprint \} = req\.body;/,
  putProposalReplace
);


// Fix POST /api/proposals/:id/workflow
const workflowReplace = `
  app.post("/api/proposals/:id/workflow", authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role === "Auditor" || user.role === "Affected Citizen" || user.role === "Field Surveyor") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const proposal = db.projects.find(p => p.id === req.params.id);
    if (!proposal) return res.status(404).json({ error: "Not found" });
    
    if (!authorizeProposalAccess(user, proposal)) return res.status(403).json({ error: "Unauthorized for this proposal" });

    const { actionId, remarks, deadline } = req.body;
    
    if (actionId === "REJECT" || actionId === "RETURN_FOR_CORRECTION") {
       if (!remarks || remarks.trim().length === 0) {
          return res.status(400).json({ error: "Reason is required", code: "ERR_REJECTION_REASON_REQUIRED" });
       }
    }

    const allowedTransitions = {
`;
code = code.replace(
  /app\.post\("\/api\/proposals\/:id\/workflow", authenticateToken, \(req, res\) => \{[\s\S]*?const allowedTransitions = \{/,
  workflowReplace
);

// Add Notification logic
const notificationLogic = `
function createNotification(user, type, title, message, entityId) {
    db.notifications = db.notifications || [];
    db.notifications.push({
        id: "NOTIF-" + Date.now() + Math.floor(Math.random() * 1000),
        recipientId: user.id, // For demo, assuming target is the current user or related role
        type,
        title,
        message,
        entityId,
        createdAt: new Date().toISOString(),
        read: false
    });
}
`;
code = code.replace(/function filterProjects\(query, user\) \{/, notificationLogic + '\nfunction filterProjects(query, user) {');

// Inject Notification creation on Workflow actions
code = code.replace(
  /db\.auditEvents\.push\(auditEvent\);\n\n    res\.json/g,
  `db.auditEvents.push(auditEvent);
    createNotification(user, actionId || action || "UPDATE", "Proposal Updated", remarks || \`Proposal \${proposal ? proposal.id : newId} updated to \${status || proposal.status}\`, proposal ? proposal.id : newId);
    res.json`
);

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts Proposal validation, RBAC, Enums, and Notifications");
