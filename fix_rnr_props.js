import fs from 'fs';
let content = fs.readFileSync('src/components/RnR.tsx', 'utf-8');

const searchStr = `export function RnR({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects", 
  profile,
  setActiveTab,
  setSelectedProject,
  setSelectedParcelId
}: { 
  selectedState?: string, 
  selectedDistrict?: string, 
  selectedProject?: string, 
  profile?: any,
  selectedStage?: string,
  selectedCategory?: string,
  selectedRisk?: string,
  setActiveTab?: (tab: string) => void,
  setSelectedProject?: (id: string) => void,
  setSelectedParcelId?: (id: string | null) => void
}) {`;

const fixedSearchStr = `export function RnR({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects", 
  selectedStage,
  selectedCategory,
  selectedRisk,
  profile,
  setActiveTab,
  setSelectedProject,
  setSelectedParcelId
}: { 
  selectedState?: string, 
  selectedDistrict?: string, 
  selectedProject?: string, 
  selectedStage?: string,
  selectedCategory?: string,
  selectedRisk?: string,
  profile?: any,
  setActiveTab?: (tab: string) => void,
  setSelectedProject?: (id: string) => void,
  setSelectedParcelId?: (id: string | null) => void
}) {`;

content = content.replace(/export function RnR\(\{[^]*?\}\) \{/m, fixedSearchStr);

fs.writeFileSync('src/components/RnR.tsx', content);
