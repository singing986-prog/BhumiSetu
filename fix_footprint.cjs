const fs = require('fs');
let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

const footprintCode = `
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Estimated Area Required (Hectares) *</label>
                  <input required value={formData.areaRequired || ""} onChange={e => setFormData({...formData, areaRequired: e.target.value})} type="number" step="0.01" className="w-full md:w-1/2 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint (GeoJSON Geometry)</label>
                  <textarea placeholder='{"type": "Polygon", "coordinates": [...]}' value={formData.footprint || ""} onChange={e => setFormData({...formData, footprint: e.target.value})} className="w-full h-24 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50 font-mono text-xs" />
                </div>
`;

code = code.replace(
  /<div className="col-span-2">\s*<label className="block text-sm font-medium text-registry-ink mb-1">Estimated Area Required.*?<\/div>/s,
  footprintCode
);

fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated footprint");
