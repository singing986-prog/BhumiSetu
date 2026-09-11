import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
  /<Documents [^>]*\/>/g,
  '<Documents selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} profile={profile} setActiveTab={setActiveTab} setSelectedProject={setSelectedProject} setSelectedParcelId={setSelectedParcelId} />'
);

fs.writeFileSync('src/App.tsx', app);
