const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const wfStart = content.indexOf('export function WorkflowTracker');
if (wfStart === -1) {
  console.log("Could not find WorkflowTracker");
  process.exit(1);
}

const docsModalCode = `
      {showDocsModal && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[110] p-4" onClick={() => setShowDocsModal(false)}>
          <div className="bg-white rounded-sm shadow-xl w-full max-w-4xl flex flex-col border border-graticule-teal/30 overflow-hidden h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-graticule-teal/10 flex justify-between items-center bg-survey-paper/50">
              <h2 className="font-serif text-lg font-semibold text-registry-ink flex items-center gap-2">
                {activeWorkflowStage?.name} - {t("doc.drawerTitle", "Linked Documents")}
              </h2>
              <button onClick={() => setShowDocsModal(false)} className="text-registry-ink/40 hover:text-alluvium-red transition-colors outline-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-white p-6">
              {docsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tilled-earth"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-registry-ink/50 space-y-3">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p>{t("doc.noDocs", "No documents found")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="border border-graticule-teal/20 rounded-sm p-4 hover:border-graticule-teal/50 transition-colors flex flex-col h-full bg-survey-paper/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="p-2 bg-survey-paper rounded-sm shrink-0 border border-graticule-teal/10">
                            {doc.type === "Report" || doc.type === "Gazette" ? <FileText className="w-5 h-5 text-tilled-earth" /> : <File className="w-5 h-5 text-registry-ink/60" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-registry-ink truncate text-sm" title={doc.title}>{doc.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-registry-ink/60 mt-1 uppercase tracking-wider">
                              <span className="bg-graticule-teal/10 px-1.5 py-0.5 rounded-sm">{doc.type}</span>
                              <span>{doc.version}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 bg-cultivated-green/10 text-cultivated-green rounded-full shrink-0">
                          {doc.status}
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-graticule-teal/10 text-xs text-registry-ink/70 flex justify-between items-center">
                        <div>
                          <p>{t("doc.uploadedBy", "Uploaded By")}: <span className="font-medium text-registry-ink/90">{doc.uploadedBy}</span></p>
                          <p>{doc.uploadDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPreviewDoc(doc)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm hover:bg-graticule-teal/5 text-registry-ink transition-colors flex items-center gap-1.5 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                            {t("doc.preview", "Preview")}
                          </button>
                          <a href={doc.url} download className="px-3 py-1.5 bg-tilled-earth text-white rounded-sm hover:bg-tilled-earth/90 transition-colors flex items-center gap-1.5 cursor-pointer">
                            <Download className="w-3.5 h-3.5" />
                            {t("doc.download", "Download")}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {previewDoc && (
        <div className="fixed inset-0 bg-registry-ink/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4 md:p-8" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-sm shadow-2xl w-full h-full max-w-6xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-graticule-teal/20 flex justify-between items-center bg-registry-ink text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-graticule-teal" />
                <h3 className="font-serif text-lg">{previewDoc.title}</h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{previewDoc.version}</span>
              </div>
              <div className="flex items-center gap-4">
                <a href={previewDoc.url} download className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-sm">
                  <Download className="w-4 h-4" />
                  {t("doc.download", "Download")}
                </a>
                <button onClick={() => setPreviewDoc(null)} className="text-white/60 hover:text-white transition-colors outline-none cursor-pointer p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-survey-paper overflow-auto flex items-center justify-center p-8">
              {/* Document Preview Placeholder */}
              <div className="bg-white shadow-md border border-graticule-teal/10 w-full max-w-3xl aspect-[1/1.4] p-12 flex flex-col relative">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                   <div className="transform -rotate-45 text-6xl font-serif text-registry-ink font-bold whitespace-nowrap">BHOOMI-SETU PREVIEW</div>
                </div>
                
                {/* Header */}
                <div className="border-b-2 border-registry-ink/80 pb-6 mb-8 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-registry-ink mb-1">{previewDoc.type.toUpperCase()} DOCUMENT</h1>
                    <p className="text-sm text-registry-ink/60 font-mono">Ref: {previewDoc.checksum.substring(0,8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-registry-ink">{previewDoc.uploadedBy}</p>
                    <p className="text-sm text-registry-ink/70">{previewDoc.uploadDate}</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-6">{previewDoc.title.replace('.pdf', '').replace(/_/g, ' ')}</h2>
                  <div className="space-y-4 text-registry-ink/80 text-justify leading-relaxed">
                    <p>This document pertains to the land acquisition process under the RFCTLARR Act, 2013 for the designated project scope. The attached schedule specifies the exact parcels, survey numbers, and extents required for public purpose.</p>
                    
                    <p>In exercise of the powers conferred by the relevant sections of the Act, this notification/declaration/award serves as the official record of proceedings conducted on {previewDoc.uploadDate}.</p>
                    
                    <div className="my-8 p-4 bg-survey-paper/50 border border-graticule-teal/20 rounded-sm">
                       <h4 className="font-semibold mb-2">Summary of Records</h4>
                       <ul className="list-disc list-inside space-y-1 text-sm">
                         <li>Document Type: {previewDoc.type}</li>
                         <li>Status: {previewDoc.status}</li>
                         <li>Integrity Hash: <span className="font-mono">{previewDoc.checksum}</span></li>
                       </ul>
                    </div>
                    
                    <p>Verified and digitally signed by the competent authority. This is a system-generated preview and serves as a true copy of the original record available in the central repository.</p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-registry-ink/20 flex justify-between items-center text-sm text-registry-ink/60">
                   <p>Page 1 of 1</p>
                   <p>Generated by BhoomiSetu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  'const [activeWorkflowStage, setActiveWorkflowStage] = useState<any>(null);',
  `const [activeWorkflowStage, setActiveWorkflowStage] = useState<any>(null);
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
    
    fetch(\`/api/documents?state=\${encodeURIComponent(selectedState || '')}&project=\${encodeURIComponent(selectedProject || '')}&stage=\${encodeURIComponent(apiStage)}\`)
      .then(r => r.json())
      .then(data => {
        setDocuments(data);
        setDocsLoading(false);
      });
  };
`
);

content = content.replace(
  /<span className="font-medium text-tilled-earth cursor-pointer hover:underline">4 \{t\("nav\.documents"\)\} \{t\("stage\.view"\)\} &rarr;<\/span>/,
  '<button onClick={handleViewDocuments} className="font-medium text-tilled-earth cursor-pointer hover:underline outline-none text-left">{t("stage.view")} &rarr;</button>'
);

const renderWfEnd = content.indexOf('    </div>\n  );\n}\n', wfStart);
content = content.slice(0, renderWfEnd) + docsModalCode + content.slice(renderWfEnd);

// Add icons to import
content = content.replace(
  'import { Bell, Search, LayoutDashboard, FileText, Map as MapIcon, ChevronRight, X, User } from "lucide-react";',
  'import { Bell, Search, LayoutDashboard, FileText, Map as MapIcon, ChevronRight, X, User, File, Eye, Download } from "lucide-react";'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
