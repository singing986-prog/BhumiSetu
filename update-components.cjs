const fs = require('fs');

const components = [
  'Alerts.tsx',
  'Proposals.tsx',
  'Compensation.tsx',
  'RnR.tsx',
  'Documents.tsx',
  'Awards.tsx',
  'Reports.tsx',
  'Grievance.tsx' // Wait, is it Grievance.tsx or Grievances.tsx? Let's check imports
];

for (const comp of components) {
  let file = 'src/components/' + comp;
  if (!fs.existsSync(file)) {
    console.log("File not found: " + file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  if (comp === 'Alerts.tsx') {
    content = content.replace(
      'export function AlertsPanel({ setActiveTab }: { setActiveTab: (tab: string) => void }) {',
      'export function AlertsPanel({ setActiveTab, selectedState = "All States", selectedDistrict = "All Districts" }: { setActiveTab: (tab: string) => void, selectedState?: string, selectedDistrict?: string }) {'
    );
  } else {
    // For others like export function Proposals() {
    content = content.replace(
      `export function ${comp.replace('.tsx', '').replace('Grievance', 'Grievances')}() {`,
      `export function ${comp.replace('.tsx', '').replace('Grievance', 'Grievances')}({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {`
    );
  }
  
  // Update fetch calls
  content = content.replace(
    /fetch\("(\/api\/[a-z]+)"\)/g,
    'fetch(`$1?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)'
  );
  
  // Update useEffect dependencies
  content = content.replace(
    /}, \[\]\);/g,
    '}, [selectedState, selectedDistrict]);'
  );
  
  fs.writeFileSync(file, content);
}
