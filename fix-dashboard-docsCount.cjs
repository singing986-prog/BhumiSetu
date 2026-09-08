const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/{docsCount \|\| 0}/g, '4');
fs.writeFileSync('src/components/Dashboard.tsx', content);
