const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// TopNav no longer has the state/district dropdowns in the returned JSX (they are in FilterBar now), 
// but it still has the stateDistricts variables and handlers up top which reference missing props. Let's remove them.

const badCodeRegex = /const stateDistricts: Record<string, string\[\]> = \{[\s\S]*?const currentDistricts = stateDistricts\[selectedState\] \|\| \["All Districts"\];/;

content = content.replace(badCodeRegex, '');

fs.writeFileSync('src/components/Layout.tsx', content);
