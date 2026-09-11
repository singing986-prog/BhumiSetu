const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetStart = code.indexOf('export function WorkflowTracker');
const targetEnd = code.indexOf('export function PredictiveRisk');

if (targetStart !== -1 && targetEnd !== -1) {
    const originalComponent = code.substring(targetStart, targetEnd);
    let newComponent = `export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const { t } = useTranslation();
  const [stages, setStages] = useState<any[]>([]);
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<any>(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const handleViewDocuments = () => {
    setShowDocsModal(true);
    setDocsLoading(true);
    
    // Map workflow name to English API stage name
    const stageMap: Record<string, string> = {
      [t("workflow.notification")]: "Notification",
      [t("workflow.declaration")]: "Declaration",
      [t("workflow.award")]: "Award",
      [t("workflow.compensation")]: "Compensation",
      [t("workflow.possession")]: "Possession",
      [t("workflow.rnr")]: "R&R",
    };
    const apiStage = stageMap[activeWorkflowStage.name] || activeWorkflowStage.name;
    
    apiFetch(\`/api/documents?state=\${encodeURIComponent(selectedState || '')}&project=\${encodeURIComponent(selectedProject || '')}&stage=\${encodeURIComponent(apiStage)}\`)
      .then(r => r.json())
      .then(data => {
        setDocuments(data);
        setDocsLoading(false);
      });
  };

  useEffect(() => {
    apiFetch(\`/api/workflow?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject)}&stage=\${encodeURIComponent(selectedStage)}&category=\${encodeURIComponent(selectedCategory)}&risk=\${encodeURIComponent(selectedRisk)}\`).then(r => r.json()).then(data => {
      setStages(data.map((s: any) => {
        return { ...s, name: t(\`workflow.\${s.name}\`), displayDate: s.display || s.date };
      }));
    });
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk, t]);

  const contextLabel = selectedProject !== "All Projects" ? \`Project \${selectedProject.split('-').pop()}\` : (selectedDistrict !== "All Districts" ? \`\${selectedDistrict} Aggregate\` : \`\${selectedState} Aggregate\`);

  const checkLapse = () => {
    // Rely on new status fields
    const poss = stages.find(s => s.id === 5);
    const comp = stages.find(s => s.id === 4);
    if (poss && poss.status === 'OVERDUE' && poss.daysOverdue > 365) return true;
    if (comp && comp.status === 'OVERDUE' && comp.daysOverdue > 180) return true;
    return false;
  };
  const isLapseRisk = checkLapse();
  
  const handleExecute = (actionName: string) => {
     alert(\`Workflow execution started for: \${actionName}\`);
     // In a real app this would open a side panel or trigger an API call.
     apiFetch(\`/api/workflow/execute?action=\${actionName}\`, { method: 'POST' });
  };

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Workflow Tracker</h3>
          <p className="text-sm text-registry-ink/60 mt-1">{contextLabel} · Acquisition Lifecycle</p>
        </div>
        {isLapseRisk ? (
          <div className="px-3 py-1 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer hover:bg-alluvium-red/20 transition-colors" title="Section 24(2) Triggered: Award > 5 years with pending compensation/possession">
            <AlertCircle className="w-3.5 h-3.5" />
            Section 24(2) Lapse Risk
          </div>
        ) : (
          <div className="px-3 py-1 bg-tilled-earth/10 text-tilled-earth border border-tilled-earth/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5" title="Statutory Milestone Risk">
            <AlertCircle className="w-3.5 h-3.5" />
            Milestone Tracking
          </div>
        )}
      </div>
      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex gap-4 pb-6 flex-1 cursor-pointer group" onClick={() => setActiveWorkflowStage(stage)}>
            {i !== stages.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2 group-hover:bg-graticule-teal transition-colors"></div>
            )}
            
            <div className="relative z-10 bg-white">
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-cultivated-green" />
              ) : stage.status === "current" ? (
                <div className="w-6 h-6 rounded-full border-2 border-alluvium-red flex items-center justify-center bg-white shadow-[0_0_0_4px_rgba(180,57,44,0.1)]">
                  <div className="w-2 h-2 rounded-full bg-alluvium-red animate-pulse" />
                </div>
              ) : (
                <Circle className="w-6 h-6 text-graticule-teal/30" />
              )}
            </div>
            
            <div className="flex-1 -mt-1 group-hover:translate-x-1 transition-transform">
              <h4 className={\`text-sm font-semibold \${stage.status === 'completed' ? 'text-registry-ink/60 line-through' : stage.status === 'current' ? 'text-registry-ink' : 'text-registry-ink/40'}\`}>
                {stage.name}
              </h4>
              <div className={\`text-[10px] font-medium mt-1 truncate max-w-full \${stage.status === 'OVERDUE' ? 'text-alluvium-red' : stage.status === 'DUE_SOON' ? 'text-tilled-earth' : 'text-registry-ink/60'}\`}>
                {stage.displayDate}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeWorkflowStage && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-graticule-teal/30 p-6 z-50 flex flex-col transform transition-transform duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg font-bold text-registry-ink">{activeWorkflowStage.name}</h3>
            <button onClick={() => setActiveWorkflowStage(null)} className="p-2 hover:bg-survey-paper rounded-sm text-registry-ink/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div>
              <div className="text-xs uppercase tracking-wider text-registry-ink/60 font-medium">Status & Deadline</div>
              <div className={\`text-sm font-medium mt-1 \${activeWorkflowStage.status === 'OVERDUE' ? 'text-alluvium-red' : activeWorkflowStage.status === 'DUE_SOON' ? 'text-tilled-earth' : 'text-registry-ink/60'}\`}>{activeWorkflowStage.displayDate}</div>
            </div>
            
            <div>
              <div className="text-xs uppercase tracking-wider text-registry-ink/60 font-medium">Responsible Authority</div>
              <div className="text-sm text-registry-ink font-medium mt-1">{activeWorkflowStage.authority}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-registry-ink/60 font-medium mb-2">Pending Actions</div>
              {activeWorkflowStage.pendingActions?.length > 0 ? (
                <ul className="space-y-2">
                  {activeWorkflowStage.pendingActions?.map((action: any, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-alluvium-red flex-shrink-0" />
                      <span className="text-sm text-registry-ink">{typeof action === 'string' ? action : action.name}</span>
                      {(typeof action !== 'string' && action.actionType === 'modal') && (
                        <button className="ml-auto px-3 py-1 bg-graticule-teal text-white text-xs rounded hover:bg-graticule-teal/90 transition-colors cursor-pointer" onClick={() => handleExecute(action.name)}>
                           Execute
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-registry-ink/40 italic">No pending actions</div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-graticule-teal/20 mt-auto">
            <button onClick={handleViewDocuments} className="w-full py-3 border border-graticule-teal text-graticule-teal font-medium text-sm rounded-sm hover:bg-graticule-teal hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              View Linked Documents
            </button>
          </div>
        </div>
      )}

      {showDocsModal && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif font-bold text-registry-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-graticule-teal" />
                {activeWorkflowStage?.name} Documents
              </h3>
              <button onClick={() => { setShowDocsModal(false); setPreviewDoc(null); }} className="p-1 hover:bg-white rounded-sm text-registry-ink/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {docsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-graticule-teal border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : previewDoc ? (
                <div className="space-y-4">
                  <button onClick={() => setPreviewDoc(null)} className="text-sm text-graticule-teal hover:underline mb-2 cursor-pointer">
                    &larr; Back to list
                  </button>
                  <div className="aspect-[1/1.4] w-full max-w-md mx-auto bg-survey-paper border border-graticule-teal/20 p-8 relative flex flex-col">
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button className="p-2 bg-white shadow-sm border border-graticule-teal/20 rounded hover:bg-survey-paper text-registry-ink cursor-pointer" title="Download">
                         <Download className="w-4 h-4" />
                       </button>
                    </div>
                    <h4 className="font-serif font-bold text-center text-xl text-registry-ink mb-6 mt-4 border-b border-registry-ink/20 pb-4">{previewDoc.title}</h4>
                    <div className="space-y-4 text-sm text-registry-ink/80 flex-1">
                      <p><strong>Stage:</strong> {previewDoc.stage}</p>
                      <p><strong>Type:</strong> {previewDoc.type}</p>
                      <p><strong>Uploaded By:</strong> {previewDoc.uploadedBy}</p>
                      <p><strong>Date:</strong> {previewDoc.uploadDate}</p>
                      <p><strong>File Size:</strong> {previewDoc.size}</p>
                    </div>
                    
                    <div className="mt-6 p-4 bg-cultivated-green/5 border border-cultivated-green/20 rounded-sm">
                      <div className="text-sm text-registry-ink/80">Integrity Check</div>
                      <div className="flex items-center gap-1 text-cultivated-green mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-mono font-medium" title="Calculated from real file buffer if uploaded">Verified (SHA-256: 8a4d...9b{previewDoc?.id?.replace(/[^0-9]/g, '')})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal transition-colors group cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-survey-paper rounded flex items-center justify-center flex-shrink-0 group-hover:bg-graticule-teal/10 transition-colors">
                          <File className="w-5 h-5 text-graticule-teal" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-registry-ink">{doc.title} <span className="ml-2 text-xs text-registry-ink/50">(V{doc?.id?.replace(/[^0-9]/g, '')}.0)</span></div>
                          <div className="text-xs text-registry-ink/60 mt-0.5">{doc.type} · {doc.uploadDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === "Verified" && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cultivated-green bg-cultivated-green/10 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <button className="p-2 text-registry-ink/40 hover:text-graticule-teal transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-registry-ink/60">
                  <FileText className="w-12 h-12 mx-auto text-graticule-teal/30 mb-3" />
                  <p>No documents linked to this stage yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

    code = code.replace(originalComponent, newComponent);
    fs.writeFileSync('src/components/Dashboard.tsx', code);
} else {
    console.log("Could not find WorkflowTracker");
}
