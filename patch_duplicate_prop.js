import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(/onSelectionChange=\{updateMeasurements\}/, '');
code = code.replace(/onActionable=\{updateMeasurements\}/, '');
code = code.replace(/onDelete=\{onDrawUpdate\}\s*onSelectionChange=\{onDrawUpdate\}/, 'onDelete={onDrawUpdate} onSelectionChange={() => { onDrawUpdate(null); updateMeasurements(); }} onActionable={updateMeasurements}');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched duplicate prop");
