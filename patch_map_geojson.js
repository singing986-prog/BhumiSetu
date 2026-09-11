import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const geojsonBtn = `
              <hr className="border-graticule-teal/20 my-2" />
              
              <label className="text-left px-3 py-2 text-sm rounded hover:bg-graticule-teal/10 text-registry-ink cursor-pointer flex items-center gap-2">
                 <UploadCloud className="w-4 h-4" />
                 {t('Upload GeoJSON', 'Upload GeoJSON')}
                 <input type="file" className="hidden" accept=".geojson,.json" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                       try {
                          const json = JSON.parse(ev.target.result);
                          if(drawRef.current) {
                             drawRef.current.add(json);
                          }
                       } catch(err) {
                          alert(t('Invalid GeoJSON', 'Invalid GeoJSON'));
                       }
                    };
                    reader.readAsText(file);
                 }} />
              </label>
              
              <button onClick={async () => {
`;

code = code.replace(/<hr className="border-graticule-teal\/20 my-2" \/>\s*<button onClick=\{async \(\) => \{/, geojsonBtn);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched GeoJSON upload");
