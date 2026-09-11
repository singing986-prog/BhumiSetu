import fs from 'fs';

const code = `
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
`;
fs.appendFileSync('src/components/RnR.tsx', code);
