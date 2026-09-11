import fs from 'fs';

const code = `
      <AnimatePresence>
         {selectedDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
               <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white border border-graticule-teal/30 shadow-2xl rounded-sm w-full max-w-5xl max-h-[90vh] flex flex-col">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-graticule-teal/30 flex justify-between items-start bg-survey-paper/50">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className="font-mono text-xs font-bold text-graticule-teal uppercase tracking-wider">{selectedDoc.id}</span>
                           <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase rounded-sm border bg-graticule-teal/10 text-graticule-teal border-graticule-teal/30">{selectedDoc.type}</span>
                        </div>
                        <h3 className="text-2xl font-serif text-registry-ink">{selectedDoc.title}</h3>
                        <p className="text-registry-ink/60 text-sm mt-1">{selectedDoc.fileName} • {selectedDoc.fileSize}</p>
                     </div>
                     <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-graticule-teal/10 rounded-sm text-registry-ink/60 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 bg-white">
                     
                     <div className="w-full md:w-2/3 space-y-8">
                        {/* Core Details */}
                        <section>
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Document Info</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <div><div className="text-[10px] uppercase text-registry-ink/50">Uploaded By</div><div className="text-sm">{selectedDoc.uploadedBy} ({selectedDoc.uploadedByRole})</div></div>
                              <div><div className="text-[10px] uppercase text-registry-ink/50">Uploaded At</div><div className="text-sm">{new Date(selectedDoc.uploadedAt).toLocaleString()}</div></div>
                              <div className="col-span-2">
                                 <div className="text-[10px] uppercase text-registry-ink/50">SHA-256 Checksum</div>
                                 <div className="font-mono text-xs text-registry-ink bg-survey-paper p-2 rounded-sm border border-graticule-teal/20 break-all">{selectedDoc.checksum}</div>
                              </div>
                           </div>
                        </section>

                        <section>
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Linkages</h4>
                           <div className="grid grid-cols-3 gap-4 mb-4">
                              {selectedDoc.projectId && <div><div className="text-[10px] uppercase text-registry-ink/50">Project</div><div className="font-mono text-sm">{selectedDoc.projectId}</div></div>}
                              {selectedDoc.parcelId && <div><div className="text-[10px] uppercase text-registry-ink/50">Parcel</div><div className="font-mono text-sm">{selectedDoc.parcelId}</div></div>}
                              {selectedDoc.ulpin && <div><div className="text-[10px] uppercase text-registry-ink/50">ULPIN</div><div className="font-mono text-sm">{selectedDoc.ulpin}</div></div>}
                              {selectedDoc.rnrId && <div><div className="text-[10px] uppercase text-registry-ink/50">R&R Case</div><div className="font-mono text-sm">{selectedDoc.rnrId}</div></div>}
                              {selectedDoc.compensationId && <div><div className="text-[10px] uppercase text-registry-ink/50">Compensation</div><div className="font-mono text-sm">{selectedDoc.compensationId}</div></div>}
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {selectedDoc.projectId && <button onClick={() => linkTo("projects", selectedDoc.projectId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Project</button>}
                              {selectedDoc.parcelId && <button onClick={() => linkTo("map", selectedDoc.projectId, selectedDoc.parcelId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><MapPin className="w-3 h-3"/> GIS</button>}
                              {selectedDoc.rnrId && <button onClick={() => linkTo("rnr", selectedDoc.projectId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><Landmark className="w-3 h-3"/> R&R Case</button>}
                              {selectedDoc.compensationId && <button onClick={() => linkTo("compensation", selectedDoc.projectId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><Landmark className="w-3 h-3"/> Compensation</button>}
                           </div>
                        </section>

                        <section>
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Status & Verification</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <div className="text-xs mb-1 text-registry-ink/60">Integrity Status</div>
                                 <div className={\`font-medium text-sm mb-1 \${selectedDoc.integrityStatus === "VERIFIED" ? "text-cultivated-green" : "text-alluvium-red"}\`}>{selectedDoc.integrityStatus.replace(/_/g, ' ')}</div>
                                 {selectedDoc.integrityStatus === "INTEGRITY_MISMATCH" && <div className="text-[10px] text-alluvium-red italic">The physical file hash does not match the database record. Tampering detected.</div>}
                              </div>
                              <div>
                                 <div className="text-xs mb-1 text-registry-ink/60">Digital Signature</div>
                                 <div className="font-medium text-sm mb-1">{selectedDoc.signatureStatus.replace(/_/g, ' ')}</div>
                                 <div className="text-[10px] text-registry-ink/50 italic">Cryptographically Verified Digital Signature unavailable in prototype.</div>
                              </div>
                           </div>
                        </section>
                     </div>

                     <div className="w-full md:w-1/3 flex flex-col gap-6 border-l border-graticule-teal/20 pl-6">
                        <div className="bg-survey-paper/50 p-4 border border-graticule-teal/30 rounded-sm">
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4">Actions</h4>
                           <div className="flex flex-col gap-2">
                              <button onClick={() => handleDownload(selectedDoc.id)} className="w-full py-2 bg-registry-ink text-white text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center justify-center gap-2"><Download className="w-4 h-4"/> Download File</button>
                              <button onClick={() => handlePreview(selectedDoc.id)} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors flex items-center justify-center gap-2"><FileText className="w-4 h-4"/> Preview (Browser)</button>
                              <button onClick={() => handleVerifyIntegrity(selectedDoc.id)} className="w-full py-2 bg-white border border-tilled-earth text-tilled-earth text-sm font-medium hover:bg-tilled-earth/5 transition-colors flex items-center justify-center gap-2"><FileCheck className="w-4 h-4"/> Verify Integrity</button>
                              {canUpload && (
                                 <button onClick={() => { setIsUploadVersion(true); setIsUploadOpen(true); }} className="w-full py-2 mt-4 bg-graticule-teal text-white text-sm font-medium hover:bg-graticule-teal/90 transition-colors flex items-center justify-center gap-2"><Upload className="w-4 h-4"/> Upload New Version</button>
                              )}
                           </div>
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col">
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 flex items-center gap-2"><History className="w-4 h-4"/> Version History</h4>
                           <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                              <div className="relative pl-4 border-l-2 border-cultivated-green pb-2">
                                 <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-cultivated-green"></div>
                                 <div className="text-xs font-bold text-registry-ink">Current: v{selectedDoc.version}</div>
                                 <div className="text-[10px] text-registry-ink/60">{new Date(selectedDoc.uploadedAt).toLocaleString()} • {selectedDoc.uploadedBy}</div>
                              </div>
                              {versions.length === 0 ? <p className="text-xs text-registry-ink/50 pl-4">No older versions.</p> : versions.map(v => (
                                 <div key={v.versionId} className="relative pl-4 border-l-2 border-graticule-teal/30 pb-2">
                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-graticule-teal/50"></div>
                                    <div className="text-xs font-bold text-registry-ink flex justify-between">v{v.version} <button onClick={() => handleDownload(selectedDoc.id, v.version)} className="text-graticule-teal hover:underline text-[10px]">Download</button></div>
                                    <div className="text-[10px] text-registry-ink/60">{new Date(v.uploadedAt).toLocaleString()} • {v.uploadedBy}</div>
                                    <div className="text-[8px] font-mono text-registry-ink/50 mt-1 truncate" title={v.checksum}>{v.checksum}</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
`;
fs.appendFileSync('src/components/Documents.tsx', code);
