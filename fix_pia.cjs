const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /db\.auditEvents\.push\(auditEvent\);\s*res\.json\(\{ success: true, proposal: newProposal, auditEvent \}\);/,
  `db.auditEvents.push(auditEvent);

    // If PIA, assign to them so they can see it
    if (user.role === "Project Implementing Agency") {
       const uObj = demoUsers.find(u => u.id === user.id);
       if (uObj) {
          uObj.assignedProjects = uObj.assignedProjects || [];
          uObj.assignedProjects.push(newId);
       }
    }

    res.json({ success: true, proposal: newProposal, auditEvent });`
);

fs.writeFileSync('server.ts', code);
console.log("Updated PIA logic");
