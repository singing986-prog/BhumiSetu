import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(
  '                     <div className="p-3 bg-white border-t border-graticule-teal/20 grid grid-cols-2 gap-2">',
  '                     </div>\n                     <div className="p-3 bg-white border-t border-graticule-teal/20 grid grid-cols-2 gap-2">'
);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched missing div");
