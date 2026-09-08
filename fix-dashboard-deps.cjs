const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Fix PredictiveRisk
content = content.replace(
  '}, [selectedState, selectedDistrict]);',
  '}, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);'
);

// Fix WorkflowTracker dependencies if they exist
content = content.replace(
  'useEffect(() => {\n    fetch(`/api/workflow',
  'useEffect(() => {\n    fetch(`/api/workflow'
); // Just checking where it is

fs.writeFileSync('src/components/Dashboard.tsx', content);
