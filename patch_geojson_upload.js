import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const uploadBtn = `
               <label className="p-2 flex justify-center items-center rounded-sm hover:bg-graticule-teal/10 text-registry-ink cursor-pointer" title="Upload GeoJSON">
                 <UploadCloud className="w-4 h-4" />
                 <input type="file" accept=".json,.geojson" className="hidden" onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onload = (ev) => {
                       try {
                         const geojson = JSON.parse(ev.target?.result as string);
                         drawRef.current?.add(geojson);
                         alert("GeoJSON imported successfully");
                       } catch (err) {
                         alert("Invalid GeoJSON file");
                       }
                     };
                     reader.readAsText(file);
                   }
                   e.target.value = '';
                 }} />
               </label>
               <button onClick={() => alert('KML/Shapefile import NOT IMPLEMENTED in this demo environment.')} className="p-2 flex justify-center items-center rounded-sm hover:bg-graticule-teal/10 text-registry-ink cursor-pointer" title="Import KML/Shapefile">
                 <FileArchive className="w-4 h-4" />
               </button>
               <button onClick={() => drawRef.current?.trash()}
`;

if (!code.includes('UploadCloud')) {
  code = code.replace('<button onClick={() => drawRef.current?.trash()}', uploadBtn.trim());
  code = code.replace('import { Layers, PenTool, X, Trash2, MousePointer2, Square, Ruler, MapPin, Edit3 } from "lucide-react";', 
    'import { Layers, PenTool, X, Trash2, MousePointer2, Square, Ruler, MapPin, Edit3, UploadCloud, FileArchive } from "lucide-react";');
  fs.writeFileSync('src/components/Map.tsx', code);
  console.log("Patched Map GeoJSON upload");
}
