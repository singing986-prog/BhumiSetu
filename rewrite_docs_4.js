import fs from 'fs';

const code = `
      <AnimatePresence>
         {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
               <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white border border-graticule-teal/30 shadow-2xl rounded-sm w-full max-w-2xl flex flex-col">
                  
                  <div className="p-6 border-b border-graticule-teal/30 flex justify-between items-center bg-survey-paper/50">
                     <h3 className="text-xl font-serif text-registry-ink">{isUploadVersion ? \`Upload New Version (v\${(parseFloat(selectedDoc!.version) + 1).toFixed(1)})\` : "Upload Document"}</h3>
                     <button onClick={() => { setIsUploadOpen(false); setUploadError(""); }} className="p-2 hover:bg-graticule-teal/10 rounded-sm text-registry-ink/60 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
                     {uploadError && <div className="p-3 bg-alluvium-red/10 border border-alluvium-red/30 text-alluvium-red text-sm rounded-sm">{uploadError}</div>}
                     
                     <div className="border-2 border-dashed border-graticule-teal/30 p-8 flex flex-col items-center justify-center rounded-sm bg-graticule-teal/5">
                        <Upload className="w-8 h-8 text-graticule-teal mb-2" />
                        <div className="text-sm font-medium text-registry-ink mb-2">{uploadData.file ? uploadData.file.name : "Select a file to upload"}</div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})} />
                        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-graticule-teal/50 text-registry-ink text-xs font-medium hover:bg-graticule-teal/10 rounded-sm">Choose File</button>
                     </div>

                     {!isUploadVersion && (
                        <>
                           <div>
                              <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">Title *</label>
                              <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} placeholder="e.g. Section 11 Notification Gazette" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">Type *</label>
                                 <select className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm bg-white" value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})}>
                                    <option value="NOTIFICATION">Notification</option>
                                    <option value="DECLARATION">Declaration</option>
                                    <option value="AWARD">Award</option>
                                    <option value="REPORT">Report</option>
                                    <option value="R&R">R&R</option>
                                    <option value="OTHER">Other</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">Project ID *</label>
                                 <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.projectId} onChange={e => setUploadData({...uploadData, projectId: e.target.value})} placeholder="PRJ-2026-..." />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">Parcel ID (Optional)</label>
                                 <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.parcelId} onChange={e => setUploadData({...uploadData, parcelId: e.target.value})} placeholder="PAR-..." />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">ULPIN (Optional)</label>
                                 <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.ulpin} onChange={e => setUploadData({...uploadData, ulpin: e.target.value})} placeholder="14 digit ULPIN" />
                              </div>
                           </div>
                        </>
                     )}
                     
                     <div>
                        <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">Remarks (Optional)</label>
                        <textarea className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm h-20 resize-none" value={uploadData.remarks} onChange={e => setUploadData({...uploadData, remarks: e.target.value})} placeholder="Note changes or context..." />
                     </div>
                  </div>
                  
                  <div className="p-6 border-t border-graticule-teal/30 bg-survey-paper/50 flex justify-end gap-3">
                     <button onClick={() => { setIsUploadOpen(false); setUploadError(""); }} className="px-4 py-2 border border-graticule-teal/30 text-registry-ink text-sm font-medium hover:bg-graticule-teal/10 rounded-sm">Cancel</button>
                     <button onClick={handleUploadSubmit} className="px-4 py-2 bg-registry-ink text-white text-sm font-medium hover:bg-registry-ink/90 transition-colors rounded-sm shadow-sm flex items-center gap-2"><Upload className="w-4 h-4"/> {isUploadVersion ? "Upload Version" : "Upload Document"}</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
`;
fs.appendFileSync('src/components/Documents.tsx', code);
