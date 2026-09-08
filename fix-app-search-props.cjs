const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />',
  '<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />'
);

fs.writeFileSync('src/App.tsx', content);
