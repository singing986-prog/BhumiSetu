const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// We'll remove the <select> boxes from the TopNav
content = content.replace(
  /<div className="hidden md:flex items-center border border-graticule-teal\/30 rounded-sm bg-white overflow-hidden text-sm">[\s\S]*?<\/div>\s*<div className="flex items-center gap-4 border-l border-graticule-teal\/30 pl-6">/,
  '<div className="flex items-center gap-4 pl-6">'
);

fs.writeFileSync('src/components/Layout.tsx', content);
