import fs from 'fs';
let code = fs.readFileSync('src/components/MapView.tsx', 'utf8');

code = code.replace(
  'export function MapView({ profile, selectedState,',
  'export function MapView({ setActiveTab, profile, selectedState,'
);

code = code.replace(
  '<GISMap showSidebar={true} profile={profile}',
  '<GISMap setActiveTab={setActiveTab} showSidebar={true} profile={profile}'
);

fs.writeFileSync('src/components/MapView.tsx', code);
console.log("Patched MapView.tsx with setActiveTab");
