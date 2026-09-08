const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const [selectedDistrict, setSelectedDistrict] = useState("All Districts");',
  'const [selectedDistrict, setSelectedDistrict] = useState("All Districts");\n  const [selectedProject, setSelectedProject] = useState("All Projects");\n  const [searchQuery, setSearchQuery] = useState("");'
);

content = content.replace(
  '<FilterBar selectedState={selectedState} selectedDistrict={selectedDistrict} />',
  '<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />'
);

fs.writeFileSync('src/App.tsx', content);
