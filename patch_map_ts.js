import fs from 'fs';
let mapContent = fs.readFileSync('src/components/Map.tsx', 'utf-8');

mapContent = mapContent.replace(/const json = JSON\.parse\(ev\.target\.result\);/g, 
  'const json = JSON.parse(ev.target.result as string);');

fs.writeFileSync('src/components/Map.tsx', mapContent);
