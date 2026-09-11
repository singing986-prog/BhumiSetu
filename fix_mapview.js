import fs from 'fs';
let content = fs.readFileSync('src/components/MapView.tsx', 'utf-8');
content = `import React from 'react';\n` + content;
fs.writeFileSync('src/components/MapView.tsx', content);
