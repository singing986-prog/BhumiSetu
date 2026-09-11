const fs = require('fs');
let code = fs.readFileSync('src/components/Proposals.tsx', 'utf8');

// Add props
code = code.replace(
  /export function Proposals\(\{ profile, selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" \}: \{ profile\?: any, selectedState\?: string, selectedDistrict\?: string, selectedProject\?: string, selectedStage\?: string, selectedCategory\?: string, selectedRisk\?: string \}\) \{/,
  'export function Proposals({ profile, setActiveTab, setSelectedProject, selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { profile?: any, setActiveTab?: (t: string) => void, setSelectedProject?: (p: string) => void, selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {'
);

// Add action buttons to the detail view
const detailActions = `
           <div className="flex gap-4 mb-6 pt-6 border-t border-graticule-teal/30">
              <button onClick={() => { if (setSelectedProject) setSelectedProject(activeProposal.id); if (setActiveTab) setActiveTab("map"); }} className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/10">View on Map</button>
              <button onClick={() => { if (setSelectedProject) setSelectedProject(activeProposal.id); if (setActiveTab) setActiveTab("documents"); }} className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/10">View Documents</button>
              <button onClick={() => { if (setSelectedProject) setSelectedProject(activeProposal.id); if (setActiveTab) setActiveTab("dashboard"); }} className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/10">View Workflow</button>
           </div>
        </div>

        {activeProposal.scrutinyQuery && activeProposal.status === "Query Raised" && (
`;

code = code.replace(
  /<\/div>\s*\{activeProposal\.scrutinyQuery && activeProposal\.status === "Query Raised" && \(/,
  detailActions
);

fs.writeFileSync('src/components/Proposals.tsx', code);
console.log("Updated Proposals.tsx routing buttons");
