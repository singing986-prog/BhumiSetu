import { apiFetch } from "../api";
import React, { useState, useEffect } from 'react';
import { Proposal } from "../types";
import { Plus, ArrowLeft, Clock, CheckCircle2, AlertCircle, FileText, Search, Filter, MessageSquare, Edit, Ban, FileSignature, Layers } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../i18n";
import { GISMap } from "./Map";

export function Proposals({ profile, setActiveTab, setSelectedProject, selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { profile?: any, setActiveTab?: (t: string) => void, setSelectedProject?: (p: string) => void, selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const { t } = useTranslation();
  const [proposals, setProposals] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [activeProposal, setActiveProposal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  
  const [scrutinyModal, setScrutinyModal] = useState<any>(null);
  const [scrutinyRemarks, setScrutinyRemarks] = useState("");

  useEffect(() => {
    fetchProposals();
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/proposals?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`);
      const data = await res.json();
      setProposals(data);
      if (activeProposal) {
         const updated = data.find((p: any) => p.id === activeProposal.id);
         if (updated) setActiveProposal(updated);
      }
    } catch (err) {
      console.error("Failed to load proposals", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isReadOnly = profile?.role === "Auditor" || profile?.role === "Affected Citizen" || profile?.role === "Field Surveyor";
  const canAdmin = profile?.role === "Super Admin" || profile?.role === "State Nodal Officer" || profile?.role === "Central Ministry Officer";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "Under Scrutiny": return <Clock className="w-4 h-4 text-tilled-earth" />;
      case "Query Raised": return <MessageSquare className="w-4 h-4 text-tilled-earth" />;
      case "Returned for Correction": return <AlertCircle className="w-4 h-4 text-alluvium-red" />;
      case "Rejected": return <Ban className="w-4 h-4 text-alluvium-red" />;
      case "Submitted": return <FileSignature className="w-4 h-4 text-graticule-teal" />;
      default: return <FileText className="w-4 h-4 text-registry-ink/60" />;
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent, action: "save" | "submit") => {
    e.preventDefault();
    if (!formData.projectName || !formData.ministry || !formData.category || !formData.state || !formData.areaRequired) {
       alert("Please fill all required fields.");
       return;
    }
    
    // Simulate API call
    try {
      const res = await apiFetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, action }),
      });
      
      const data = await res.json();
      if (!data.error) {
        if(formData.attachedFile) {
           const docFormData = new FormData();
           docFormData.append('file', formData.attachedFile);
           await apiFetch(`/api/proposals/${data.proposal.id}/documents`, {
               method: "POST",
               body: docFormData,
           });
        }
        await fetchProposals();
        setActiveProposal(data.proposal);
        setView("detail");
      }
 else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Failed", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent, action: "save" | "submit" | "resubmit") => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/api/proposals/${activeProposal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, action }),
      });
      const data = await res.json();
      if (!data.error) {
        await fetchProposals();
        setActiveProposal(data.proposal);
        setView("detail");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Failed", err);
    }
  };

  const handleWorkflowAction = async (actionId: string) => {
    try {
      const res = await apiFetch(`/api/proposals/${activeProposal.id}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, remarks: scrutinyRemarks }),
      });
      const data = await res.json();
      if (!data.error) {
        await fetchProposals();
        setActiveProposal(data.proposal);
        setScrutinyModal(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Failed", err);
    }
  };

  const filteredProposals = proposals.filter(p => {
     if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.id.toLowerCase().includes(q) || p.projectName.toLowerCase().includes(q) || p.ministry.toLowerCase().includes(q);
     }
     return true;
  });

  const districtsByState: Record<string, string[]> = {
    "Uttar Pradesh": ["Gautam Buddha Nagar", "Lucknow", "Kanpur"],
    "Haryana": ["Gurugram", "Nuh", "Karnal", "Panipat"],
    "Maharashtra": ["Pune", "Mumbai", "Thane"],
    "Karnataka": ["Bengaluru", "Mysuru"]
  };

  if (view === "create" || view === "edit") {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full">
        <button 
          onClick={() => setView(view === "edit" ? "detail" : "list")}
          className="flex items-center gap-2 text-sm text-graticule-teal hover:text-registry-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {view === "edit" ? "Back to Proposal" : "Back to Proposals"}
        </button>
        
        <div className="bg-white border border-graticule-teal/30 p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-graticule-teal/30 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-registry-ink">{view === "edit" ? "Edit Proposal" : "New Project Proposal"}</h2>
              <p className="text-registry-ink/60 text-sm mt-1">Step {step} of 5</p>
            </div>
            <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`w-8 h-2 rounded-full ${step >= s ? 'bg-tilled-earth' : 'bg-graticule-teal/20'}`} />
               ))}
            </div>
          </div>

          <form className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Name *</label>
                  <input required value={formData.projectName || ""} onChange={e => setFormData({...formData, projectName: e.target.value})} type="text" className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-registry-ink mb-1">Requiring Ministry *</label>
                  <select required value={formData.ministry || ""} onChange={e => setFormData({...formData, ministry: e.target.value})} className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-white">
                    <option value="">Select Ministry...</option>
                    <option value="MoRTH">Ministry of Road Transport & Highways</option>
                    <option value="Ministry of Railways">Ministry of Railways</option>
                    <option value="MoHUA">Ministry of Housing & Urban Affairs</option>
                    <option value="MNRE">Ministry of New & Renewable Energy</option>
                    <option value="MoUD">Ministry of Urban Development</option>
                    <option value="MoCA">Ministry of Civil Aviation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Category *</label>
                  <select required value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-white">
                    <option value="">Select Category...</option>
                    <option value="Highway">Highway</option>
                    <option value="Rail">Rail</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Industrial Corridor">Industrial Corridor</option>
                    <option value="Urban Development">Urban Development</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Implementing Agency</label>
                  <input value={formData.implementingAgency || ""} onChange={e => setFormData({...formData, implementingAgency: e.target.value})} type="text" className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Objective</label>
                  <textarea value={formData.objective || ""} onChange={e => setFormData({...formData, objective: e.target.value})} className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50 h-24" />
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-registry-ink mb-1">Primary State *</label>
                  <select required value={formData.state || ""} onChange={e => setFormData({...formData, state: e.target.value, district: ""})} className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-white">
                    <option value="">Select State...</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-registry-ink mb-1">Primary District *</label>
                  <select required disabled={!formData.state} value={formData.district || ""} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-white disabled:opacity-50">
                    <option value="">Select District...</option>
                    {(districtsByState[formData.state] || []).map(d => (
                       <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Estimated Area Required (Hectares) *</label>
                  <input required value={formData.areaRequired || ""} onChange={e => setFormData({...formData, areaRequired: e.target.value})} type="number" step="0.01" className="w-full md:w-1/2 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Project Footprint (GeoJSON Geometry)</label>
                  <textarea placeholder='{"type": "Polygon", "coordinates": [...]}' value={formData.footprint || ""} onChange={e => setFormData({...formData, footprint: e.target.value})} className="w-full h-24 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50 font-mono text-xs" />
                </div>

              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Target Start Date</label>
                  <input type="date" value={formData.targetStartDate || ""} onChange={e => setFormData({...formData, targetStartDate: e.target.value})} className="w-full md:w-1/2 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-registry-ink mb-1">Target Land Acquisition Completion</label>
                  <input type="date" value={formData.targetEndDate || ""} onChange={e => setFormData({...formData, targetEndDate: e.target.value})} className="w-full md:w-1/2 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth bg-survey-paper/50" />
                </div>
              </div>
            )}

            
            
            
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-registry-ink border-b border-registry-ink/10 pb-2">Supporting Documents</h3>
                <div className="bg-survey-paper/30 p-4 border border-graticule-teal/20 rounded-sm">
                  <p className="text-sm text-registry-ink/70 mb-3">Upload relevant preliminary documents (KML alignment, concept note, etc.)</p>
                  <div className="flex items-center gap-4">
                     <input type="file" onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if(file && activeProposal) {
                             const docFormData = new FormData();
                             docFormData.append('file', file);
                             try {
                                 const res = await apiFetch(`/api/proposals/${activeProposal.id}/documents`, {
                                     method: "POST",
                                     body: docFormData,
                                     headers: { "Accept": "application/json" } // Don't set Content-Type, let browser set it with boundary
                                 });
                                 const data = await res.json();
                                 if(!data.error) {
                                     alert("Document uploaded successfully with SHA-256 validation.");
                                 } else {
                                     alert("Error: " + data.error);
                                 }
                             } catch(e) {
                                 console.error(e);
                                 alert("Upload failed.");
                             }
                         } else if (file && !activeProposal) {
                             // Temporarily store file in state for creation mode
                             setFormData({...formData, attachedFile: file, attachedFileName: file.name});
                         }
                     }} className="text-sm text-registry-ink/80 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-graticule-teal/10 file:text-graticule-teal hover:file:bg-graticule-teal/20 cursor-pointer" />
                  </div>
                  {formData.attachedFileName && <div className="mt-2 text-sm text-cultivated-green">Prepared for submission: {formData.attachedFileName}</div>}
                </div>
              </div>
            )}



            {step === 5 && (
              <div className="space-y-4">
<h3 className="font-semibold text-registry-ink border-b border-registry-ink/10 pb-2">Review Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {formData.projectName}</div>
                  <div><strong>Ministry:</strong> {formData.ministry}</div>
                  <div><strong>State:</strong> {formData.state}</div>
                  <div><strong>District:</strong> {formData.district}</div>
                  <div><strong>Area:</strong> {formData.areaRequired} Ha</div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-graticule-teal/30 flex justify-between">
              <div>
                 {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/10 transition-colors">Previous</button>
                 )}
              </div>
              <div className="flex gap-4">
                {step < 5 ? (
                   <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-2 bg-tilled-earth text-white font-medium hover:bg-tilled-earth/90 transition-colors">Next</button>
                ) : (
                   <>
                     <button type="button" onClick={(e) => view === "edit" ? handleEditSubmit(e, "save") : handleCreateSubmit(e, "save")} className="px-6 py-2 text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/10 transition-colors">Save Draft</button>
                     <button type="button" onClick={(e) => view === "edit" ? handleEditSubmit(e, activeProposal.status === "Returned for Correction" ? "resubmit" : "submit") : handleCreateSubmit(e, "submit")} className="px-6 py-2 bg-tilled-earth text-white font-medium hover:bg-tilled-earth/90 transition-colors">Submit for Scrutiny</button>
                   </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "detail" && activeProposal) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full">
        <button onClick={() => setView("list")} className="flex items-center gap-2 text-sm text-graticule-teal hover:text-registry-ink mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <div className="bg-white border border-graticule-teal/30 shadow-sm p-6 mb-6">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <div className="text-xs font-mono text-graticule-teal mb-1">{activeProposal.id}</div>
                 <h2 className="text-3xl font-serif font-semibold text-registry-ink">{activeProposal.projectName}</h2>
                 <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-0.5 bg-registry-ink/5 text-registry-ink text-xs rounded-sm">{activeProposal.category}</span>
                    <span className="px-2 py-0.5 bg-registry-ink/5 text-registry-ink text-xs rounded-sm">{activeProposal.ministry}</span>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-graticule-teal/5 border border-graticule-teal/20 rounded-sm">
                    {getStatusIcon(activeProposal.status)}
                    <span className="text-sm font-medium">{activeProposal.status}</span>
                 </div>
                 {!isReadOnly && (activeProposal.status === "Draft" || activeProposal.status === "Returned for Correction" || activeProposal.status === "Query Raised") && (
                    <button onClick={() => { setFormData({...activeProposal}); setStep(1); setView("edit"); }} className="flex items-center gap-1 text-sm text-tilled-earth hover:underline"><Edit className="w-4 h-4"/> Edit</button>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                 <div>
                    <div className="text-xs text-registry-ink/60 uppercase tracking-wider mb-1">Location</div>
                    <div className="text-sm font-medium">{activeProposal.district}, {activeProposal.state}</div>
                 </div>
                 <div>
                    <div className="text-xs text-registry-ink/60 uppercase tracking-wider mb-1">Area Required</div>
                    <div className="text-sm font-medium">{activeProposal.areaRequired} Hectares</div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <div className="text-xs text-registry-ink/60 uppercase tracking-wider mb-1">Implementing Agency</div>
                    <div className="text-sm font-medium">{activeProposal.implementingAgency || "Not Specified"}</div>
                 </div>
                 <div>
                    <div className="text-xs text-registry-ink/60 uppercase tracking-wider mb-1">Submitted On</div>
                    <div className="text-sm font-medium">{activeProposal.dateSubmitted || "Not Submitted"}</div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <div className="text-xs text-registry-ink/60 uppercase tracking-wider mb-1">Objective</div>
                    <div className="text-sm font-medium text-registry-ink/80">{activeProposal.objective || "No objective provided."}</div>
                 </div>
              </div>
           </div>
        
           <div className="flex gap-4 mb-6 pt-6 border-t border-graticule-teal/30">
              <button onClick={() => { if (setSelectedProject) setSelectedProject(activeProposal.id); if (setActiveTab) setActiveTab("map"); }} className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/10">View on Map</button>
              <button onClick={() => { if (setSelectedProject) setSelectedProject(activeProposal.id); if (setActiveTab) setActiveTab("documents"); }} className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/10">View Documents</button>
              <button onClick={() => { if (setSelectedProject) setSelectedProject(activeProposal.id); if (setActiveTab) setActiveTab("dashboard"); }} className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 text-registry-ink text-sm hover:bg-graticule-teal/10">View Workflow</button>
           </div>
        </div>

        {activeProposal.scrutinyQuery && activeProposal.status === "Query Raised" && (

           <div className="bg-tilled-earth/5 border border-tilled-earth/30 p-4 mb-6 rounded-sm">
              <div className="flex items-center gap-2 font-semibold text-tilled-earth mb-2"><MessageSquare className="w-4 h-4"/> Query Raised by Reviewer</div>
              <p className="text-sm text-registry-ink/80">{activeProposal.scrutinyQuery}</p>
              {!isReadOnly && <button onClick={() => handleWorkflowAction("RESPOND_QUERY")} className="mt-4 px-4 py-1.5 bg-tilled-earth text-white text-sm hover:bg-tilled-earth/90">Respond & Resubmit</button>}
           </div>
        )}

        {activeProposal.scrutinyCorrection && activeProposal.status === "Returned for Correction" && (
           <div className="bg-alluvium-red/5 border border-alluvium-red/30 p-4 mb-6 rounded-sm">
              <div className="flex items-center gap-2 font-semibold text-alluvium-red mb-2"><AlertCircle className="w-4 h-4"/> Returned for Correction</div>
              <p className="text-sm text-registry-ink/80">{activeProposal.scrutinyCorrection}</p>
           </div>
        )}

        <div className="flex gap-4 mb-6">
           {canAdmin && activeProposal.status === "Under Scrutiny" && (
              <>
                <button onClick={() => setScrutinyModal("APPROVE")} className="px-4 py-2 bg-cultivated-green text-white text-sm font-medium rounded-sm">Approve Proposal</button>
                <button onClick={() => setScrutinyModal("RAISE_QUERY")} className="px-4 py-2 border border-tilled-earth text-tilled-earth text-sm font-medium rounded-sm">Raise Query</button>
                <button onClick={() => setScrutinyModal("RETURN_FOR_CORRECTION")} className="px-4 py-2 border border-alluvium-red text-alluvium-red text-sm font-medium rounded-sm">Return for Correction</button>
                <button onClick={() => setScrutinyModal("REJECT")} className="px-4 py-2 bg-alluvium-red text-white text-sm font-medium rounded-sm">Reject</button>
              </>
           )}
           {canAdmin && activeProposal.status === "Submitted" && (
              <button onClick={() => handleWorkflowAction("START_SCRUTINY")} className="px-4 py-2 bg-tilled-earth text-white text-sm font-medium rounded-sm">Start Scrutiny</button>
           )}
        </div>
        
        {scrutinyModal && (
           <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 max-w-md w-full shadow-xl">
                 <h3 className="font-serif font-semibold mb-4 text-lg">Action: {scrutinyModal.replace(/_/g, " ")}</h3>
                 <textarea value={scrutinyRemarks} onChange={e => setScrutinyRemarks(e.target.value)} placeholder="Enter remarks (required for rejection/return)..." className="w-full h-24 p-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth text-sm mb-4" />
                 <div className="flex justify-end gap-3">
                    <button onClick={() => setScrutinyModal(null)} className="px-4 py-1.5 border border-registry-ink/20">Cancel</button>
                    <button onClick={() => handleWorkflowAction(scrutinyModal)} className="px-4 py-1.5 bg-registry-ink text-white">Confirm</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink">{t("proposals.title", "Project Proposals")}</h2>
          <p className="text-registry-ink/60 mt-1">{t("proposals.desc", "Manage early-stage land acquisition proposals and approvals")}</p>
        </div>
        {!isReadOnly && (
           <button onClick={() => { setFormData({}); setStep(1); setView("create"); }} className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm">
             <Plus className="w-4 h-4" /> New Proposal
           </button>
        )}
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden mb-6 flex items-center p-2">
         <Search className="w-5 h-5 text-registry-ink/40 ml-2" />
         <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by Proposal ID, Project Name, or Ministry..." className="w-full px-4 py-2 outline-none text-sm" />
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Reference ID</th>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Ministry</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Area (Ha)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-graticule-teal animate-pulse">Loading proposals...</td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-registry-ink/60">No proposals found.</td>
                </tr>
              ) : (
                filteredProposals.map((proposal, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={proposal.id} 
                    onClick={() => { setActiveProposal(proposal); setView("detail"); }}
                    className="hover:bg-graticule-teal/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{proposal.id}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink max-w-[250px] truncate" title={proposal.projectName}>{proposal.projectName}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{proposal.ministry}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{proposal.district}, {proposal.state}</td>
                    <td className="px-6 py-4 font-mono text-registry-ink/80">{proposal.areaRequired?.toFixed(2) || "0.00"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proposal.status)}
                        <span className="font-medium text-registry-ink/80">{proposal.status}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
