const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The Workflow tracker needs to calculate 5 year limit for Sec 24(2)
content = content.replace(
  'const contextLabel = selectedProject !== "All Projects" ? `Project ${selectedProject.split(\'-\').pop()}` : (selectedDistrict !== "All Districts" ? `${selectedDistrict} Aggregate` : `${selectedState} Aggregate`);',
  `const contextLabel = selectedProject !== "All Projects" ? \`Project \${selectedProject.split('-').pop()}\` : (selectedDistrict !== "All Districts" ? \`\${selectedDistrict} Aggregate\` : \`\${selectedState} Aggregate\`);

  // Mock Sec 24(2) check: If stage 3 (Award) is > 5 years old and Stage 4/5 are pending
  const checkLapse = () => {
    const award = stages.find(s => s.id === 3);
    const comp = stages.find(s => s.id === 4);
    const poss = stages.find(s => s.id === 5);
    
    // Check if we are simulating the lapse risk project
    if (selectedProject === "PRJ-2026-003" || (award?.date && award.date.includes("2019") && comp?.status === "pending")) {
      return true;
    }
    return false;
  };
  const isLapseRisk = checkLapse();`
);

content = content.replace(
  '<div className="px-3 py-1 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5">\n          <AlertCircle className="w-3.5 h-3.5" />\n          Award Deadline Risk\n        </div>',
  `{isLapseRisk ? (
          <div className="px-3 py-1 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer hover:bg-alluvium-red/20 transition-colors" title="Section 24(2) Triggered: Award > 5 years with pending compensation/possession">
            <AlertCircle className="w-3.5 h-3.5" />
            Section 24(2) Lapse Risk
          </div>
        ) : (
          <div className="px-3 py-1 bg-tilled-earth/10 text-tilled-earth border border-tilled-earth/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5" title="Statutory Milestone Risk">
            <AlertCircle className="w-3.5 h-3.5" />
            Award Deadline Risk
          </div>
        )}`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
