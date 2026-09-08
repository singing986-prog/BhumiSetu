const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  '], [selectedState, selectedDistrict]);',
  '], [selectedState, selectedDistrict, selectedStage, selectedCategory, selectedRisk]);'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
