const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the pendingActions in /api/workflow
code = code.replace(
  /pendingActions: s1 as string === 'current' \? \[\{ id: 'rev_obj', name: "Review objections", actionType: 'modal' \}\] : \[\]/g,
  "pendingActions: s1 as string === 'current' ? [{ id: 'ADVANCE_TO_DECLARATION', name: 'Advance to Declaration', actionType: 'modal' }] : []"
);
code = code.replace(
  /pendingActions: s2 as string === 'current' \? \[\{ id: 'iss_sec19', name: "Issue Sec 19", actionType: 'modal' \}\] : \[\]/g,
  "pendingActions: s2 as string === 'current' ? [{ id: 'ADVANCE_TO_AWARD', name: 'Advance to Award', actionType: 'modal' }] : []"
);
code = code.replace(
  /pendingActions: s3 as string === 'current' \? \[\{ id: 'det_val', name: "Determine market value", actionType: 'modal' \}\] : \[\]/g,
  "pendingActions: s3 as string === 'current' ? [{ id: 'ADVANCE_TO_COMPENSATION', name: 'Advance to Compensation', actionType: 'modal' }] : []"
);
code = code.replace(
  /pendingActions: s4 as string === 'current' \? \[\{ id: 'dis_dbt', name: "Disburse DBT", actionType: 'modal' \}\] : \[\]/g,
  "pendingActions: s4 as string === 'current' ? [{ id: 'ADVANCE_TO_POSSESSION', name: 'Advance to Possession', actionType: 'modal' }] : []"
);
code = code.replace(
  /pendingActions: s5 as string === 'current' \? \[\{ id: 'tak_pos', name: "Take physical possession", actionType: 'modal' \}\] : \[\]/g,
  "pendingActions: s5 as string === 'current' ? [{ id: 'ADVANCE_TO_RNR', name: 'Advance to R&R', actionType: 'modal' }] : []"
);
code = code.replace(
  /pendingActions: s6 as string === 'current' \? \[\{ id: 'all_hou', name: "Allot housing", actionType: 'modal' \}\] : \[\]/g,
  "pendingActions: s6 as string === 'current' ? [{ id: 'CLOSE_ACQUISITION_STAGE', name: 'Close Acquisition Stage', actionType: 'modal' }] : []"
);

fs.writeFileSync('server.ts', code);
console.log("Updated workflow pending actions in API");
