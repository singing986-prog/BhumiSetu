import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const drawPanel = `
        {activeTool === 'draw' && (
          <div className="absolute top-4 left-16 ml-2 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col w-64">
            <div className="p-3 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-registry-ink">{t('GIS Tools', 'GIS Tools')}</h3>
              <button onClick={() => setActiveTool(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <button onClick={() => handleDrawMode('draw_polygon')} className={"text-left px-3 py-2 text-sm rounded " + (activeDrawMode === 'draw_polygon' ? 'bg-graticule-teal/20 text-tilled-earth font-medium' : 'hover:bg-graticule-teal/10 text-registry-ink')}>{t('Draw Polygon', 'Draw Polygon')}</button>
              <button onClick={() => handleDrawMode('draw_line_string')} className={"text-left px-3 py-2 text-sm rounded " + (activeDrawMode === 'draw_line_string' ? 'bg-graticule-teal/20 text-tilled-earth font-medium' : 'hover:bg-graticule-teal/10 text-registry-ink')}>{t('Measure Distance', 'Measure Distance')}</button>
              <button onClick={() => { if(drawRef.current) { drawRef.current.deleteAll(); setMeasurements(null); setActiveDrawMode(null); } }} className="text-left px-3 py-2 text-sm rounded hover:bg-alluvium-red/10 text-alluvium-red">{t('Clear', 'Clear')}</button>
              
              <hr className="border-graticule-teal/20 my-2" />
              
              <button onClick={async () => {
                if(!drawRef.current) return;
                const data = drawRef.current.getAll();
                if(data.features.length === 0) return;
                const feat = data.features[data.features.length - 1];
                if(feat.geometry.type !== 'Polygon') {
                  alert(t('Only polygons can be saved as parcels.', 'Only polygons can be saved as parcels.'));
                  return;
                }
                const area = (turf.area(feat) / 10000).toFixed(2) + ' ha';
                
                try {
                  const url = feat.properties?.parcelId ? "/api/parcels/" + feat.properties.parcelId : "/api/parcels";
                  const method = feat.properties?.parcelId ? "PUT" : "POST";
                  
                  const res = await window.fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem('bhoomi_token') },
                    body: JSON.stringify({
                      projectId: selectedProject !== "All Projects" ? selectedProject : undefined,
                      geometry: feat.geometry,
                      area
                    })
                  });
                  if(res.ok) {
                    drawRef.current.deleteAll();
                    setMeasurements(null);
                    loadParcels();
                    setActiveTool(null);
                  } else {
                    alert(t('Error saving parcel', 'Error saving parcel'));
                  }
                } catch(e) { console.error(e); }
              }} className="px-3 py-2 bg-graticule-teal text-white rounded text-sm font-medium hover:bg-tilled-earth">{t('Save Parcel', 'Save Parcel')}</button>
            </div>
          </div>
        )}
`;

code = code.replace(/\{\/\* Floating Layers Panel \*\/\}/, drawPanel + '\n        {/* Floating Layers Panel */}');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map with draw tools");
