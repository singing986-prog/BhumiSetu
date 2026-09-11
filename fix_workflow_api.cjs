const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldWorkflowStr = `  app.get("/api/workflow", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user);
    if (projs.length === 0) return res.json([]);
    const p = projs[0]; // If multiple, just use first for workflow state or aggregate. To be proper, if multiple, it's aggregate. But let's just use the first project for now as it makes the most sense when drilling down.
    
    // Check overdue logic dynamically based on current date
    const stages = [
      { id: 1, name: "notification", status: p.stage === "Notification" ? "current" : "completed", date: p.dateSubmitted, authority: "District Collector", pendingActions: ["Review objections", "Publish in local newspaper"] },
      { id: 2, name: "declaration", status: p.stage === "Declaration" ? "current" : (["Award", "Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-03-15", authority: "State Government", pendingActions: ["Verify funds", "Issue Sec 19"] },
      { id: 3, name: "award", status: p.stage === "Award" ? "current" : (["Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-06-15", authority: "Collector", pendingActions: ["Determine market value", "Hear claims"] },
      { id: 4, name: "compensation", status: p.stage === "Compensation" ? "current" : (["Possession", "R&R"].includes(p.stage) ? "completed" : "pending"), date: "Pending · Due 2026-08-01", authority: "CALA", pendingActions: ["Disburse DBT", "Collect bank details"] },
      { id: 5, name: "possession", status: p.stage === "Possession" ? "current" : (p.stage === "R&R" ? "completed" : "pending"), date: "Pending · Due 2026-10-15", authority: "Executive Engineer", pendingActions: ["Take physical possession", "Update land records"] },
      { id: 6, name: "rnr", status: p.stage === "R&R" ? "current" : "pending", date: "Pending · Due 2027-01-01", authority: "R&R Commissioner", pendingActions: ["Allot housing", "Pay livelihood allowance"] }
    ];
    res.json(stages);
  });`;

const newWorkflowStr = `  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  function calculateDeadline(status, statutoryDeadline, actualDate) {
    if (status === 'completed' && actualDate) {
       return { display: \`Completed · \${actualDate}\`, status: 'COMPLETED' };
    }
    const today = new Date();
    const deadline = new Date(statutoryDeadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
       return { display: \`\${Math.abs(diffDays)} days overdue\`, status: 'OVERDUE', daysOverdue: Math.abs(diffDays) };
    } else if (diffDays === 0) {
       return { display: \`Due today\`, status: 'DUE_TODAY', daysRemaining: 0 };
    } else if (diffDays <= 14) {
       return { display: \`Due in \${diffDays} days\`, status: 'DUE_SOON', daysRemaining: diffDays };
    } else {
       return { display: \`Pending · Due \${statutoryDeadline}\`, status: 'PENDING', daysRemaining: diffDays };
    }
  }

  app.get("/api/workflow", authenticateToken, (req, res) => {
    const projs = filterProjects(req.query, (req as any).user);
    if (projs.length === 0) return res.json([]);
    const p = projs[0]; 
    
    const dDate = addDays(p.dateSubmitted, 180);
    const aDate = addDays(dDate, 365);
    const cDate = addDays(aDate, 90);
    const pDate = addDays(cDate, 60);
    const rDate = addDays(pDate, 180);

    const s1 = p.stage === "Notification" ? "current" : "completed";
    const s2 = p.stage === "Declaration" ? "current" : (["Award", "Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending");
    const s3 = p.stage === "Award" ? "current" : (["Compensation", "Possession", "R&R"].includes(p.stage) ? "completed" : "pending");
    const s4 = p.stage === "Compensation" ? "current" : (["Possession", "R&R"].includes(p.stage) ? "completed" : "pending");
    const s5 = p.stage === "Possession" ? "current" : (p.stage === "R&R" ? "completed" : "pending");
    const s6 = p.stage === "R&R" ? "current" : "pending";

    const stages = [
      { id: 1, name: "notification", status: s1, statutoryDeadline: p.dateSubmitted, actualDate: s1 === 'completed' ? p.dateSubmitted : null, ...calculateDeadline(s1, p.dateSubmitted, s1 === 'completed' ? p.dateSubmitted : null), authority: "District Collector", pendingActions: s1 === 'current' ? [{ id: 'rev_obj', name: "Review objections", actionType: 'modal' }] : [] },
      { id: 2, name: "declaration", status: s2, statutoryDeadline: dDate, actualDate: s2 === 'completed' ? dDate : null, ...calculateDeadline(s2, dDate, s2 === 'completed' ? dDate : null), authority: "State Government", pendingActions: s2 === 'current' ? [{ id: 'iss_sec19', name: "Issue Sec 19", actionType: 'modal' }] : [] },
      { id: 3, name: "award", status: s3, statutoryDeadline: aDate, actualDate: s3 === 'completed' ? aDate : null, ...calculateDeadline(s3, aDate, s3 === 'completed' ? aDate : null), authority: "Collector", pendingActions: s3 === 'current' ? [{ id: 'det_val', name: "Determine market value", actionType: 'modal' }] : [] },
      { id: 4, name: "compensation", status: s4, statutoryDeadline: cDate, actualDate: s4 === 'completed' ? cDate : null, ...calculateDeadline(s4, cDate, s4 === 'completed' ? cDate : null), authority: "CALA", pendingActions: s4 === 'current' ? [{ id: 'dis_dbt', name: "Disburse DBT", actionType: 'modal' }] : [] },
      { id: 5, name: "possession", status: s5, statutoryDeadline: pDate, actualDate: s5 === 'completed' ? pDate : null, ...calculateDeadline(s5, pDate, s5 === 'completed' ? pDate : null), authority: "Executive Engineer", pendingActions: s5 === 'current' ? [{ id: 'tak_pos', name: "Take physical possession", actionType: 'modal' }] : [] },
      { id: 6, name: "rnr", status: s6, statutoryDeadline: rDate, actualDate: s6 === 'completed' ? rDate : null, ...calculateDeadline(s6, rDate, s6 === 'completed' ? rDate : null), authority: "R&R Commissioner", pendingActions: s6 === 'current' ? [{ id: 'all_hou', name: "Allot housing", actionType: 'modal' }] : [] }
    ];
    res.json(stages);
  });`;

code = code.replace(oldWorkflowStr, newWorkflowStr);
fs.writeFileSync('server.ts', code);
