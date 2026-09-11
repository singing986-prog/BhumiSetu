import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../api";
import { DocumentRecord } from "../types";
import { FolderOpen, Download, ShieldCheck, ShieldAlert, Upload, X, Search, FileText, CheckCircle2, History, Link as LinkIcon, MapPin, Map, FileCheck, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../i18n";

export function Documents({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects", 
  selectedStage, selectedCategory, selectedRisk,
  profile, setActiveTab, setSelectedProject, setSelectedParcelId 
}: any) {
  const { t } = useTranslation();
  
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploadVersion, setIsUploadVersion] = useState(false);
  const [uploadData, setUploadData] = useState<any>({
     file: null, title: "", type: "OTHER", projectId: "", parcelId: "", ulpin: "", remarks: ""
  });
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = () => {
    setIsLoading(true);
    let url = `/api/documents?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (typeFilter !== "ALL") url += `&type=${encodeURIComponent(typeFilter)}`;
    if (statusFilter !== "ALL") url += `&status=${encodeURIComponent(statusFilter)}`;
    
    apiFetch(url).then(r=>r.json()).then(data => {
       setRecords(data || []);
       setIsLoading(false);
       if (selectedDoc) {
          const updated = (data || []).find((d: any) => d.id === selectedDoc.id);
          if (updated) setSelectedDoc(updated);
       }
    }).catch(()=>setIsLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => loadDocs(), 300);
    return () => clearTimeout(t);
  }, [selectedState, selectedDistrict, selectedProject, search, typeFilter, statusFilter]);

  const loadVersions = (id: string) => {
    apiFetch(`/api/documents/${id}/versions`).then(r=>r.json()).then(data => setVersions(data || []));
  };

  useEffect(() => {
    if (selectedDoc) loadVersions(selectedDoc.id);
  }, [selectedDoc?.id]);

  const handleUploadSubmit = async () => {
    if (!uploadData.file) { setUploadError("File is required"); return; }
    if (!isUploadVersion && !uploadData.projectId) { setUploadError("Project ID is required"); return; }
    
    const formData = new FormData();
    formData.append("file", uploadData.file);
    if (!isUploadVersion) {
        formData.append("title", uploadData.title);
        formData.append("type", uploadData.type);
        formData.append("projectId", uploadData.projectId);
        if (uploadData.parcelId) formData.append("parcelId", uploadData.parcelId);
        if (uploadData.ulpin) formData.append("ulpin", uploadData.ulpin);
    }
    if (uploadData.remarks) formData.append("remarks", uploadData.remarks);
    
    const url = isUploadVersion ? `/api/documents/${selectedDoc!.id}/version` : "/api/documents";
    
    setUploadError("");
    try {
        const res = await apiFetch(url, {
           method: "POST",
           body: formData
        });
        const json = await res.json();
        if (!res.ok) {
           setUploadError(json.error || "Upload failed");
        } else {
           setIsUploadOpen(false);
           setUploadData({file: null, title: "", type: "OTHER", projectId: "", parcelId: "", ulpin: "", remarks: ""});
           loadDocs();
        }
    } catch(err) {
        setUploadError("Network error during upload");
    }
  };

  const handleVerifyIntegrity = (id: string) => {
     apiFetch(`/api/documents/${id}/verify-integrity`, {method: "POST"})
      .then(r=>r.json())
      .then(() => loadDocs());
  };

  const handleDownload = async (id: string, version?: string) => {
     let url = `/api/documents/${id}/download`;
     if (version) url += `/${version}`;
     
     try {
        const res = await apiFetch(url);
        if (!res.ok) {
           alert("Failed to download document");
           return;
        }
        const blob = await res.blob();
        
        const disposition = res.headers.get('content-disposition');
        let filename = `${id}.pdf`;
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }

        const windowUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = windowUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(windowUrl);
     } catch (err) {
        console.error("Download error", err);
     }
  };

  const handlePreview = (id: string, version?: string) => {
     // A simple fallback to download since it opens in new tab for PDF preview natively
     handleDownload(id, version);
  };

  const linkTo = (tab: string, pid: string, parcelId?: string) => {
     if (setSelectedProject) setSelectedProject(pid);
     if (parcelId && setSelectedParcelId) setSelectedParcelId(parcelId);
     if (setActiveTab) setActiveTab(tab);
     setSelectedDoc(null);
  };

  const canUpload = profile?.role !== "Auditor" && profile?.role !== "Affected Citizen";

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-tilled-earth" />
            {t("doc.repo.title")}
          </h2>
          <p className="text-registry-ink/60 mt-1">{t("doc.repo.subtitle")}</p>
        </div>
        {canUpload && (
           <button onClick={() => { setIsUploadVersion(false); setIsUploadOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors rounded-sm shadow-sm">
             <Upload className="w-4 h-4" /> {t("doc.uploadDocument")}
           </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-graticule-teal" />
          <input 
            type="text" 
            placeholder={t("doc.search")}
            className="w-full pl-9 pr-4 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none text-sm rounded-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
           <option value="ALL">{t("doc.allTypes")}</option>
           <option value="NOTIFICATION">{t("doc.type.NOTIFICATION")}</option>
           <option value="DECLARATION">{t("doc.type.DECLARATION")}</option>
           <option value="AWARD">{t("doc.type.AWARD")}</option>
           <option value="REPORT">{t("doc.type.REPORT")}</option>
           <option value="R&R">{t("doc.type.RNR")}</option>
           <option value="OTHER">{t("doc.type.OTHER")}</option>
        </select>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none text-sm rounded-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
           <option value="ALL">{t("doc.allStatuses")}</option>
           <option value="VERIFIED">{t("doc.status.VERIFIED")}</option>
           <option value="PENDING_REVIEW">{t("doc.status.PENDING_REVIEW")}</option>
           <option value="DRAFT">{t("doc.status.DRAFT")}</option>
        </select>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-[10px]">{t("doc.documentId")}</th>
                <th className="px-6 py-4">{t("doc.title")} / {t("doc.type")}</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-[10px]">{t("doc.version")}</th>
                <th className="px-6 py-4">{t("doc.uploadedBy")}</th>
                <th className="px-6 py-4">{t("doc.status")} & Integrity</th>
                <th className="px-6 py-4 text-right">{t("doc.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center animate-pulse text-graticule-teal">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-registry-ink/50">{t("doc.noDocs")}</td></tr>
              ) : records.map((record, i) => (
                <motion.tr initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}} key={record.id} className="hover:bg-graticule-teal/5 cursor-pointer" onClick={() => setSelectedDoc(record)}>
                   <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.id}</td>
                   <td className="px-6 py-4">
                      <div className="font-medium text-registry-ink">{record.title}</div>
                      <div className="text-[10px] uppercase tracking-wider text-registry-ink/60">{record.type} • {record.fileSize}</div>
                   </td>
                   <td className="px-6 py-4 font-mono text-xs">v{record.version}</td>
                   <td className="px-6 py-4">
                      <div className="text-registry-ink">{record.uploadedBy}</div>
                      <div className="text-[10px] text-registry-ink/60">{new Date(record.uploadedAt).toLocaleDateString()}</div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 mb-1">
                         {record.status === "VERIFIED" ? <CheckCircle2 className="w-3 h-3 text-cultivated-green" /> : <ShieldAlert className="w-3 h-3 text-tilled-earth" />}
                         <span className="text-[10px] font-bold tracking-wider uppercase">{record.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         {record.integrityStatus === "VERIFIED" ? <ShieldCheck className="w-3 h-3 text-cultivated-green" /> : <ShieldAlert className="w-3 h-3 text-alluvium-red" />}
                         <span className={`text-[10px] font-bold tracking-wider uppercase ${record.integrityStatus === "VERIFIED" ? "text-cultivated-green" : "text-alluvium-red"}`}>
                            {record.integrityStatus === "INTEGRITY_MISMATCH" ? t("doc.integrityFailed") : t("doc.integrityVerified")}
                         </span>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleDownload(record.id)} className="p-2 text-graticule-teal hover:bg-graticule-teal/10 rounded-sm" title={t("doc.download")}><Download className="w-4 h-4" /></button>
                      <button onClick={() => handleVerifyIntegrity(record.id)} className="p-2 text-tilled-earth hover:bg-tilled-earth/10 rounded-sm" title={t("doc.verifyIntegrity")}><FileCheck className="w-4 h-4" /></button>
                   </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">{t("doc.documentInfo")}</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.uploadedBy")}</div><div className="text-sm">{selectedDoc.uploadedBy} ({selectedDoc.uploadedByRole})</div></div>
                              <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.uploadedAt")}</div><div className="text-sm">{new Date(selectedDoc.uploadedAt).toLocaleString()}</div></div>
                              <div className="col-span-2">
                                 <div className="text-[10px] uppercase text-registry-ink/50">{t("doc.sha256")}</div>
                                 <div className="font-mono text-xs text-registry-ink bg-survey-paper p-2 rounded-sm border border-graticule-teal/20 break-all">{selectedDoc.checksum}</div>
                              </div>
                           </div>
                        </section>

                        <section>
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">{t("doc.linkages")}</h4>
                           <div className="grid grid-cols-3 gap-4 mb-4">
                              {selectedDoc.projectId && <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.project")}</div><div className="font-mono text-sm">{selectedDoc.projectId}</div></div>}
                              {selectedDoc.parcelId && <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.parcel")}</div><div className="font-mono text-sm">{selectedDoc.parcelId}</div></div>}
                              {selectedDoc.ulpin && <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.ulpin")}</div><div className="font-mono text-sm">{selectedDoc.ulpin}</div></div>}
                              {selectedDoc.rnrId && <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.rnrCase")}</div><div className="font-mono text-sm">{selectedDoc.rnrId}</div></div>}
                              {selectedDoc.compensationId && <div><div className="text-[10px] uppercase text-registry-ink/50">{t("doc.compensation")}</div><div className="font-mono text-sm">{selectedDoc.compensationId}</div></div>}
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {selectedDoc.projectId && <button onClick={() => linkTo("proposals", selectedDoc.projectId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Project</button>}
                              {selectedDoc.parcelId && <button onClick={() => linkTo("map", selectedDoc.projectId, selectedDoc.parcelId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><MapPin className="w-3 h-3"/> GIS</button>}
                              {selectedDoc.rnrId && <button onClick={() => linkTo("rnr", selectedDoc.projectId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><Landmark className="w-3 h-3"/> R&R Case</button>}
                              {selectedDoc.compensationId && <button onClick={() => linkTo("compensation", selectedDoc.projectId)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><Landmark className="w-3 h-3"/> Compensation</button>}
                           </div>
                        </section>

                        <section>
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">{t("doc.statusAndVerification")}</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <div className="text-xs mb-1 text-registry-ink/60">{t("doc.integrityStatus")}</div>
                                 <div className={`font-medium text-sm mb-1 ${selectedDoc.integrityStatus === "VERIFIED" ? "text-cultivated-green" : "text-alluvium-red"}`}>
                                    {selectedDoc.integrityStatus === "INTEGRITY_MISMATCH" ? t("doc.integrityFailed") : t("doc.integrityVerified")}
                                 </div>
                                 {selectedDoc.integrityStatus === "INTEGRITY_MISMATCH" && <div className="text-[10px] text-alluvium-red italic">{t("doc.tamperingDetected")}</div>}
                              </div>
                              <div>
                                 <div className="text-xs mb-1 text-registry-ink/60">{t("doc.digitalSignature")}</div>
                                 <div className="font-medium text-sm mb-1">{selectedDoc.signatureStatus.replace(/_/g, ' ')}</div>
                                 <div className="text-[10px] text-registry-ink/50 italic">{t("doc.cryptoSignatureUnavailable")}</div>
                              </div>
                           </div>
                        </section>
                     </div>

                     <div className="w-full md:w-1/3 flex flex-col gap-6 border-l border-graticule-teal/20 pl-6">
                        <div className="bg-survey-paper/50 p-4 border border-graticule-teal/30 rounded-sm">
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4">{t("doc.actions")}</h4>
                           <div className="flex flex-col gap-2">
                              <button onClick={() => handleDownload(selectedDoc.id)} className="w-full py-2 bg-registry-ink text-white text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center justify-center gap-2"><Download className="w-4 h-4"/> {t("doc.downloadFile")}</button>
                              <button onClick={() => handlePreview(selectedDoc.id)} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors flex items-center justify-center gap-2"><FileText className="w-4 h-4"/> {t("doc.previewBrowser")}</button>
                              <button onClick={() => handleVerifyIntegrity(selectedDoc.id)} className="w-full py-2 bg-white border border-tilled-earth text-tilled-earth text-sm font-medium hover:bg-tilled-earth/5 transition-colors flex items-center justify-center gap-2"><FileCheck className="w-4 h-4"/> {t("doc.verifyIntegrity")}</button>
                              {canUpload && (
                                 <button onClick={() => { setIsUploadVersion(true); setIsUploadOpen(true); }} className="w-full py-2 mt-4 bg-graticule-teal text-white text-sm font-medium hover:bg-graticule-teal/90 transition-colors flex items-center justify-center gap-2"><Upload className="w-4 h-4"/> {t("doc.uploadNewVersion")}</button>
                              )}
                           </div>
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col">
                           <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 flex items-center gap-2"><History className="w-4 h-4"/> {t("doc.versionHistory")}</h4>
                           <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                              <div className="relative pl-4 border-l-2 border-cultivated-green pb-2">
                                 <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-cultivated-green"></div>
                                 <div className="text-xs font-bold text-registry-ink">{t("doc.current")}: v{selectedDoc.version}</div>
                                 <div className="text-[10px] text-registry-ink/60">{new Date(selectedDoc.uploadedAt).toLocaleString()} • {selectedDoc.uploadedBy}</div>
                              </div>
                              {versions.length === 0 ? <p className="text-xs text-registry-ink/50 pl-4">{t("doc.noOlderVersions")}</p> : versions.map(v => (
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

      <AnimatePresence>
         {isUploadOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
               <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white border border-graticule-teal/30 shadow-2xl rounded-sm w-full max-w-2xl flex flex-col">
                  
                  <div className="p-6 border-b border-graticule-teal/30 flex justify-between items-center bg-survey-paper/50">
                     <h3 className="text-xl font-serif text-registry-ink">{isUploadVersion ? `${t("doc.uploadNewVersion")} (v${(parseFloat(selectedDoc!.version) + 1).toFixed(1)})` : t("doc.uploadDocument")}</h3>
                     <button onClick={() => { setIsUploadOpen(false); setUploadError(""); }} className="p-2 hover:bg-graticule-teal/10 rounded-sm text-registry-ink/60 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
                     {uploadError && <div className="p-3 bg-alluvium-red/10 border border-alluvium-red/30 text-alluvium-red text-sm rounded-sm">{uploadError}</div>}
                     
                     <div className="border-2 border-dashed border-graticule-teal/30 p-8 flex flex-col items-center justify-center rounded-sm bg-graticule-teal/5">
                        <Upload className="w-8 h-8 text-graticule-teal mb-2" />
                        <div className="text-sm font-medium text-registry-ink mb-2">{uploadData.file ? uploadData.file.name : t("doc.selectFile")}</div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})} />
                        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-graticule-teal/50 text-registry-ink text-xs font-medium hover:bg-graticule-teal/10 rounded-sm">{t("doc.chooseFile")}</button>
                     </div>

                     {!isUploadVersion && (
                        <>
                           <div>
                              <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">{t("doc.titleRequired")}</label>
                              <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} placeholder="e.g. Section 11 Notification Gazette" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">{t("doc.typeRequired")}</label>
                                 <select className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm bg-white" value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})}>
                                    <option value="NOTIFICATION">{t("doc.type.NOTIFICATION")}</option>
                                    <option value="DECLARATION">{t("doc.type.DECLARATION")}</option>
                                    <option value="AWARD">{t("doc.type.AWARD")}</option>
                                    <option value="REPORT">{t("doc.type.REPORT")}</option>
                                    <option value="R&R">{t("doc.type.RNR")}</option>
                                    <option value="OTHER">{t("doc.type.OTHER")}</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">{t("doc.projectIdRequired")}</label>
                                 <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.projectId} onChange={e => setUploadData({...uploadData, projectId: e.target.value})} placeholder="PRJ-2026-..." />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">{t("doc.parcelIdOptional")}</label>
                                 <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.parcelId} onChange={e => setUploadData({...uploadData, parcelId: e.target.value})} placeholder="PAR-..." />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">{t("doc.ulpinOptional")}</label>
                                 <input type="text" className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm" value={uploadData.ulpin} onChange={e => setUploadData({...uploadData, ulpin: e.target.value})} placeholder="14 digit ULPIN" />
                              </div>
                           </div>
                        </>
                     )}
                     
                     <div>
                        <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-1">{t("doc.remarksOptional")}</label>
                        <textarea className="w-full px-3 py-2 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm rounded-sm h-20 resize-none" value={uploadData.remarks} onChange={e => setUploadData({...uploadData, remarks: e.target.value})} placeholder="Note changes or context..." />
                     </div>
                  </div>
                  
                  <div className="p-6 border-t border-graticule-teal/30 bg-survey-paper/50 flex justify-end gap-3">
                     <button onClick={() => { setIsUploadOpen(false); setUploadError(""); }} className="px-4 py-2 border border-graticule-teal/30 text-registry-ink text-sm font-medium hover:bg-graticule-teal/10 rounded-sm">Cancel</button>
                     <button onClick={handleUploadSubmit} className="px-4 py-2 bg-registry-ink text-white text-sm font-medium hover:bg-registry-ink/90 transition-colors rounded-sm shadow-sm flex items-center gap-2"><Upload className="w-4 h-4"/> {isUploadVersion ? t("doc.uploadNewVersion") : t("doc.uploadDocument")}</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
