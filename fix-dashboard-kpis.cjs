const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'export function KPILedger({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {',
  'export function KPILedger({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {'
);

content = content.replace(
  'fetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)',
  'fetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`)'
);

// We need to fetch and set metrics. Wait, does App.tsx pass all these? No, FilterBar needs to lift all these state variables to App.tsx.
fs.writeFileSync('src/components/Dashboard.tsx', content);
