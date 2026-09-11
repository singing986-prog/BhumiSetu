const fs = require('fs');
let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

// Ensure the geometry update makes it into formData

const geojsCode = `
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint (Draw Polygon)</label>
                  <div className="h-64 border border-graticule-teal/30 relative z-0">
                     {/* The current GISMap component does not natively expose onDraw to parent, 
                         so we use a mock polygon selection for the hackathon/demo */}
                     <button type="button" onClick={() => setFormData({...formData, footprint: JSON.stringify({type: "Polygon", coordinates: [[[77.0, 28.5], [77.1, 28.5], [77.1, 28.6], [77.0, 28.6], [77.0, 28.5]]]})})} className="absolute top-2 left-2 z-10 px-4 py-2 bg-white border border-registry-ink text-sm font-medium shadow-sm hover:bg-graticule-teal/5">Simulate Drawing Footprint</button>
                     <GISMap />
                  </div>
                  <p className="text-xs text-registry-ink/60 mt-1">Use the drawing tools on the map to define the project boundaries. GeoJSON will be automatically generated.</p>
                  {formData.footprint && <div className="text-xs text-cultivated-green font-medium mt-1">Geometry captured successfully.</div>}
                </div>
`;

code = code.replace(
  /<div className="col-span-2">\s*<label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint.*?<\/textarea>\s*<\/div>/s,
  geojsCode
);

code = code.replace(
  /<div className="col-span-2">\s*<label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint \(Draw Polygon\)<\/label>[\s\S]*?<\/div>\s*<\/div>/,
  geojsCode + '\n</div>'
);

fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated GIS Footprint drawing UI");
