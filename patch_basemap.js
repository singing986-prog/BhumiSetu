import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const basemapStyle = `
  const [basemap, setBasemap] = useState<'carto' | 'satellite'>('carto');

  const satelliteStyle = {
    version: 8,
    sources: {
      esri: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri'
      }
    },
    layers: [{ id: 'satellite-basemap', type: 'raster', source: 'esri' }]
  };
`;

code = code.replace(/const \[activeTool, setActiveTool\] = useState<string \| null>\(null\);/, basemapStyle + '\n  const [activeTool, setActiveTool] = useState<string | null>(null);');

const mapStyleRender = `
          mapStyle={basemap === 'carto' ? (cartoRasterStyle as any) : (satelliteStyle as any)}
`;
code = code.replace(/mapStyle=\{cartoRasterStyle as any\}/, mapStyleRender.trim());

const basemapToggle = `
          {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
            <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={\`p-2 transition-colors \${activeTool === 'draw' ? 'bg-graticule-teal/20 text-alluvium-red' : 'hover:bg-graticule-teal/10 text-registry-ink'}\`} title="GIS Tools">
              <PenTool className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setBasemap(b => b === 'carto' ? 'satellite' : 'carto')} className="p-2 transition-colors hover:bg-graticule-teal/10 text-registry-ink" title="Toggle Basemap">
            <Globe className="w-5 h-5" />
          </button>
`;
code = code.replace(/\{profile\?\.role !== 'Auditor' && profile\?\.role !== 'Affected Citizen' && \([\s\S]*?<\/button>\n          \)\}/, basemapToggle.trim());

if (!code.includes('Globe')) {
  code = code.replace('UploadCloud, FileArchive } from "lucide-react";', 'UploadCloud, FileArchive, Globe } from "lucide-react";');
}

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map Basemap Switch");
