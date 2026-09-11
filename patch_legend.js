import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const legendLayer = `
      {/* Dynamic Legend */}
      <div className="absolute bottom-6 left-4 bg-white p-4 border border-graticule-teal/30 shadow-lg rounded-sm z-10">
        <h4 className="text-xs font-serif font-semibold text-registry-ink uppercase tracking-wider mb-3">Map Legend</h4>
        <div className="flex flex-col gap-2">
          {CANONICAL_LAYERS.filter(l => visibleLayers[l.id]).map(layer => {
            let color = '#ccc';
            let shape = 'square';
            if (layer.id === 'project-corridors') { color = '#D92D20'; shape = 'line'; }
            else if (layer.id === 'affected-parcels') { color = '#014A4E'; }
            else if (layer.id === 'revenue-village-boundaries') { color = '#F59E0B'; }
            else if (layer.id === 'eco-sensitive-zones') { color = '#22C55E'; }
            else if (layer.id === 'section-11-notification') { color = '#B44E23'; }
            else if (layer.id === 'award-possession') { color = '#014A4E'; }
            else if (layer.id === 'proposed-alignment') { color = '#3B82F6'; shape = 'line'; }
            
            return (
              <div key={layer.id} className="flex items-center gap-2">
                {shape === 'line' ? (
                  <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
                ) : (
                  <div className="w-3 h-3 rounded-sm opacity-60" style={{ backgroundColor: color }}></div>
                )}
                <span className="text-xs text-registry-ink">{layer.label}</span>
              </div>
            );
          })}
          {!Object.values(visibleLayers).some(v => v) && (
            <span className="text-xs text-registry-ink/50 italic">No active layers</span>
          )}
        </div>
      </div>

      {/* Floating Tools */}
`;

code = code.replace('{/* Floating Tools */}', legendLayer.trim());
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map Legend");
