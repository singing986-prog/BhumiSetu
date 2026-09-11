import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { RnRRecord, DocumentRecord } from "../types";
type AuditEvent = any;
import { Home, CheckCircle2, Clock, AlertCircle, Search, Filter, X, ChevronRight, Download, FileText, Check, FileCheck, MapPin, Building, Briefcase, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


export function RnR({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects", 
  selectedStage,
  selectedCategory,
  selectedRisk,
  profile,
  setActiveTab,
  setSelectedProject,
  setSelectedParcelId
}: { 
  selectedState?: string, 
  selectedDistrict?: string, 
  selectedProject?: string, 
  selectedStage?: string,
  selectedCategory?: string,
  selectedRisk?: string,
  profile?: any,
  setActiveTab?: (tab: string) => void,
  setSelectedProject?: (id: string) => void,
  setSelectedParcelId?: (id: string | null) => void
}) {
  const t = (k: string, def: string) => def;
  const [records, setRecords] = useState<RnRRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  
  const [selectedRecord, setSelectedRecord] = useState<RnRRecord | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Modals state
  const [eligibilityModal, setEligibilityModal] = useState(false);
  const [entitlementModal, setEntitlementModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [implementationModal, setImplementationModal] = useState(false);
  
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = () => {
    setIsLoading(true);
    let url = `/api/rnr?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (categoryFilter !== "All Categories") url += `&category=${encodeURIComponent(categoryFilter)}`;
    if (statusFilter !== "All Statuses") url += `&approvalStatus=${encodeURIComponent(statusFilter)}`;
    
    apiFetch(url)
      .then(res => res.json())
      .then(data => {
        setRecords(data || []);
        setIsLoading(false);
        if (selectedRecord) {
           const updated = data.find((r: RnRRecord) => r.id === selectedRecord.id);
           if (updated) setSelectedRecord(updated);
        }
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
       loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedState, selectedDistrict, selectedProject, search, categoryFilter, statusFilter]);

  const loadDetails = (id: string) => {
    apiFetch(`/api/audit?rnrId=${id}`).then(r => r.json()).then(data => setAuditEvents(data || []));
    apiFetch(`/api/documents`).then(r => r.json()).then(data => setDocuments((data || []).filter((d: any) => d.parcelId === records.find(rec=>rec.id === id)?.parcelId)));
  };

  useEffect(() => {
    if (selectedRecord) {
      loadDetails(selectedRecord.id);
    }
  }, [selectedRecord?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SETTLED": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "RETURNED":
      case "REJECTED": return <AlertCircle className="w-4 h-4 text-alluvium-red" />;
      case "APPROVED": return <Check className="w-4 h-4 text-cultivated-green" />;
      default: return <Clock className="w-4 h-4 text-graticule-teal" />;
    }
  };

  const getStatusBadge = (status: string) => {
     let bg = "bg-survey-paper text-registry-ink border-graticule-teal/30";
     if (status === "SETTLED" || status === "APPROVED") bg = "bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30";
     if (status === "RETURNED" || status === "REJECTED") bg = "bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30";
     if (status === "IMPLEMENTATION_IN_PROGRESS") bg = "bg-graticule-teal/10 text-graticule-teal border-graticule-teal/30";
     return <span className={`px-2 py-1 text-[10px] font-bold tracking-wider uppercase rounded-sm border ${bg}`}>{status.replace(/_/g, ' ')}</span>;
  };

  const handleDeepLink = (tab: string, rec: RnRRecord) => {
    if (setSelectedProject) setSelectedProject(rec.projectId);
    if (tab === "map" && setSelectedParcelId) setSelectedParcelId(rec.parcelId);
    if (setActiveTab) setActiveTab(tab);
    setSelectedRecord(null);
  };

  // ... (Component structure continued in part 2)

  const apiCall = (endpoint: string, payload: any, modalSetter: any) => {
    setErrorMsg("");
    apiFetch(`/api/rnr/${selectedRecord?.id}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json().then(data => ({status: res.status, data})))
    .then(({status, data}) => {
      if (status >= 400) {
        setErrorMsg(data.error || "Operation failed");
      } else {
        modalSetter(false);
        loadData();
      }
    })
    .catch(err => setErrorMsg("Network error"));
  };

  // Internal state for modls
  const [eligibilityStatus, setEligibilityStatus] = useState("ELIGIBLE");
  const [entitlements, setEntitlements] = useState({ housingEntitlement: false, landEntitlement: false, livelihoodEntitlement: false, assistanceAssessed: 0, relocationRequired: false });
  const [verifyStatus, setVerifyStatus] = useState("VERIFIED");
  const [approveStatus, setApproveStatus] = useState("APPROVED");
  const [payAmount, setPayAmount] = useState(0);
  const [implementation, setImplementation] = useState({ housingStatus: "", landStatus: "", livelihoodStatus: "", trainingStatus: "", relocationStatus: "", markSettled: false });

  const isNodal = profile?.role === "State Nodal Officer" || profile?.role === "Central Ministry";
  const isLao = profile?.role === "District LAO";
  const isSurveyor = profile?.role === "Field Surveyor";
  const canAssess = isLao || isSurveyor;
  const canVerify = isLao || isSurveyor;
  const canApprove = isNodal || isLao;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <Home className="w-8 h-8 text-tilled-earth" />
            {t("rnr.title", "Rehabilitation & Resettlement")}
          </h2>
          <p className="text-registry-ink/60 mt-1">Manage affected families register and track statutory entitlements.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-graticule-teal" />
          <input 
            type="text" 
            placeholder="Search Reference ID, ULPIN, Family Head..."
            className="w-full pl-9 pr-4 py-2 border border-graticule-teal/30 focus:border-graticule-teal outline-none bg-white text-sm rounded-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none bg-white text-sm rounded-sm text-registry-ink/80"
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All Categories</option>
          <option>Displaced</option>
          <option>Affected Not Displaced</option>
        </select>
        <select className="border border-graticule-teal/30 px-4 py-2 outline-none bg-white text-sm rounded-sm text-registry-ink/80"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="IMPLEMENTATION_IN_PROGRESS">Implementation In Progress</option>
          <option value="SETTLED">Settled</option>
        </select>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-[10px]">Ref ID</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-[10px]">Parcel ID</th>
                <th className="px-6 py-4">Family Head</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Financial Assistance</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading R&R records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-registry-ink/60">
                    No R&R records found.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={record.id} 
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-graticule-teal/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.referenceId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.parcelId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-registry-ink">{record.familyHead}</div>
                      <div className="text-xs text-registry-ink/60">{record.memberCount} Members</div>
                    </td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.category}</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-registry-ink">Assessed: ₹{record.assistanceAssessed?.toLocaleString('en-IN') || 0}</div>
                      <div className="font-mono text-xs text-cultivated-green">Paid: ₹{record.assistancePaid?.toLocaleString('en-IN') || 0}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.approvalStatus)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Details Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-graticule-teal/30 shadow-2xl rounded-sm w-full max-w-6xl max-h-[90vh] flex flex-col"
            >
               {/* Modal Header */}
               <div className="p-6 border-b border-graticule-teal/30 flex justify-between items-start bg-survey-paper/50">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs font-bold text-graticule-teal uppercase tracking-wider">
                           {selectedRecord.referenceId}
                        </span>
                        {getStatusBadge(selectedRecord.approvalStatus)}
                     </div>
                     <h3 className="text-2xl font-serif text-registry-ink">{selectedRecord.familyHead}</h3>
                     <p className="text-registry-ink/60 text-sm mt-1">{selectedRecord.village}, {selectedRecord.district}, {selectedRecord.state}</p>
                  </div>
                  <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-graticule-teal/10 rounded-sm text-registry-ink/60 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 bg-white">
                  
                  {/* Left Column - Core Details */}
                  <div className="w-full md:w-2/3 space-y-8">
                     
                     {/* Identity & Linkage */}
                     <section>
                        <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Case Linkage</h4>
                        <div className="grid grid-cols-3 gap-6">
                           <div>
                              <div className="text-[10px] uppercase tracking-wider text-registry-ink/50">Project ID</div>
                              <div className="font-mono text-sm">{selectedRecord.projectId}</div>
                           </div>
                           <div>
                              <div className="text-[10px] uppercase tracking-wider text-registry-ink/50">Parcel ID</div>
                              <div className="font-mono text-sm">{selectedRecord.parcelId}</div>
                           </div>
                           <div>
                              <div className="text-[10px] uppercase tracking-wider text-registry-ink/50">ULPIN</div>
                              <div className="font-mono text-sm">{selectedRecord.ulpin}</div>
                           </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                           <button onClick={() => handleDeepLink("map", selectedRecord)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><MapPin className="w-3 h-3"/> View on Map</button>
                           <button onClick={() => handleDeepLink("compensation", selectedRecord)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><Landmark className="w-3 h-3"/> View Compensation</button>
                           <button onClick={() => handleDeepLink("workflow", selectedRecord)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10">View Workflow</button>
                           <button onClick={() => handleDeepLink("documents", selectedRecord)} className="px-3 py-1.5 text-xs font-medium border border-graticule-teal/30 rounded-sm hover:bg-graticule-teal/10 flex items-center gap-1"><FileText className="w-3 h-3"/> View Documents</button>
                        </div>
                     </section>

                     {/* Entitlements Grid */}
                     <section>
                        <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Entitlements & Status</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 border border-graticule-teal/20 bg-survey-paper/30 rounded-sm">
                              <div className="flex items-center gap-2 mb-2 text-registry-ink/80"><Building className="w-4 h-4"/> <span className="font-medium text-sm">Housing</span></div>
                              <div className="text-xs mb-1">Entitlement: <strong>{selectedRecord.housingEntitlement ? "Yes" : "No"}</strong></div>
                              <div className="text-xs mb-1">Status: <strong>{selectedRecord.housingStatus}</strong></div>
                              {selectedRecord.housingAllotment && <div className="text-xs font-mono">Allotment: {selectedRecord.housingAllotment}</div>}
                           </div>
                           <div className="p-4 border border-graticule-teal/20 bg-survey-paper/30 rounded-sm">
                              <div className="flex items-center gap-2 mb-2 text-registry-ink/80"><Briefcase className="w-4 h-4"/> <span className="font-medium text-sm">Livelihood</span></div>
                              <div className="text-xs mb-1">Entitlement: <strong>{selectedRecord.livelihoodEntitlement ? "Yes" : "No"}</strong></div>
                              <div className="text-xs mb-1">Status: <strong>{selectedRecord.livelihoodStatus}</strong></div>
                              <div className="text-xs mb-1">Training: <strong>{selectedRecord.trainingStatus}</strong></div>
                           </div>
                           <div className="p-4 border border-graticule-teal/20 bg-survey-paper/30 rounded-sm">
                              <div className="flex items-center gap-2 mb-2 text-registry-ink/80"><MapPin className="w-4 h-4"/> <span className="font-medium text-sm">Relocation & Land</span></div>
                              <div className="text-xs mb-1">Relocation: <strong>{selectedRecord.relocationRequired ? "Required" : "Not Required"} ({selectedRecord.relocationStatus})</strong></div>
                              <div className="text-xs mb-1">Alt Land: <strong>{selectedRecord.landEntitlement ? "Yes" : "No"} ({selectedRecord.landStatus})</strong></div>
                           </div>
                           <div className="p-4 border border-cultivated-green/30 bg-cultivated-green/5 rounded-sm">
                              <div className="flex items-center gap-2 mb-2 text-cultivated-green"><Landmark className="w-4 h-4"/> <span className="font-medium text-sm">Financial Assistance</span></div>
                              <div className="text-xs mb-1 flex justify-between"><span>Assessed:</span> <strong className="font-mono">₹{selectedRecord.assistanceAssessed?.toLocaleString('en-IN') || 0}</strong></div>
                              <div className="text-xs mb-1 flex justify-between"><span>Paid:</span> <strong className="font-mono text-cultivated-green">₹{selectedRecord.assistancePaid?.toLocaleString('en-IN') || 0}</strong></div>
                              <div className="text-xs mb-1 flex justify-between mt-2 pt-2 border-t border-cultivated-green/20"><span>Balance:</span> <strong className="font-mono">₹{selectedRecord.assistanceBalance?.toLocaleString('en-IN') || 0}</strong></div>
                           </div>
                        </div>
                     </section>
                     
                     <section>
                         <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4 border-b border-graticule-teal/30 pb-2">Verification & Approval</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs mb-1 text-registry-ink/60">Eligibility Status</div>
                                <div className="font-medium text-sm mb-3">{selectedRecord.eligibilityStatus}</div>
                                <div className="text-xs mb-1 text-registry-ink/60">Verification</div>
                                <div className="font-medium text-sm mb-1">{selectedRecord.verificationStatus}</div>
                                {selectedRecord.verifiedBy && <div className="text-xs text-registry-ink/60">By: {selectedRecord.verifiedBy} on {new Date(selectedRecord.verifiedAt!).toLocaleDateString()}</div>}
                            </div>
                            <div>
                                <div className="text-xs mb-1 text-registry-ink/60">Approval Status</div>
                                <div className="font-medium text-sm mb-1">{selectedRecord.approvalStatus}</div>
                                {selectedRecord.approvedBy && <div className="text-xs text-registry-ink/60">By: {selectedRecord.approvedBy} on {new Date(selectedRecord.approvedAt!).toLocaleDateString()}</div>}
                                {selectedRecord.remarks && <div className="text-xs mt-3 p-2 bg-survey-paper rounded-sm border border-graticule-teal/20 italic">"{selectedRecord.remarks}"</div>}
                            </div>
                         </div>
                     </section>

                  </div>

                  {/* Right Column - Audit & Actions */}
                  <div className="w-full md:w-1/3 flex flex-col gap-6 border-l border-graticule-teal/20 pl-6">
                     
                     {/* Actions Panel */}
                     <div className="bg-survey-paper/50 p-4 border border-graticule-teal/30 rounded-sm">
                        <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4">Actions</h4>
                        <div className="flex flex-col gap-2">
                           {canAssess && selectedRecord.eligibilityStatus === "NOT_ASSESSED" && (
                              <button onClick={() => setEligibilityModal(true)} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors">Assess Eligibility</button>
                           )}
                           {canAssess && (selectedRecord.eligibilityStatus === "ELIGIBLE" || selectedRecord.approvalStatus === "RETURNED") && selectedRecord.entitlementStatus === "PENDING" && (
                              <button onClick={() => setEntitlementModal(true)} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors">Assess Entitlements</button>
                           )}
                           {canVerify && selectedRecord.entitlementStatus === "ASSESSED" && selectedRecord.verificationStatus !== "VERIFIED" && (
                              <button onClick={() => setVerifyModal(true)} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors">Verify R&R Case</button>
                           )}
                           {canApprove && selectedRecord.verificationStatus === "VERIFIED" && (selectedRecord.approvalStatus === "UNDER_REVIEW" || selectedRecord.approvalStatus === "DRAFT") && (
                              <button onClick={() => setApproveModal(true)} className="w-full py-2 bg-graticule-teal text-white text-sm font-medium hover:bg-graticule-teal/90 transition-colors">Approve R&R</button>
                           )}
                           {canApprove && (selectedRecord.approvalStatus === "APPROVED" || selectedRecord.approvalStatus === "IMPLEMENTATION_IN_PROGRESS") && selectedRecord.assistanceBalance > 0 && (
                              <button onClick={() => setPayModal(true)} className="w-full py-2 bg-cultivated-green text-white text-sm font-medium hover:bg-cultivated-green/90 transition-colors">Disburse Assistance</button>
                           )}
                           {canApprove && (selectedRecord.approvalStatus === "APPROVED" || selectedRecord.approvalStatus === "IMPLEMENTATION_IN_PROGRESS") && (
                              <button onClick={() => setImplementationModal(true)} className="w-full py-2 bg-white border border-graticule-teal text-registry-ink text-sm font-medium hover:bg-graticule-teal/5 transition-colors">Update Implementation / Settle</button>
                           )}
                        </div>
                     </div>

                     {/* Audit Trail */}
                     <div className="flex-1 min-h-0 flex flex-col">
                        <h4 className="text-xs font-bold text-registry-ink uppercase tracking-wider mb-4">Audit Trail</h4>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                           {auditEvents.length === 0 ? <p className="text-xs text-registry-ink/50">No events found.</p> : auditEvents.map(ev => (
                              <div key={ev.id} className="relative pl-4 border-l-2 border-graticule-teal/30 pb-2">
                                 <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-graticule-teal"></div>
                                 <div className="text-xs font-bold text-registry-ink">{ev.action.replace(/_/g, ' ')}</div>
                                 <div className="text-[10px] text-registry-ink/60">{new Date(ev.timestamp).toLocaleString()} • {ev.executedBy}</div>
                                 {ev.remarks && <div className="text-[10px] mt-1 italic text-registry-ink/80">{ev.remarks}</div>}
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

      {/* Action Modals will go here */}

      {eligibilityModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-sm shadow-xl max-w-sm w-full border border-graticule-teal/30">
               <h3 className="text-lg font-serif mb-4">Assess Eligibility</h3>
               {errorMsg && <p className="text-alluvium-red text-xs mb-3">{errorMsg}</p>}
               <select className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" value={eligibilityStatus} onChange={e=>setEligibilityStatus(e.target.value)}>
                  <option value="ELIGIBLE">Eligible</option>
                  <option value="INELIGIBLE">Ineligible</option>
                  <option value="UNDER_REVIEW">Under Review</option>
               </select>
               <textarea className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" placeholder="Remarks" value={remarks} onChange={e=>setRemarks(e.target.value)} />
               <div className="flex gap-2 justify-end">
                  <button onClick={() => setEligibilityModal(false)} className="px-4 py-2 text-sm text-registry-ink/70">Cancel</button>
                  <button onClick={() => apiCall('/assess-eligibility', {status: eligibilityStatus, remarks}, setEligibilityModal)} className="px-4 py-2 text-sm bg-graticule-teal text-white">Save</button>
               </div>
            </div>
         </div>
      )}

      {entitlementModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-sm shadow-xl max-w-md w-full border border-graticule-teal/30">
               <h3 className="text-lg font-serif mb-4">Assess Entitlements</h3>
               {errorMsg && <p className="text-alluvium-red text-xs mb-3">{errorMsg}</p>}
               <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entitlements.housingEntitlement} onChange={e=>setEntitlements({...entitlements, housingEntitlement: e.target.checked})}/> Housing Entitlement</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entitlements.landEntitlement} onChange={e=>setEntitlements({...entitlements, landEntitlement: e.target.checked})}/> Alternative Land</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entitlements.livelihoodEntitlement} onChange={e=>setEntitlements({...entitlements, livelihoodEntitlement: e.target.checked})}/> Livelihood / Training</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entitlements.relocationRequired} onChange={e=>setEntitlements({...entitlements, relocationRequired: e.target.checked})}/> Relocation Required</label>
                  <div className="pt-2 border-t border-graticule-teal/20">
                     <label className="block text-xs text-registry-ink/70 mb-1">Assistance Assessed (₹)</label>
                     <input type="number" min="0" className="w-full border border-graticule-teal/30 p-2 text-sm outline-none" value={entitlements.assistanceAssessed} onChange={e=>setEntitlements({...entitlements, assistanceAssessed: Number(e.target.value)})} />
                  </div>
               </div>
               <div className="flex gap-2 justify-end">
                  <button onClick={() => setEntitlementModal(false)} className="px-4 py-2 text-sm text-registry-ink/70">Cancel</button>
                  <button onClick={() => apiCall('/assess-entitlement', entitlements, setEntitlementModal)} className="px-4 py-2 text-sm bg-graticule-teal text-white">Save Entitlements</button>
               </div>
            </div>
         </div>
      )}

      {verifyModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-sm shadow-xl max-w-sm w-full border border-graticule-teal/30">
               <h3 className="text-lg font-serif mb-4">Verify R&R Case</h3>
               {errorMsg && <p className="text-alluvium-red text-xs mb-3">{errorMsg}</p>}
               <select className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" value={verifyStatus} onChange={e=>setVerifyStatus(e.target.value)}>
                  <option value="VERIFIED">Verified</option>
                  <option value="RETURNED">Return for Correction</option>
               </select>
               <textarea className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" placeholder="Remarks (Required for Return)" value={remarks} onChange={e=>setRemarks(e.target.value)} />
               <div className="flex gap-2 justify-end">
                  <button onClick={() => setVerifyModal(false)} className="px-4 py-2 text-sm text-registry-ink/70">Cancel</button>
                  <button onClick={() => apiCall('/verify', {status: verifyStatus, remarks}, setVerifyModal)} className="px-4 py-2 text-sm bg-graticule-teal text-white">Submit</button>
               </div>
            </div>
         </div>
      )}

      {approveModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-sm shadow-xl max-w-sm w-full border border-graticule-teal/30">
               <h3 className="text-lg font-serif mb-4">Approve R&R Case</h3>
               {errorMsg && <p className="text-alluvium-red text-xs mb-3">{errorMsg}</p>}
               <select className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" value={approveStatus} onChange={e=>setApproveStatus(e.target.value)}>
                  <option value="APPROVED">Approve</option>
                  <option value="RETURNED">Return</option>
                  <option value="REJECTED">Reject</option>
               </select>
               <textarea className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" placeholder="Remarks (Required for Reject/Return)" value={remarks} onChange={e=>setRemarks(e.target.value)} />
               <div className="flex gap-2 justify-end">
                  <button onClick={() => setApproveModal(false)} className="px-4 py-2 text-sm text-registry-ink/70">Cancel</button>
                  <button onClick={() => apiCall('/approve', {status: approveStatus, remarks}, setApproveModal)} className="px-4 py-2 text-sm bg-graticule-teal text-white">Submit</button>
               </div>
            </div>
         </div>
      )}

      {payModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-sm shadow-xl max-w-sm w-full border border-graticule-teal/30">
               <h3 className="text-lg font-serif mb-4">Disburse Assistance</h3>
               {errorMsg && <p className="text-alluvium-red text-xs mb-3">{errorMsg}</p>}
               <div className="text-sm mb-4">Balance: <strong>₹{selectedRecord?.assistanceBalance?.toLocaleString('en-IN') || 0}</strong></div>
               <label className="block text-xs text-registry-ink/70 mb-1">Payment Amount (₹)</label>
               <input type="number" max={selectedRecord?.assistanceBalance || 0} className="w-full border border-graticule-teal/30 p-2 text-sm outline-none mb-4" value={payAmount} onChange={e=>setPayAmount(Number(e.target.value))} />
               <div className="flex gap-2 justify-end">
                  <button onClick={() => setPayModal(false)} className="px-4 py-2 text-sm text-registry-ink/70">Cancel</button>
                  <button onClick={() => apiCall('/pay-assistance', {amount: payAmount}, setPayModal)} className="px-4 py-2 text-sm bg-cultivated-green text-white">Process Payment</button>
               </div>
            </div>
         </div>
      )}

      {implementationModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-registry-ink/20 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-sm shadow-xl max-w-md w-full border border-graticule-teal/30">
               <h3 className="text-lg font-serif mb-4">Implementation Status</h3>
               {errorMsg && <p className="text-alluvium-red text-xs mb-3">{errorMsg}</p>}
               
               <div className="space-y-4 mb-6">
                  {selectedRecord?.housingEntitlement && (
                     <div>
                        <label className="block text-xs text-registry-ink/70 mb-1">Housing Status</label>
                        <select className="w-full border border-graticule-teal/30 p-2 text-sm outline-none" value={implementation.housingStatus} onChange={e=>setImplementation({...implementation, housingStatus: e.target.value})}>
                           <option value="">Select...</option><option value="APPROVED">Approved</option><option value="ALLOCATED">Allocated</option><option value="PROVIDED">Provided</option>
                        </select>
                     </div>
                  )}
                  {selectedRecord?.livelihoodEntitlement && (
                     <div>
                        <label className="block text-xs text-registry-ink/70 mb-1">Livelihood Status</label>
                        <select className="w-full border border-graticule-teal/30 p-2 text-sm outline-none" value={implementation.livelihoodStatus} onChange={e=>setImplementation({...implementation, livelihoodStatus: e.target.value})}>
                           <option value="">Select...</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option>
                        </select>
                     </div>
                  )}
                  {selectedRecord?.relocationRequired && (
                     <div>
                        <label className="block text-xs text-registry-ink/70 mb-1">Relocation Status</label>
                        <select className="w-full border border-graticule-teal/30 p-2 text-sm outline-none" value={implementation.relocationStatus} onChange={e=>setImplementation({...implementation, relocationStatus: e.target.value})}>
                           <option value="">Select...</option><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option>
                        </select>
                     </div>
                  )}
                  <label className="flex items-center gap-2 mt-4 text-sm font-medium">
                     <input type="checkbox" checked={implementation.markSettled} onChange={e=>setImplementation({...implementation, markSettled: e.target.checked})} />
                     Mark R&R Case as SETTLED
                  </label>
               </div>
               
               <div className="flex gap-2 justify-end">
                  <button onClick={() => setImplementationModal(false)} className="px-4 py-2 text-sm text-registry-ink/70">Cancel</button>
                  <button onClick={() => apiCall('/update-implementation', implementation, setImplementationModal)} className="px-4 py-2 text-sm bg-graticule-teal text-white">Save Updates</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
