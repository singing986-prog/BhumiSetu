import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  '{activeTab === "map" && <div className="h-full w-full absolute inset-0"><MapView profile={profile} selectedState={selectedState} selectedDistrict={selectedDistrict} searchQuery={searchQuery} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} /></div>}',
  '{activeTab === "map" && <div className="h-full w-full absolute inset-0"><MapView profile={profile} selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedStage={selectedStage} setSelectedStage={setSelectedStage} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedRisk={selectedRisk} setSelectedRisk={setSelectedRisk} /></div>}'
);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx MapView props");
