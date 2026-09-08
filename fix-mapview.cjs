const fs = require('fs');
let content = fs.readFileSync('src/components/MapView.tsx', 'utf8');
content = content.replace(
  'export function MapView({ selectedState, selectedDistrict }: { selectedState?: string, selectedDistrict?: string }) {',
  'export function MapView({ selectedState, selectedDistrict, searchQuery, selectedProject, selectedStage, selectedCategory, selectedRisk }: any) {'
);
content = content.replace(
  '<GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} />',
  '<GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} searchQuery={searchQuery} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />'
);
fs.writeFileSync('src/components/MapView.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '{activeTab === "map" && <MapView selectedState={selectedState} selectedDistrict={selectedDistrict} />}',
  '{activeTab === "map" && <MapView selectedState={selectedState} selectedDistrict={selectedDistrict} searchQuery={searchQuery} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />}'
);
fs.writeFileSync('src/App.tsx', appContent);
