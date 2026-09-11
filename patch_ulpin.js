import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(
  'ulpin: "Demo-ULPIN-" + Math.floor(100000 + Math.random()*900000)',
  'ulpin: "Demo-ULPIN-" + Date.now().toString().slice(-6)'
);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map ULPIN");
