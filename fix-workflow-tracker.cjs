const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const workflowReplaceStart = 'export function WorkflowTracker';
const workflowReplaceEnd = '    </div>\n  );\n}';

const newWorkflow = `export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string }) {
  const { t } = useTranslation();
  const [stages, setStages] = useState<any[]>([
    { id: 1, name: t("workflow.notification"), status: "pending", date: "-" },
    { id: 2, name: t("workflow.declaration"), status: "pending", date: "-" },
    { id: 3, name: t("workflow.award"), status: "pending", date: "-" },
    { id: 4, name: t("workflow.compensation"), status: "pending", date: "-" },
    { id: 5, name: t("workflow.possession"), status: "pending", date: "-" },
    { id: 6, name: t("workflow.rnr"), status: "pending", date: "-" },
  ]);
  const [selectedStage, setSelectedStage] = useState<any>(null);

  useEffect(() => {
    fetch(\`/api/workflow?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject)}\`).then(r => r.json()).then(data => {
      setStages(data.map((s: any) => {
        // Fix dates to include year if missing
        let displayDate = s.date;
        if (displayDate.includes("Pending (Due:")) {
          displayDate = displayDate.replace("Pending (Due: ", "Pending · Due ").replace(")", " 2026");
        } else if (displayDate !== "-" && !displayDate.includes("2025") && !displayDate.includes("2026")) {
           displayDate = displayDate + " 2025";
        }
        return { ...s, name: t(\`workflow.\${s.name}\`), date: displayDate };
      }));
    });
  }, [selectedState, selectedDistrict, selectedProject, t]);

  const contextLabel = selectedProject !== "All Projects" ? \`Project \${selectedProject.split('-').pop()}\` : (selectedDistrict !== "All Districts" ? \`\${selectedDistrict} Aggregate\` : \`\${selectedState} Aggregate\`);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Workflow Tracker</h3>
          <p className="text-sm text-registry-ink/60 mt-1">{contextLabel} · Acquisition Lifecycle</p>
        </div>
        <div className="px-3 py-1 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Award Deadline Risk
        </div>
      </div>
      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex gap-4 pb-6 flex-1 cursor-pointer group" onClick={() => setSelectedStage(stage)}>
            {/* Connecting line */}
            {i !== stages.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2 group-hover:bg-graticule-teal transition-colors"></div>
            )}
            
            <div className="relative z-10 bg-white">
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-cultivated-green" />
              ) : stage.status === "current" ? (
                <div className="w-6 h-6 rounded-full border-2 border-tilled-earth flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-tilled-earth"></div>
                </div>
              ) : (
                <Circle className="w-6 h-6 text-graticule-teal/40 group-hover:text-graticule-teal transition-colors" />
              )}
            </div>
            
            <div className="-mt-1 group-hover:bg-graticule-teal/5 p-1 -ml-1 rounded-sm w-full transition-colors">
              <div className={\`font-medium \${stage.status === "pending" ? "text-registry-ink/50" : "text-registry-ink"}\`}>
                <span className="font-mono text-xs text-graticule-teal mr-2">{stage.id.toString().padStart(2, '0')}</span>
                {stage.name}
              </div>
              <div className={\`text-xs mt-0.5 \${stage.status === "current" ? "text-alluvium-red font-medium" : "text-registry-ink/60"}\`}>
                {stage.date}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedStage && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[100] p-4" onClick={() => setSelectedStage(null)}>
          <div className="bg-white rounded-sm shadow-lg w-full max-w-md flex flex-col border border-graticule-teal/30 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-graticule-teal/10 flex justify-between items-center bg-survey-paper/50">
              <h2 className="font-serif text-lg font-semibold text-registry-ink flex items-center gap-2">
                {selectedStage.name} Details
              </h2>
              <button onClick={() => setSelectedStage(null)} className="text-registry-ink/40 hover:text-alluvium-red transition-colors outline-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">Status</span>
                  <span className="font-medium capitalize">{selectedStage.status}</span>
                </div>
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">{selectedStage.status === "completed" ? "Completed On" : "Deadline"}</span>
                  <span className="font-medium">{selectedStage.date.replace("Pending · Due ", "")}</span>
                </div>
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">Responsible Authority</span>
                  <span className="font-medium">District LAO</span>
                </div>
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">Linked Documents</span>
                  <span className="font-medium text-tilled-earth cursor-pointer hover:underline">4 Documents View →</span>
                </div>
                <div className="pt-2">
                  <span className="text-registry-ink/60 block mb-2">Pending Actions</span>
                  <ul className="list-disc pl-5 text-registry-ink/80 space-y-1">
                    <li>Submit statutory review report</li>
                    <li>Verify remaining objections</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure X import is added if not present
`;

// we need to insert X to imports if missing, let's just let it be, X should be imported from lucide-react in Dashboard.tsx
// wait Dashboard.tsx imports CheckCircle2, Circle, AlertCircle
// Let's add X to it.

content = content.replace(
  'import { CheckCircle2, Circle, AlertCircle } from "lucide-react";',
  'import { CheckCircle2, Circle, AlertCircle, X } from "lucide-react";'
);

content = content.replace(/export function WorkflowTracker[\s\S]*?    <\/div>\n  \);\n}/, newWorkflow);
fs.writeFileSync('src/components/Dashboard.tsx', content);
