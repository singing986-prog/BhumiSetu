const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// I will wire the toolbar buttons.
content = content.replace(
  'export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string }) {',
  `export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);`
);

content = content.replace(
  /<div className="absolute top-4 left-4 bg-white border border-graticule-teal\/30 shadow-md rounded-sm z-10 flex flex-col">[\s\S]*?<\/div>/,
  `<div className="absolute top-4 left-4 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
        <button onClick={() => setActiveTool(activeTool === 'layers' ? null : 'layers')} className={\`p-2 transition-colors border-b border-graticule-teal/20 \${activeTool === 'layers' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Layers" aria-label="Toggle Layers">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <button onClick={() => {
           // Search triggers focus on main search
           const searchInput = document.querySelector('input[placeholder*="Search"]');
           if (searchInput) (searchInput as HTMLElement).focus();
        }} className="p-2 hover:bg-graticule-teal/10 transition-colors border-b border-graticule-teal/20" title="Search Map" aria-label="Search Map">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={\`p-2 transition-colors border-b border-graticule-teal/20 \${activeTool === 'draw' ? 'bg-graticule-teal/20 text-alluvium-red' : 'hover:bg-graticule-teal/10'}\`} title="Draw/Measure" aria-label="Draw or Measure">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button onClick={() => {
           if (mapRef.current) {
             mapRef.current.getMap().getContainer().requestFullscreen().catch(err => console.log(err));
           }
        }} className="p-2 hover:bg-graticule-teal/10 transition-colors" title="Fullscreen" aria-label="Toggle Fullscreen">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>
      {activeTool === 'draw' && (
        <div className="absolute top-4 left-16 ml-2 bg-white px-4 py-2 border border-graticule-teal/30 shadow-md rounded-sm z-10 text-xs font-medium text-registry-ink flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-alluvium-red animate-pulse"></span>
           Drawing Mode Active. Click on map to drop vertices.
        </div>
      )}`
);

fs.writeFileSync('src/components/Map.tsx', content);
