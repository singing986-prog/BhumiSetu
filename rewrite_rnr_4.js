import fs from 'fs';

const code = `
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
`;
fs.appendFileSync('src/components/RnR.tsx', code);
