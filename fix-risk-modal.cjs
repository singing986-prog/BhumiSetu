const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const modal = `
      {activePlan && (
        <div className="fixed inset-0 bg-registry-ink/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif text-lg font-semibold text-registry-ink">Intervention Plan</h3>
              <button onClick={() => setActivePlan(null)} className="text-registry-ink/60 hover:text-registry-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="font-medium text-registry-ink mb-4">{activePlan.projectName || activePlan.name || "Western Dedicated Freight Corridor Phase 3"}</h4>
              <p className="text-sm text-registry-ink/80 mb-4">Risk Level: <strong>{activePlan.level || "High"}</strong> (Score: {activePlan.score || 85})</p>
              <div className="space-y-4">
                <div className="bg-alluvium-red/5 border border-alluvium-red/20 p-4 rounded-sm">
                  <h5 className="text-sm font-semibold text-alluvium-red mb-2">Recommended Actions:</h5>
                  <ul className="list-disc list-inside text-sm text-registry-ink/80 space-y-1">
                    <li>Schedule joint inspection with Revenue Dept.</li>
                    <li>Fast-track dispute resolution via Lok Adalat.</li>
                    <li>Escalate to District Collector for immediate review.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  '<button className="text-xs font-medium text-alluvium-red hover:underline mt-3">View intervention plan →</button>',
  '<button onClick={() => setActivePlan(risks[0])} className="text-xs font-medium text-alluvium-red hover:underline mt-3">View intervention plan →</button>'
);

// PredictiveRisk ends right before WorkflowTracker
const wfIdx = content.indexOf('export function WorkflowTracker');
if (wfIdx > -1) {
  const beforeWf = content.slice(0, wfIdx);
  const afterWf = content.slice(wfIdx);
  
  // The end of PredictiveRisk looks like:
  //     </div>
  //   );
  // }
  
  // We'll replace the last '    </div>\n  );\n}' with the modal + the ending.
  const replacement = modal + '\n    </div>\n  );\n}\n\n';
  const newBeforeWf = beforeWf.replace(/    <\/div>\s*?\);\s*?\}\s*?$/, replacement);
  
  fs.writeFileSync('src/components/Dashboard.tsx', newBeforeWf + afterWf);
}
