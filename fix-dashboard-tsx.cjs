const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace('{/* @ts-ignore */}\n<File className="w-5 h-5 text-registry-ink/60" />}', '<File className="w-5 h-5 text-registry-ink/60" />}');

fs.writeFileSync('src/components/Dashboard.tsx', content);
