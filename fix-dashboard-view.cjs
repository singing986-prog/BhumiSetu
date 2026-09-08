const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />\n              <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">',
  `<FilterBar selectedState={selectedState} selectedDistrict={selectedDistrict} />
              <KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />
              <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">`
);

content = content.replace(
  'import { Grievances } from "./components/Grievance";',
  'import { Grievances } from "./components/Grievance";\nimport { FilterBar } from "./components/Dashboard";'
);

fs.writeFileSync('src/App.tsx', content);
