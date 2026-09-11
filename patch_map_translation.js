import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const t = (key, val) => `{t('${key}', '${val}')}`;

code = code.replace(/Layers<\/h3>/g, t('Layers', 'Layers') + '</h3>');
code = code.replace(/Map Legend<\/h4>/g, t('Map Legend', 'Map Legend') + '</h4>');
code = code.replace(/No active layers<\/span>/g, t('No active layers', 'No active layers') + '</span>');
code = code.replace(/"Feature Details"/g, 't("Feature Details", "Feature Details")');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched translations in Map.tsx");
