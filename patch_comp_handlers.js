import fs from 'fs';
let compContent = fs.readFileSync('src/components/Compensation.tsx', 'utf-8');
compContent = compContent.replace(/const handleDeepLink = \(tab: string, comp: CompensationRecord\) => \{/, 
  'const handleDeepLink = (tab: string, comp: CompensationRecord) => {\n    if (setSelectedProject) setSelectedProject(comp.projectId);\n    if (tab === "map" && setSelectedParcelId) setSelectedParcelId(comp.parcelId);\n    if (setActiveTab) setActiveTab(tab);\n');

// Also remove the old handleDeepLink content
compContent = compContent.replace(/    setSelectedProject\(comp\.projectId\);\n    if\(tab === 'map'\) \{\n      setSelectedParcelId\(comp\.parcelId\);\n    \}\n    setActiveTab\(tab\);\n/g, '');

fs.writeFileSync('src/components/Compensation.tsx', compContent);
