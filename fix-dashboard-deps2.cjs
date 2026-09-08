const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  '}, [selectedState, selectedDistrict, selectedProject, t]);',
  '}, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk, t]);'
);

// Check KPILedger as well
content = content.replace(
  'fetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)',
  'fetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`)'
);

content = content.replace(
  '  }, [selectedState, selectedDistrict]); // Update when scope changes',
  '  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
