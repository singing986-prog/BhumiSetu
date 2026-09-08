const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />\n              <KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />\n              <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-h-[800px]">\n                <div className="flex-[2] flex flex-col bg-white border border-graticule-teal/30 relative min-h-[400px] shadow-sm">\n                  <GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} />\n                </div>\n                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">\n                  <WorkflowTracker selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} />\n                  <PredictiveRisk selectedState={selectedState} selectedDistrict={selectedDistrict} />\n                </div>\n              </div>',
  `<FilterBar selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
              <KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />
              <div className="flex-1 relative overflow-hidden bg-survey-paper">
                <div className="absolute inset-0 z-0">
                  <GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} searchQuery={searchQuery} />
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-96 bg-survey-paper/95 backdrop-blur-md border-l border-graticule-teal/30 shadow-2xl z-10 flex flex-col overflow-y-auto">
                  <WorkflowTracker selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} />
                  <PredictiveRisk selectedState={selectedState} selectedDistrict={selectedDistrict} />
                </div>
              </div>`
);

// We need to pass searchQuery to GISMap. We also need to extract it from FilterBar to App state.
// Wait, FilterBar has its own search state, let's lift it.
fs.writeFileSync('src/App.tsx', content);
