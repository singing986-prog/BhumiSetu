import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const fitBtn = `
          <div className="p-4 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center shrink-0">
            <h3 className="font-serif font-semibold text-registry-ink truncate mr-2">
              {selectedFeature.ulpin ? \`ULPIN: \${selectedFeature.ulpin}\` : (selectedFeature.village || selectedFeature.name || "Feature Details")}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => {
                 const feat = parcels?.features?.find((f:any) => 
                   (f.properties.ulpin && f.properties.ulpin === selectedFeature.ulpin) || 
                   (f.properties.parcelId && f.properties.parcelId === selectedFeature.parcelId)
                 );
                 if (feat && mapRef.current) {
                   mapRef.current.fitBounds(turf.bbox(feat), { padding: 40, duration: 1000 });
                 }
              }} className="text-graticule-teal hover:text-tilled-earth" title="Fit to Parcel"><MapPin className="w-4 h-4" /></button>
              <button onClick={() => setSelectedFeature(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
          </div>
`;

code = code.replace(/<div className="p-4 border-b border-graticule-teal\/20 bg-survey-paper\/50 flex justify-between items-center shrink-0">[\s\S]*?<\/div>/, fitBtn.trim());
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map Parcel Fit bounds");
