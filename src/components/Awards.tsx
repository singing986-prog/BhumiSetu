import { apiFetch } from "../api";
import { useState, useEffect } from "react";
import { ClipboardCheck, Download, Eye, FileSignature, X, Search, Filter, History, ChevronRight, FileText, CheckCircle, ArrowLeftRight, XCircle, Map as MapIcon, Loader2, ArrowRight } from "lucide-react";
import { AwardRecord, AwardItem, Project, CompensationRecord, RnRRecord } from "../types";
 
import { useTranslation } from "../i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export function Awards({ selectedState = "All States", selectedDistrict = "All Districts", setActiveTab, setSelectedProject, profile }: { selectedState?: string, selectedDistrict?: string, setActiveTab: (tab: string) => void, setSelectedProject: (proj: string) => void, profile: any }) {
  const { t } = useTranslation();
  const user = profile;
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  
  // Modals
  const [selectedAward, setSelectedAward] = useState<AwardRecord | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  
  // Draft Form State
  const [draftProjectId, setDraftProjectId] = useState("");
  const [draftItems, setDraftItems] = useState<any[]>([]);
  
  // Available data for drafting
  const [availableCompensations, setAvailableCompensations] = useState<CompensationRecord[]>([]);
  const [loadingDraftData, setLoadingDraftData] = useState(false);

  // Action State
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [awardsRes, projRes] = await Promise.all([
        apiFetch(`/api/awards?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`),
        apiFetch(`/api/projects?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)
      ]);
      const awardsData = await awardsRes.json();
      const projData = await projRes.json();
      setAwards(awardsData);
      setProjects(projData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedDistrict]);

  const fetchDraftData = async (projId: string) => {
    setLoadingDraftData(true);
    try {
      const res = await apiFetch(`/api/compensation?projectId=${projId}`);
      const data = await res.json();
      // Filter only approved/ready compensations that are not fully paid yet
      const readyCompensations = data.filter((c: any) => c.assessmentStatus === "APPROVED");
      setAvailableCompensations(readyCompensations);
    } catch (e) {
      console.error(e);
    }
    setLoadingDraftData(false);
  };

  const handleProjectSelect = (projId: string) => {
    setDraftProjectId(projId);
    setDraftItems([]);
    if (projId) {
      fetchDraftData(projId);
    } else {
      setAvailableCompensations([]);
    }
  };

  const handleAddDraftItem = (comp: CompensationRecord) => {
    if (draftItems.some(i => i.compensationId === comp.id)) return; // already added
    
    setDraftItems([...draftItems, {
      projectId: comp.projectId,
      parcelId: comp.parcelId,
      ulpin: comp.ulpin,
      beneficiaryId: comp.beneficiaryId,
      beneficiaryName: comp.beneficiaryName,
      compensationId: comp.id,
      rnrId: "", // Optional for now
      eligibleAmount: comp.approvedAmount,
      awardAmount: comp.approvedAmount,
      remarks: ""
    }]);
  };

  const handleRemoveDraftItem = (index: number) => {
    const newItems = [...draftItems];
    newItems.splice(index, 1);
    setDraftItems(newItems);
  };

  const handleCreateDraft = async () => {
    if (!draftProjectId) return setActionError("Project selection required");
    if (draftItems.length === 0) return setActionError("At least one beneficiary/item required");
    
    setActionLoading(true);
    setActionError("");
    try {
      const payload = {
        projectId: draftProjectId,
        awardItems: draftItems,
      };
      
      const res = await apiFetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create award");
      }
      
      await fetchData();
      setIsDrafting(false);
      setDraftProjectId("");
      setDraftItems([]);
    } catch (e: any) {
      setActionError(e.message);
    }
    setActionLoading(false);
  };
  
  const handleAction = async (action: string) => {
    if (!selectedAward) return;
    
    setActionLoading(true);
    setActionError("");
    
    try {
      const payload: any = {};
      if (action === 'return') payload.remarks = remarks;
      if (action === 'reject') payload.rejectionReason = rejectionReason;
      
      const res = await apiFetch(`/api/awards/${selectedAward.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${action} award`);
      }
      
      const updated = await res.json();
      setSelectedAward(updated);
      await fetchData();
      
      if (action === 'return') setRemarks("");
      if (action === 'reject') setRejectionReason("");
      
    } catch (e: any) {
      setActionError(e.message);
    }
    
    setActionLoading(false);
  };

  // Filter
  const filteredAwards = awards.filter(a => {
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    if (projectFilter !== "ALL" && a.projectId !== projectFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.id?.toLowerCase().includes(q) && 
          !a.referenceId?.toLowerCase().includes(q) &&
          !a.projectId?.toLowerCase().includes(q) &&
          !a.projectName?.toLowerCase().includes(q) &&
          !a.awardItems.some(i => 
             i.parcelId?.toLowerCase().includes(q) || 
             i.ulpin?.toLowerCase().includes(q) || 
             i.beneficiaryName?.toLowerCase().includes(q)
          )
      ) return false;
    }
    return true;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ISSUED': return "bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30";
      case 'APPROVED': return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case 'VERIFIED': return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case 'SUBMITTED': return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case 'RETURNED': return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case 'REJECTED': return "bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30";
      case 'DRAFT':
      default: return "bg-registry-ink/10 text-registry-ink border-registry-ink/30";
    }
  };
  
  const canDraft = ["Super Admin", "Central Ministry", "State Nodal Officer", "District LAO", "PIA"].includes(user?.role || "");
  const canVerify = ["Super Admin", "State Nodal Officer", "District LAO"].includes(user?.role || "");
  const canApprove = ["Super Admin", "State Nodal Officer", "Central Ministry"].includes(user?.role || "");

  return (
    <div className="flex-1 flex flex-col p-8 min-h-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-tilled-earth" />
            Awards Management
          </h2>
          <p className="text-registry-ink/60 mt-1">Manage compensation and R&R awards under Section 23 & 31.</p>
        </div>
        {canDraft && (
          <button onClick={() => setIsDrafting(true)} className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Draft New Award
          </button>
        )}
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-registry-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search awards, projects, beneficiaries, ULPIN..." 
            className="w-full pl-9 pr-4 py-2 border border-graticule-teal/30 rounded-sm outline-none focus:border-graticule-teal text-sm bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none text-sm rounded-sm bg-white" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
           <option value="ALL">All Projects</option>
           {projects.map(p => (
             <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
           ))}
        </select>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none text-sm rounded-sm bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
           <option value="ALL">All Statuses</option>
           <option value="DRAFT">Draft</option>
           <option value="SUBMITTED">Submitted</option>
           <option value="VERIFIED">Verified</option>
           <option value="RETURNED">Returned</option>
           <option value="APPROVED">Approved</option>
           <option value="REJECTED">Rejected</option>
           <option value="ISSUED">Issued</option>
        </select>
        {(searchQuery || statusFilter !== "ALL" || projectFilter !== "ALL") && (
          <button onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setProjectFilter("ALL"); }} className="px-4 py-2 bg-white border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/5 rounded-sm">
            Reset
          </button>
        )}
      </div>

      <div className="bg-white border border-graticule-teal/30 rounded-sm shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading awards...</div>
          ) : filteredAwards.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">No awards found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-graticule-teal/30 bg-graticule-teal/5">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Award ID</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Ref / Project</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Location</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Beneficiaries</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Total Amount (₹)</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-center">Status</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graticule-teal/10">
                {filteredAwards.map((award) => (
                  <tr key={award.id} onClick={() => setSelectedAward(award)} className="hover:bg-graticule-teal/5 transition-colors group cursor-pointer">
                    <td className="p-3 text-sm font-mono text-graticule-teal">{award.id}</td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-registry-ink">{award.projectName}</div>
                      <div className="text-xs text-registry-ink/60 font-mono">{award.referenceId || "Draft"} • {award.projectId}</div>
                    </td>
                    <td className="p-3 text-sm text-registry-ink/80">{award.district}, {award.state}</td>
                    <td className="p-3 text-sm text-registry-ink/80">{award.beneficiaryCount}</td>
                    <td className="p-3 text-sm font-medium text-registry-ink text-right">
                      {new Intl.NumberFormat('en-IN').format(award.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(award.status)}`}>
                        {award.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-graticule-teal hover:text-registry-ink transition-colors" title="View Details">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Drafting Modal */}
      <AnimatePresence>
        {isDrafting && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-registry-ink/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}} className="bg-white border border-graticule-teal/30 shadow-2xl rounded-sm w-full max-w-4xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-graticule-teal/30 flex justify-between items-center bg-survey-paper/50">
                <h3 className="text-xl font-serif text-registry-ink flex items-center gap-2"><FileSignature className="w-5 h-5"/> Draft New Award</h3>
                <button onClick={() => setIsDrafting(false)} className="p-2 hover:bg-graticule-teal/10 rounded-sm text-registry-ink/60 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {actionError && <div className="p-3 bg-alluvium-red/10 border border-alluvium-red text-alluvium-red text-sm rounded-sm">{actionError}</div>}
                
                <div>
                  <label className="block text-xs font-bold text-registry-ink uppercase tracking-wider mb-2">1. Select Project</label>
                  <select 
                    className="w-full px-4 py-3 border border-graticule-teal/30 outline-none focus:border-graticule-teal text-sm bg-white rounded-sm"
                    value={draftProjectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.state})</option>
                    ))}
                  </select>
                </div>
                
                {draftProjectId && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left side: Available Beneficiaries */}
                    <div className="border border-graticule-teal/30 rounded-sm flex flex-col max-h-96">
                      <div className="bg-graticule-teal/5 p-3 border-b border-graticule-teal/30">
                        <div className="text-xs font-bold text-registry-ink uppercase tracking-wider">Eligible Compensations (Approved)</div>
                      </div>
                      <div className="p-2 overflow-y-auto flex-1">
                        {loadingDraftData ? (
                           <div className="p-4 text-center text-sm text-registry-ink/60">Loading eligible records...</div>
                        ) : availableCompensations.length === 0 ? (
                           <div className="p-4 text-center text-sm text-registry-ink/60">No approved un-awarded compensations found.</div>
                        ) : (
                          availableCompensations.map(c => {
                            const isAdded = draftItems.some(i => i.compensationId === c.id);
                            return (
                              <div key={c.id} className={`p-3 border rounded-sm mb-2 text-sm flex justify-between items-center ${isAdded ? 'border-cultivated-green/30 bg-cultivated-green/5' : 'border-graticule-teal/20 hover:border-graticule-teal'}`}>
                                <div>
                                  <div className="font-medium text-registry-ink">{c.beneficiaryName}</div>
                                  <div className="text-[10px] text-registry-ink/60 font-mono">{c.ulpin} • {c.parcelId}</div>
                                  <div className="text-xs font-semibold text-registry-ink mt-1">₹{new Intl.NumberFormat('en-IN').format(c.approvedAmount)}</div>
                                </div>
                                <button 
                                  onClick={() => handleAddDraftItem(c)}
                                  disabled={isAdded}
                                  className={`p-2 rounded-sm ${isAdded ? 'text-cultivated-green' : 'bg-graticule-teal/10 text-graticule-teal hover:bg-graticule-teal/20'}`}
                                >
                                  {isAdded ? <CheckCircle className="w-4 h-4"/> : <ArrowRight className="w-4 h-4"/>}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                    
                    {/* Right side: Selected for Award */}
                    <div className="border border-graticule-teal/30 rounded-sm flex flex-col max-h-96">
                      <div className="bg-survey-paper/50 p-3 border-b border-graticule-teal/30 flex justify-between items-center">
                        <div className="text-xs font-bold text-registry-ink uppercase tracking-wider">Award Items</div>
                        <div className="text-xs font-bold text-registry-ink">Total: ₹{new Intl.NumberFormat('en-IN').format(draftItems.reduce((acc, curr) => acc + curr.awardAmount, 0))}</div>
                      </div>
                      <div className="p-2 overflow-y-auto flex-1 bg-white">
                        {draftItems.length === 0 ? (
                          <div className="p-4 text-center text-sm text-registry-ink/60">No beneficiaries added to award yet.</div>
                        ) : (
                          draftItems.map((item, idx) => (
                            <div key={idx} className="p-3 border border-tilled-earth/30 bg-tilled-earth/5 rounded-sm mb-2 text-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium text-registry-ink">{item.beneficiaryName}</div>
                                  <div className="text-[10px] text-registry-ink/60 font-mono">{item.compensationId}</div>
                                </div>
                                <button onClick={() => handleRemoveDraftItem(idx)} className="text-alluvium-red hover:text-alluvium-red/80 p-1">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex justify-between items-center bg-white p-2 rounded-sm border border-tilled-earth/20">
                                <span className="text-xs text-registry-ink/60">Award Amount:</span>
                                <span className="font-semibold text-registry-ink">₹{new Intl.NumberFormat('en-IN').format(item.awardAmount)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-graticule-teal/30 bg-survey-paper/50 flex justify-end gap-3">
                <button onClick={() => setIsDrafting(false)} className="px-4 py-2 border border-graticule-teal/30 text-registry-ink text-sm font-medium hover:bg-graticule-teal/10 rounded-sm">Cancel</button>
                <button onClick={handleCreateDraft} disabled={actionLoading || draftItems.length === 0} className="px-4 py-2 bg-registry-ink text-white text-sm font-medium hover:bg-registry-ink/90 transition-colors rounded-sm shadow-sm flex items-center gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileSignature className="w-4 h-4"/>} 
                  Create Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedAward && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 bg-registry-ink/20 backdrop-blur-sm flex items-center justify-end p-4">
            <motion.div initial={{opacity:0, x:50}} animate={{opacity:1, x:0}} exit={{opacity:0, x:50}} className="bg-white border-l border-graticule-teal/30 shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-graticule-teal/30 flex justify-between items-start bg-survey-paper/50">
                <div>
                  <h3 className="text-2xl font-serif text-registry-ink flex items-center gap-2">
                    Award Details
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${getStatusStyle(selectedAward.status)}`}>
                      {selectedAward.status}
                    </span>
                  </h3>
                  <div className="mt-2 text-sm text-registry-ink/70 font-mono">ID: {selectedAward.id} {selectedAward.referenceId && `| Ref: ${selectedAward.referenceId}`}</div>
                </div>
                <button onClick={() => { setSelectedAward(null); setActionError(""); }} className="p-2 hover:bg-graticule-teal/10 rounded-sm text-registry-ink/60 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 flex gap-8">
                {/* Left Column - Details */}
                <div className="flex-1 space-y-8">
                  {actionError && <div className="p-4 bg-alluvium-red/10 border border-alluvium-red text-alluvium-red text-sm rounded-sm">{actionError}</div>}
                  
                  {selectedAward.rejectionReason && (
                    <div className="p-4 bg-alluvium-red/5 border border-alluvium-red/30 rounded-sm">
                      <div className="text-xs font-bold text-alluvium-red uppercase tracking-wider mb-1">Rejection Reason</div>
                      <p className="text-sm text-registry-ink">{selectedAward.rejectionReason}</p>
                    </div>
                  )}

                  <section>
                     <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Project & Context</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-[10px] uppercase text-registry-ink/50">Project ID</div>
                           <div className="font-mono text-sm">{selectedAward.projectId}</div>
                           <button onClick={() => { setSelectedProject(selectedAward.projectId); setActiveTab("proposals"); }} className="mt-1 text-[10px] font-medium text-graticule-teal hover:underline flex items-center gap-1"><MapIcon className="w-3 h-3"/> View Project</button>
                        </div>
                        <div>
                           <div className="text-[10px] uppercase text-registry-ink/50">Project Name</div>
                           <div className="text-sm font-medium">{selectedAward.projectName}</div>
                        </div>
                        <div>
                           <div className="text-[10px] uppercase text-registry-ink/50">Location</div>
                           <div className="text-sm">{selectedAward.district}, {selectedAward.state}</div>
                        </div>
                        <div>
                           <div className="text-[10px] uppercase text-registry-ink/50">Issue Date</div>
                           <div className="text-sm">{selectedAward.issueDate || "Pending"}</div>
                        </div>
                     </div>
                  </section>
                  
                  <section>
                     <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Award Items & Financials</h4>
                     <div className="mb-4 bg-graticule-teal/5 p-4 rounded-sm border border-graticule-teal/20 flex justify-between items-center">
                        <div>
                           <div className="text-[10px] uppercase text-registry-ink/50">Total Award Amount</div>
                           <div className="text-2xl font-serif text-registry-ink font-semibold">₹{new Intl.NumberFormat('en-IN').format(selectedAward.totalAmount)}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] uppercase text-registry-ink/50">Beneficiaries</div>
                           <div className="text-xl font-medium text-registry-ink">{selectedAward.beneficiaryCount}</div>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        {selectedAward.awardItems.map((item, idx) => (
                           <div key={item.id} className="border border-graticule-teal/20 p-4 rounded-sm bg-white">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <div className="font-medium text-registry-ink text-sm">{item.beneficiaryName}</div>
                                    <div className="text-[10px] text-registry-ink/60 font-mono">BEN: {item.beneficiaryId} | ULPIN: {item.ulpin}</div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-xs font-bold text-registry-ink">₹{new Intl.NumberFormat('en-IN').format(item.awardAmount)}</div>
                                    <div className="text-[9px] text-registry-ink/50 uppercase">Awarded</div>
                                 </div>
                              </div>
                              <div className="flex gap-2 mt-3 pt-3 border-t border-graticule-teal/10">
                                 {item.compensationId && (
                                   <button onClick={() => setActiveTab("compensation")} className="px-2 py-1 bg-graticule-teal/5 border border-graticule-teal/20 text-graticule-teal text-[10px] hover:bg-graticule-teal/10 rounded-sm">View Comp. {item.compensationId}</button>
                                 )}
                                 <button onClick={() => setActiveTab("map")} className="px-2 py-1 bg-graticule-teal/5 border border-graticule-teal/20 text-graticule-teal text-[10px] hover:bg-graticule-teal/10 rounded-sm">View Parcel {item.parcelId}</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
                </div>
                
                {/* Right Column - Actions & Audit */}
                <div className="w-1/3 flex flex-col gap-6 border-l border-graticule-teal/20 pl-8">
                  
                  {selectedAward.documentId && (
                    <div className="bg-survey-paper p-4 border border-graticule-teal/30 rounded-sm">
                      <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-3">Official Document</h4>
                      <button onClick={() => setActiveTab("documents")} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors flex items-center justify-center gap-2 rounded-sm"><FileText className="w-4 h-4"/> View Document {selectedAward.documentId}</button>
                    </div>
                  )}
                
                  <div className="bg-white p-4 border border-graticule-teal/30 rounded-sm shadow-sm">
                    <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4">Actions</h4>
                    
                    {selectedAward.status === "DRAFT" && canDraft && (
                      <button onClick={() => handleAction('submit')} disabled={actionLoading} className="w-full py-2 bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2 mb-2">
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Submit for Verification"}
                      </button>
                    )}
                    
                    {selectedAward.status === "SUBMITTED" && canVerify && (
                      <div className="space-y-2">
                        <button onClick={() => handleAction('verify')} disabled={actionLoading} className="w-full py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Verify Award"}
                        </button>
                        <textarea 
                           className="w-full px-3 py-2 border border-graticule-teal/30 text-sm rounded-sm mt-2 outline-none focus:border-graticule-teal"
                           placeholder="Remarks for returning..."
                           value={remarks}
                           onChange={e => setRemarks(e.target.value)}
                        />
                        <button onClick={() => handleAction('return')} disabled={actionLoading || !remarks} className="w-full py-2 bg-white border border-orange-500 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2 disabled:opacity-50">
                          Return for Correction
                        </button>
                      </div>
                    )}
                    
                    {selectedAward.status === "VERIFIED" && canApprove && (
                      <div className="space-y-2">
                        <button onClick={() => handleAction('approve')} disabled={actionLoading} className="w-full py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Approve Award"}
                        </button>
                        <textarea 
                           className="w-full px-3 py-2 border border-graticule-teal/30 text-sm rounded-sm mt-2 outline-none focus:border-graticule-teal"
                           placeholder="Reason for rejection..."
                           value={rejectionReason}
                           onChange={e => setRejectionReason(e.target.value)}
                        />
                        <button onClick={() => handleAction('reject')} disabled={actionLoading || !rejectionReason} className="w-full py-2 bg-white border border-alluvium-red text-alluvium-red text-sm font-medium hover:bg-alluvium-red/5 transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2 disabled:opacity-50">
                          Reject Award
                        </button>
                      </div>
                    )}
                    
                    {selectedAward.status === "APPROVED" && canApprove && (
                      <button onClick={() => handleAction('issue')} disabled={actionLoading} className="w-full py-2 bg-cultivated-green text-white text-sm font-medium hover:bg-cultivated-green/90 transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2 mb-2">
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Issue Award"}
                      </button>
                    )}
                    
                    {selectedAward.status === "ISSUED" && (
                       <div className="p-3 bg-cultivated-green/10 border border-cultivated-green/30 text-cultivated-green text-sm text-center font-medium rounded-sm">
                          Award Officially Issued
                       </div>
                    )}
                    
                    {(!canDraft && !canVerify && !canApprove) && (
                       <div className="text-xs text-registry-ink/60 text-center py-2">
                          No actions available for your role.
                       </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-h-0 flex flex-col mt-4">
                     <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 flex items-center gap-2"><History className="w-4 h-4"/> Audit History</h4>
                     <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {selectedAward.issuedAt && (
                           <div className="relative pl-4 border-l-2 border-cultivated-green pb-2">
                              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-cultivated-green"></div>
                              <div className="text-xs font-bold text-registry-ink">Issued</div>
                              <div className="text-[10px] text-registry-ink/60">{new Date(selectedAward.issuedAt).toLocaleString()} • {selectedAward.issuedBy}</div>
                           </div>
                        )}
                        {selectedAward.approvedAt && (
                           <div className="relative pl-4 border-l-2 border-graticule-teal/30 pb-2">
                              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-graticule-teal/50"></div>
                              <div className="text-xs font-bold text-registry-ink">Approved</div>
                              <div className="text-[10px] text-registry-ink/60">{new Date(selectedAward.approvedAt).toLocaleString()} • {selectedAward.approvedBy}</div>
                           </div>
                        )}
                        {selectedAward.rejectedAt && (
                           <div className="relative pl-4 border-l-2 border-alluvium-red/50 pb-2">
                              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-alluvium-red"></div>
                              <div className="text-xs font-bold text-alluvium-red">Rejected</div>
                              <div className="text-[10px] text-registry-ink/60">{new Date(selectedAward.rejectedAt).toLocaleString()} • {selectedAward.rejectedBy}</div>
                           </div>
                        )}
                        {selectedAward.verifiedAt && (
                           <div className="relative pl-4 border-l-2 border-graticule-teal/30 pb-2">
                              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-graticule-teal/50"></div>
                              <div className="text-xs font-bold text-registry-ink">Verified</div>
                              <div className="text-[10px] text-registry-ink/60">{new Date(selectedAward.verifiedAt).toLocaleString()} • {selectedAward.verifiedBy}</div>
                           </div>
                        )}
                        <div className="relative pl-4 border-l-2 border-graticule-teal/30 pb-2">
                           <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-graticule-teal/50"></div>
                           <div className="text-xs font-bold text-registry-ink">Draft Created</div>
                           <div className="text-[10px] text-registry-ink/60">{new Date(selectedAward.createdAt).toLocaleString()} • {selectedAward.createdBy}</div>
                        </div>
                     </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
