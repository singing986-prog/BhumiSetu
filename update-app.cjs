const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<KPILedger />',
  '<KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />'
);

content = content.replace(
  '<WorkflowTracker />',
  '<WorkflowTracker selectedState={selectedState} selectedDistrict={selectedDistrict} />'
);

content = content.replace(
  '<PredictiveRisk />',
  '<PredictiveRisk selectedState={selectedState} selectedDistrict={selectedDistrict} />'
);

content = content.replace(
  '{activeTab === "proposals" && <Proposals />}',
  '{activeTab === "proposals" && <Proposals selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "compensation" && <Compensation />}',
  '{activeTab === "compensation" && <Compensation selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "rnr" && <RnR />}',
  '{activeTab === "rnr" && <RnR selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "documents" && <Documents />}',
  '{activeTab === "documents" && <Documents selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "alerts" && <AlertsPanel setActiveTab={setActiveTab} />}',
  '{activeTab === "alerts" && <AlertsPanel setActiveTab={setActiveTab} selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "awards" && <Awards />}',
  '{activeTab === "awards" && <Awards selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "reports" && <Reports />}',
  '{activeTab === "reports" && <Reports selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

content = content.replace(
  '{activeTab === "grievance" && <Grievances />}',
  '{activeTab === "grievance" && <Grievances selectedState={selectedState} selectedDistrict={selectedDistrict} />}'
);

fs.writeFileSync('src/App.tsx', content);
