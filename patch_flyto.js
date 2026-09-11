import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(/mapRef\.current\.flyTo/g, 'mapRef.current?.getMap()?.flyTo');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched flyTo");
