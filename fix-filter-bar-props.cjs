const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const filterBarOld = `export function FilterBar({ 
  selectedState, setSelectedState, 
  selectedDistrict, setSelectedDistrict, 
  selectedProject, setSelectedProject,
  searchQuery, setSearchQuery
}: { `;

const filterBarNew = `export function FilterBar({ 
  selectedState, setSelectedState, 
  selectedDistrict, setSelectedDistrict, 
  selectedProject, setSelectedProject,
  searchQuery, setSearchQuery,
  selectedStage, setSelectedStage,
  selectedCategory, setSelectedCategory,
  selectedRisk, setSelectedRisk
}: { `;

content = content.replace(filterBarOld, filterBarNew);

fs.writeFileSync('src/components/Dashboard.tsx', content);
