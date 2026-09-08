const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} isAutoSync={autoSync} />',
  '<GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} isAutoSync={autoSync} searchQuery={searchQuery} />'
);

fs.writeFileSync('src/App.tsx', content);
