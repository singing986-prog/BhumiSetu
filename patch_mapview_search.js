import fs from 'fs';
let code = fs.readFileSync('src/components/MapView.tsx', 'utf8');

const replacement = `
export function MapView({ profile, selectedState, setSelectedState, selectedDistrict, setSelectedDistrict, searchQuery, setSearchQuery, selectedProject, setSelectedProject, selectedStage, setSelectedStage, selectedCategory, setSelectedCategory, selectedRisk, setSelectedRisk }: any) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (val.length > 2) {
      try {
        const res = await window.fetch(\`/api/gis/search?q=\${encodeURIComponent(val)}\`, {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('bhoomi_token') }
        });
        if (res.ok) {
          setSearchResults(await res.json());
          setShowResults(true);
        }
      } catch (err) {}
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectResult = (r: any) => {
    if (r.type === 'project' && setSelectedProject) {
      setSelectedProject(r.id);
    } else if (r.type === 'parcel') {
      if (setSearchQuery) setSearchQuery(r.id);
    }
    setShowResults(false);
    setLocalSearch(r.title);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSearchQuery) setSearchQuery(localSearch);
    setShowResults(false);
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
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-registry-ink/40" />
              <input 
                type="text" 
                placeholder="Search ULPIN, Project, Village..." 
                value={localSearch}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal w-64"
              />
              {localSearch && (
                 <button type="button" onClick={() => { setLocalSearch(""); setSearchResults([]); setShowResults(false); if(setSearchQuery) setSearchQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-registry-ink/40 hover:text-registry-ink"><X className="w-3 h-3" /></button>
              )}
            </form>
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-graticule-teal/30 shadow-lg rounded-sm z-50 max-h-64 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <div key={i} onClick={() => handleSelectResult(r)} className="p-3 border-b border-graticule-teal/10 hover:bg-graticule-teal/5 cursor-pointer last:border-0">
                    <div className="text-sm font-medium text-registry-ink">{r.title}</div>
                    <div className="text-xs text-registry-ink/60">{r.type === 'project' ? 'Project' : 'Parcel'} • {r.subtitle}</div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchResults.length === 0 && localSearch.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-graticule-teal/30 shadow-lg rounded-sm z-50 p-3 text-sm text-registry-ink/60 text-center">
                No results found
              </div>
            )}
          </div>
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

code = code.replace(/export function MapView.*\{[\s\S]*?\n\}/, replacement);
fs.writeFileSync('src/components/MapView.tsx', code);
console.log("Patched MapView with search autocomplete");
