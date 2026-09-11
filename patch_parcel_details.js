import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const detailsReplacement = `
      {/* Right Details Panel */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 bg-white w-80 border border-graticule-teal/30 shadow-lg rounded-sm z-10 flex flex-col max-h-[calc(100%-2rem)] overflow-hidden">
          <div className="p-4 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center shrink-0">
            <h3 className="font-serif font-semibold text-registry-ink truncate mr-2">
              {selectedFeature.ulpin ? \`ULPIN: \${selectedFeature.ulpin}\` : (selectedFeature.village || selectedFeature.name || "Feature Details")}
            </h3>
            <button onClick={() => setSelectedFeature(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-0 overflow-y-auto">
             {selectedFeature.ulpin || selectedFeature.parcelId ? (
                <div className="flex flex-col">
                   <div className="grid grid-cols-2 gap-x-2 gap-y-3 p-4 border-b border-graticule-teal/10">
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Parcel ID</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.parcelId || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Project ID</span><span className="text-sm font-medium text-registry-ink truncate" title={selectedFeature.projectId}>{selectedFeature.projectId || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">State</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.state || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">District</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.district || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Village</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.village || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Survey No.</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.surveyNumber || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Area</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.area || '-'}</span></div>
                   </div>
                   <div className="flex flex-col p-4 bg-survey-paper/20 gap-3">
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Acquisition Stage</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.stage || '-'}</span></div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Section 11</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.sec11 || '-'}</span></div>
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Award</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.award || '-'}</span></div>
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Possession</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.possession || '-'}</span></div>
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Compensation</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.compensationStatus || '-'}</span></div>
                     </div>
                   </div>
                </div>
             ) : (
                <div className="p-4 space-y-4">
                  {Object.entries(selectedFeature).map(([key, value]) => {
                    if (key === 'id') return null;
                    return (
                      <div key={key} className="flex flex-col gap-1 border-b border-graticule-teal/10 pb-2 last:border-0">
                        <span className="text-xs text-registry-ink/60 uppercase tracking-wide">{key}</span>
                        <span className="font-medium text-registry-ink break-words">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
             )}
          </div>
        </div>
      )}
`;

code = code.replace(/\{selectedFeature && \([\s\S]*?\n\s{8}\)\}/, detailsReplacement.trim());
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Parcel Details Panel");
