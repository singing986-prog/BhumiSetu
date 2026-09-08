const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n  const [selectedStage, setSelectedStage] = useState("All Stages");\n  const [selectedCategory, setSelectedCategory] = useState("All Categories");\n  const [selectedRisk, setSelectedRisk] = useState("All Risks");'
);

appContent = appContent.replace(
  '<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />',
  '<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedStage={selectedStage} setSelectedStage={setSelectedStage} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedRisk={selectedRisk} setSelectedRisk={setSelectedRisk} />'
);

appContent = appContent.replace(
  '<KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />',
  '<KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />'
);

appContent = appContent.replace(
  '<WorkflowTracker selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} />',
  '<WorkflowTracker selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />'
);

appContent = appContent.replace(
  '<PredictiveRisk selectedState={selectedState} selectedDistrict={selectedDistrict} />',
  '<PredictiveRisk selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />'
);

appContent = appContent.replace(
  '<GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} isAutoSync={autoSync} searchQuery={searchQuery} />',
  '<GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} isAutoSync={autoSync} searchQuery={searchQuery} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />'
);

fs.writeFileSync('src/App.tsx', appContent);
