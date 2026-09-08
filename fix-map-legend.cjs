const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I need to adjust Map component layout to allow the map to be 65-70% and the workflow risk to be 30-35%
// The current layout is flex-col lg:flex-row gap-6.
// The map div is flex-[2] (which is 66%), and the workflow div is flex-1 (which is 33%).
// This is already matching the requested 65-70% / 30-35% split.
// The main issue might be the height. Let's make it fixed height so we don't have to scroll down

content = content.replace(
  '<div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">',
  '<div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-h-[800px]">'
);

fs.writeFileSync('src/App.tsx', content);
