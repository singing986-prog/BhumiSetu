const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const workflowExecuteLogic = `
  app.post("/api/workflow/execute", authenticateToken, (req, res) => {
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Citizen") {
      return res.status(403).json({ error: "Unauthorized role for workflow execution" });
    }
    
    const { projectId, stage: frontendStage, actionId, remarks, documentId } = req.body;
    
    const projs = filterProjects({ project: projectId }, user);
    if (projs.length === 0) {
      return res.status(403).json({ error: "Project not accessible" });
    }
    
    const project = db.projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const currentStage = project.stage;
    
    const stageActions = {
      "Notification": ["SUBMIT_STATUTORY_REVIEW", "COMPLETE_NOTIFICATION_REVIEW", "ADVANCE_TO_DECLARATION"],
      "Declaration": ["VERIFY_OBJECTIONS", "SUBMIT_DECLARATION", "ADVANCE_TO_AWARD"],
      "Award": ["FINALIZE_AWARD", "RECORD_COMPENSATION_ASSESSMENT", "ADVANCE_TO_COMPENSATION"],
      "Compensation": ["INITIATE_DISBURSEMENT", "CONFIRM_COMPENSATION", "ADVANCE_TO_POSSESSION"],
      "Possession": ["RECORD_POSSESSION", "UPLOAD_POSSESSION_EVIDENCE", "ADVANCE_TO_RNR"],
      "R&R": ["UPDATE_ENTITLEMENT", "COMPLETE_RNR", "CLOSE_ACQUISITION_STAGE"]
    };
    
    const allowedActions = stageActions[currentStage] || [];
    
    if (!allowedActions.includes(actionId)) {
       // Log failed attempt
       const auditEvent = {
          id: "AUD-" + Date.now(),
          projectId,
          action: "WORKFLOW_ACTION_REJECTED",
          stage: currentStage,
          remarks: \`Attempted invalid action: \${actionId}\`,
          executedBy: user.username,
          timestamp: new Date().toISOString()
       };
       return res.status(400).json({ error: "ERR_INVALID_WORKFLOW_ACTION", auditEvent });
    }
    
    let newStage = currentStage;
    
    if (actionId.startsWith("ADVANCE_TO_")) {
       const stagesList = ["Notification", "Declaration", "Award", "Compensation", "Possession", "R&R"];
       const cIdx = stagesList.indexOf(currentStage);
       if (cIdx >= 0 && cIdx < stagesList.length - 1) {
          newStage = stagesList[cIdx + 1];
       } else {
          project.status = "Completed";
       }
    } else if (actionId === "CLOSE_ACQUISITION_STAGE") {
       project.status = "Completed";
    }
    
    project.stage = newStage;
    
    const auditEvent = {
       id: "AUD-" + Date.now(),
       projectId,
       action: actionId,
       stage: currentStage,
       newStage: newStage,
       remarks,
       documentId,
       executedBy: user.username,
       timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, message: "Workflow executed successfully", project, auditEvent });
  });
`;

code = code.replace(
  /app\.post\("\/api\/workflow\/execute"[\s\S]*?res\.json\(\{ success: true, message: "Workflow executed successfully", project, auditEvent \}\);\s*}\);/,
  workflowExecuteLogic.trim()
);

fs.writeFileSync('server.ts', code);
console.log("Updated workflow logic");
