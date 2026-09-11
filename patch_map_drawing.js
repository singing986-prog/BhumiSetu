import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const drawToolsReplacement = `
        {activeTool === 'draw' && (
          <div className="absolute top-4 left-16 ml-2 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
            <div className="p-3 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-registry-ink text-sm">GIS Tools</h3>
              <button onClick={() => setActiveTool(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-2 grid grid-cols-4 gap-1 bg-white">
               <button onClick={() => handleDrawMode('simple_select')} className={\`p-2 flex justify-center items-center rounded-sm \${activeDrawMode === 'simple_select' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Select"><MousePointer2 className="w-4 h-4" /></button>
               <button onClick={() => handleDrawMode('draw_point')} className={\`p-2 flex justify-center items-center rounded-sm \${activeDrawMode === 'draw_point' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Draw Point"><MapPin className="w-4 h-4" /></button>
               <button onClick={() => handleDrawMode('draw_polygon')} className={\`p-2 flex justify-center items-center rounded-sm \${activeDrawMode === 'draw_polygon' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Draw Polygon"><Square className="w-4 h-4" /></button>
               <button onClick={() => handleDrawMode('direct_select')} className={\`p-2 flex justify-center items-center rounded-sm \${activeDrawMode === 'direct_select' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Edit Polygon"><Edit3 className="w-4 h-4" /></button>
               <button onClick={() => handleDrawMode('draw_line_string')} className={\`p-2 flex justify-center items-center rounded-sm \${activeDrawMode === 'draw_line_string' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Measure Distance"><Ruler className="w-4 h-4" /></button>
               <button onClick={() => drawRef.current?.trash()} className="p-2 flex justify-center items-center rounded-sm hover:bg-alluvium-red/10 text-alluvium-red" title="Delete Selected"><Trash2 className="w-4 h-4" /></button>
               <button onClick={() => { drawRef.current?.deleteAll(); setMeasurements(null); }} className="p-2 flex justify-center items-center rounded-sm hover:bg-alluvium-red/10 text-alluvium-red font-semibold text-xs col-span-2" title="Clear All">CLEAR</button>
            </div>
            {(measurements?.distance || measurements?.area) && (
              <div className="p-3 border-t border-graticule-teal/20 bg-survey-paper/30 text-xs font-medium text-registry-ink/80 flex flex-col gap-1">
                {measurements.distance && <div>Dist: {measurements.distance}</div>}
                {measurements.area && <div>Area: {measurements.area}</div>}
              </div>
            )}
            <div className="p-2 border-t border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center gap-4">
               {measurements?.area && selectedProject !== "All Projects" ? (
                 <button onClick={async () => {
                    const data = drawRef.current.getAll();
                    const feature = data.features[data.features.length - 1];
                    if (feature) {
                      try {
                        const res = await window.fetch("/api/parcels", {
                          method: "POST",
                          headers: { 
                             "Content-Type": "application/json",
                             "Authorization": "Bearer " + localStorage.getItem('bhoomi_token')
                          },
                          body: JSON.stringify({ 
                             geometry: feature.geometry, 
                             area: measurements.area, 
                             projectId: selectedProject,
                             ulpin: "Demo-ULPIN-" + Math.floor(100000 + Math.random()*900000) // Deterministic demo handled by backend, but we send fallback just in case
                          })
                        });
                        if (res.ok) {
                          loadParcels();
                          drawRef.current.deleteAll();
                          setMeasurements(null);
                        } else {
                           alert("Unauthorized or error saving parcel");
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }
                 }} 
                 className="text-xs font-medium text-white bg-tilled-earth px-2 py-1 rounded-sm cursor-pointer hover:bg-opacity-90 w-full text-center">
                   Save Parcel
                 </button>
               ) : (
                 <div className="text-xs text-registry-ink/50 text-center w-full">Select a project to save parcel</div>
               )}
            </div>
          </div>
        )}
`;

code = code.replace(/\{activeTool === 'draw' && \([\s\S]*?\n\s{8}\)\}/, drawToolsReplacement.trim());

if (!code.includes('MapPin')) {
  code = code.replace('import { Layers, PenTool, X, Trash2, MousePointer2, Square, Ruler } from "lucide-react";', 
    'import { Layers, PenTool, X, Trash2, MousePointer2, Square, Ruler, MapPin, Edit3 } from "lucide-react";');
}

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map drawing tools");
