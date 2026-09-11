import fs from 'fs';
let code = fs.readFileSync('src/components/MapView.tsx', 'utf8');

if (!code.includes('import { FilterBar }')) {
  code = code.replace(
    'import { GISMap } from "./Map";',
    'import { GISMap } from "./Map";\nimport { FilterBar } from "./Dashboard";\nimport { useState } from "react";\nimport { Search, X } from "lucide-react";'
  );
}

// Add state for showing filters
code = code.replace(
  'export function MapView({ profile,',
  'export function MapView({ profile, setSelectedState, setSelectedDistrict, setSearchQuery, setSelectedStage, setSelectedCategory, setSelectedRisk,'
);

// We need to inject the filter bar toggle.
const replaceBlock = `
export function MapView({ profile, selectedState, setSelectedState, selectedDistrict, setSelectedDistrict, searchQuery, setSearchQuery, selectedProject, setSelectedProject, selectedStage, setSelectedStage, selectedCategory, setSelectedCategory, selectedRisk, setSelectedRisk }: any) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSearchQuery) setSearchQuery(localSearch);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0 relative">
      <div className="px-8 py-4 border-b border-graticule-teal/30 bg-white flex justify-between items-center shrink-0 z-20">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <MapIcon className="w-6 h-6 text-tilled-earth" />
            GIS Map View
          </h2>
          <p className="text-registry-ink/60 text-sm">Interactive spatial visualization of corridors and affected land parcels.</p>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-registry-ink/40" />
            <input 
              type="text" 
              placeholder="Search ULPIN, Project..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal"
            />
            {localSearch && (
               <button type="button" onClick={() => { setLocalSearch(""); if(setSearchQuery) setSearchQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-registry-ink/40 hover:text-registry-ink"><X className="w-3 h-3" /></button>
            )}
          </form>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={\`px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-medium transition-colors \${showFilters ? 'bg-tilled-earth text-white' : 'bg-graticule-teal/10 text-registry-ink hover:bg-graticule-teal/20'}\`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white border-b border-graticule-teal/30 z-20 relative shadow-md">
          <FilterBar 
             profile={profile}
             selectedState={selectedState} setSelectedState={setSelectedState}
             selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}
             selectedProject={selectedProject} setSelectedProject={setSelectedProject}
             searchQuery={searchQuery} setSearchQuery={setSearchQuery}
             selectedStage={selectedStage} setSelectedStage={setSelectedStage}
             selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
             selectedRisk={selectedRisk} setSelectedRisk={setSelectedRisk}
          />
        </div>
      )}

      <div className="flex flex-1 min-h-0 relative z-10">
        <GISMap showSidebar={true} profile={profile} selectedState={selectedState} selectedDistrict={selectedDistrict} searchQuery={searchQuery} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />
      </div>
    </div>
  );
}
`;

code = code.replace(/export function MapView.*\{[\s\S]*?\n\}/, replaceBlock);
fs.writeFileSync('src/components/MapView.tsx', code);
console.log("Patched MapView.tsx with Search and Filter tools");
