const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Fix Map props
content = content.replace(
  'export default function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery = "" }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string }) {',
  'export default function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery = "", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {'
);

// We should also find where DrawControl is.
