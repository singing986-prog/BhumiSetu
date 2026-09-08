const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

content = content.replace(
  'fetch("/api/parcels")',
  'fetch(`/api/parcels?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)'
);

content = content.replace(
  '}, []);',
  '}, [selectedState, selectedDistrict]);'
);

fs.writeFileSync('src/components/Map.tsx', content);
