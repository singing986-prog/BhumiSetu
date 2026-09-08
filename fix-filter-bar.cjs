const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// I need to update the FilterBar component to match the new Scope/Filter layout
const filterReplaceStart = 'export function FilterBar';
const filterReplaceEnd = 'export function PredictiveRisk';

const newFilter = `export function FilterBar({ 
  selectedState, setSelectedState, 
  selectedDistrict, setSelectedDistrict, 
  selectedProject, setSelectedProject 
}: { 
  selectedState: string, setSelectedState: (s: string) => void,
  selectedDistrict: string, setSelectedDistrict: (d: string) => void,
  selectedProject: string, setSelectedProject: (p: string) => void
}) {
  const [projects, setProjects] = useState<any[]>([]);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetch(\`/api/projects?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}\`)
      .then(r => r.json()).then(data => setProjects(data));
  }, [selectedState, selectedDistrict]);

  const stateDistricts: Record<string, string[]> = {
    "All States": ["All Districts"],
    "Delhi": ["All Districts", "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Haryana": ["All Districts", "Nuh", "Gurugram", "Faridabad", "Rohtak", "Hisar", "Ambala"],
    "Uttar Pradesh": ["All Districts", "Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Meerut"],
    "Maharashtra": ["All Districts", "Pune", "Mumbai", "Nashik", "Nagpur", "Thane"],
    "Tamil Nadu": ["All Districts", "Chennai", "Kanchipuram", "Coimbatore", "Madurai"]
  };
  const currentDistricts = stateDistricts[selectedState] || ["All Districts"];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length > 2) {
      fetch(\`/api/search?q=\${encodeURIComponent(val)}\`).then(r => r.json()).then(data => setSearchResults(data));
    } else {
      setSearchResults([]);
    }
  };

  const resetFilters = () => {
    setSelectedState("All States");
    setSelectedDistrict("All Districts");
    setSelectedProject("All Projects");
    setSearch("");
    setSearchResults([]);
  };

  return (
    <div className="bg-white border-b border-graticule-teal/30 p-4 flex flex-col gap-4 text-sm z-40 relative">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-registry-ink/60 uppercase tracking-wider text-[10px] w-12">Scope</span>
          <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict("All Districts"); setSelectedProject("All Projects"); }} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            {Object.keys(stateDistricts).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-graticule-teal/30">/</span>
          <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedProject("All Projects"); }} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer max-w-[150px]">
            {currentDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <span className="text-graticule-teal/30">/</span>
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer max-w-[200px] truncate">
            <option value="All Projects">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-graticule-teal/10 pt-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-registry-ink/60 uppercase tracking-wider text-[10px] w-12">Filter</span>
          <div className="relative">
            <input type="text" value={search} onChange={handleSearch} placeholder="Search ULPIN, Village, or Project..." className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none focus:border-graticule-teal w-64" />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-graticule-teal/30 shadow-lg rounded-sm overflow-hidden z-50">
                {searchResults.map((r, i) => (
                  <div key={i} className="px-3 py-2 hover:bg-graticule-teal/5 cursor-pointer border-b border-graticule-teal/10 last:border-0" onClick={() => { setSearch(r.name); setSearchResults([]); }}>
                    <div className="text-xs font-semibold text-registry-ink">{r.name}</div>
                    <div className="text-[10px] text-registry-ink/60">{r.type} • {r.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <select className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            <option>All Stages</option><option>Notification</option><option>Declaration</option><option>Award</option><option>Compensation</option><option>Possession</option><option>R&R</option>
          </select>
          <select className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            <option>All Categories</option><option>Highway</option><option>Rail</option><option>Irrigation</option><option>Industrial Corridor</option><option>Urban Development</option><option>Renewable Energy</option><option>Other</option>
          </select>
          <select className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            <option>All Risks</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <button onClick={resetFilters} className="px-3 py-1.5 text-xs text-graticule-teal hover:underline ml-auto">Reset Filters</button>
        </div>
      </div>
    </div>
  );
}

export function PredictiveRisk`;

content = content.replace(/export function FilterBar[\s\S]*?export function PredictiveRisk/, newFilter);
fs.writeFileSync('src/components/Dashboard.tsx', content);
