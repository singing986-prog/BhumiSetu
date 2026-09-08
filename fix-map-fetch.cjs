const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');
content = content.replace(
  'fetch(`/api/parcels?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)',
  'fetch(`/api/parcels?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject || "All Projects")}&stage=${encodeURIComponent(selectedStage || "All Stages")}&category=${encodeURIComponent(selectedCategory || "All Categories")}&risk=${encodeURIComponent(selectedRisk || "All Risks")}`)'
);
content = content.replace(
  '}, [selectedState, selectedDistrict]);',
  '}, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);'
);
fs.writeFileSync('src/components/Map.tsx', content);
