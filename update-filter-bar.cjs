const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'searchQuery?: string, setSearchQuery?: (q: string) => void\n}) {',
  'searchQuery?: string, setSearchQuery?: (q: string) => void,\n  selectedStage?: string, setSelectedStage?: (s: string) => void,\n  selectedCategory?: string, setSelectedCategory?: (c: string) => void,\n  selectedRisk?: string, setSelectedRisk?: (r: string) => void\n}) {'
);

content = content.replace(
  'const resetFilters = () => {\n    setSelectedState("All States");\n    setSelectedDistrict("All Districts");\n    setSelectedProject("All Projects");\n    if(setSearchQuery) setSearchQuery("");\n    setSearchResults([]);\n  };',
  'const resetFilters = () => {\n    setSelectedState("All States");\n    setSelectedDistrict("All Districts");\n    setSelectedProject("All Projects");\n    if(setSearchQuery) setSearchQuery("");\n    if(setSelectedStage) setSelectedStage("All Stages");\n    if(setSelectedCategory) setSelectedCategory("All Categories");\n    if(setSelectedRisk) setSelectedRisk("All Risks");\n    setSearchResults([]);\n  };'
);

content = content.replace(
  '<select className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">',
  '<select value={selectedStage} onChange={e => setSelectedStage && setSelectedStage(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">'
);

content = content.replace(
  '<select className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">',
  '<select value={selectedCategory} onChange={e => setSelectedCategory && setSelectedCategory(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">'
);

content = content.replace(
  '<select className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">',
  '<select value={selectedRisk} onChange={e => setSelectedRisk && setSelectedRisk(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">'
);

// We should also update PredictiveRisk props
content = content.replace(
  'export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {',
  'export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {'
);
content = content.replace(
  'fetch(`/api/risk?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`).then(r => r.json()).then(data => setRisks(data));',
  'fetch(`/api/risk?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`).then(r => r.json()).then(data => setRisks(data));'
);

// We should also update WorkflowTracker props
content = content.replace(
  'export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string }) {',
  'export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {'
);

content = content.replace(
  'fetch(`/api/workflow?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}`).then(r => r.json()).then(data => {',
  'fetch(`/api/workflow?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`).then(r => r.json()).then(data => {'
);


fs.writeFileSync('src/components/Dashboard.tsx', content);
