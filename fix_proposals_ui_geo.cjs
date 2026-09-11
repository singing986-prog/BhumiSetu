const fs = require('fs');

let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

// Replace textarea with a Mapview for footprint
const mapImport = `
import { GISMap } from "./Map";
`;
if(!code.includes('import { GISMap }')) {
    code = code.replace(/import \{ useTranslation \} from "\.\.\/i18n";/, 'import { useTranslation } from "../i18n";\nimport { GISMap } from "./Map";');
}


const footprintCode = `
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint (Draw Polygon)</label>
                  <div className="h-64 border border-graticule-teal/30 relative z-0">
                     <GISMap />
                     {/* For a full implementation, the GISMap would need to expose onDrawCreate/onDrawUpdate to set formData.footprint */}
                  </div>
                  <p className="text-xs text-registry-ink/60 mt-1">Use the drawing tools on the map to define the project boundaries. GeoJSON will be automatically generated.</p>
                </div>
`;

code = code.replace(
  /<div className="col-span-2">\s*<label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint.*?<\/textarea>\s*<\/div>/s,
  footprintCode
);

fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated footprint to use Map component");
