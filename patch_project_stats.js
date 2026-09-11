import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const projectStats = `
          <div className="pt-6 border-t border-graticule-teal/20 mt-auto">
            <h4 className="text-xs font-semibold text-registry-ink/50 uppercase tracking-wider mb-3">Target Project</h4>
            <select 
              className="w-full bg-survey-paper border border-graticule-teal/30 p-2 text-sm rounded-sm text-registry-ink"
              value={selectedProject}
              onChange={(e) => setSelectedProject && setSelectedProject(e.target.value)}
            >
              <option value="All Projects">All Projects</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
            {selectedProject !== "All Projects" && gisLayers?.projectCorridors?.features?.[0] && (
              <div className="mt-4 p-3 bg-survey-paper/50 border border-graticule-teal/20 rounded-sm flex flex-col gap-2">
                <h5 className="text-xs font-semibold text-registry-ink">Footprint Analysis</h5>
                <div className="flex justify-between text-xs">
                  <span className="text-registry-ink/60">Estimated Area:</span>
                  <span className="font-medium text-registry-ink">
                    {projectsList.find(p => p.id === selectedProject)?.landRequirement || 0} ha
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-registry-ink/60">GIS Area:</span>
                  <span className="font-medium text-registry-ink">
                    {(turf.area(gisLayers.projectCorridors.features[0]) / 10000).toFixed(2)} ha
                  </span>
                </div>
                {(() => {
                  const est = parseFloat(projectsList.find(p => p.id === selectedProject)?.landRequirement) || 0;
                  const gis = turf.area(gisLayers.projectCorridors.features[0]) / 10000;
                  const diff = Math.abs(est - gis);
                  const pct = est > 0 ? (diff / est) * 100 : 0;
                  return pct > 10 ? (
                    <div className="text-[10px] text-alluvium-red font-medium mt-1 p-1 bg-alluvium-red/10 rounded-sm">
                      Warning: GIS footprint differs from estimate by {pct.toFixed(1)}%
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
`;

code = code.replace(/<div className="pt-6 border-t border-graticule-teal\/20 mt-auto">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/, projectStats.trim() + '\n        </div>\n      )}');
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map Project Stats");
