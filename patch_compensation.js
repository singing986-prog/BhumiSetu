import fs from 'fs';
const content = `import { useState, useEffect } from "react";
import { CompensationRecord } from "../types";
import { HandCoins, CheckCircle2, Clock, AlertCircle, Search, X, MapPin, Eye, FileText, Download, Building, ShieldCheck, DollarSign, Filter, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "../api";
import { useTranslation } from "react-i18next";

export function Compensation({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects",
  profile,
  setActiveTab,
  setSelectedProject,
  setSelectedParcelId
}: { 
  selectedState?: string, 
  selectedDistrict?: string, 
  selectedProject?: string,
  profile?: any,
  setActiveTab: (tab: string) => void,
  setSelectedProject: (id: string) => void,
  setSelectedParcelId: (id: string | null) => void
}) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CompensationRecord | null>(null);
  
  // Modals state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [actionRemarks, setActionRemarks] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const fetchRecords = () => {
    setIsLoading(true);
    apiFetch(\`/api/compensation?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject)}\`)
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setRecords(data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setRecords([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedState, selectedDistrict, selectedProject]);

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "Not available";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "PARTIALLY_PAID":
      case "PAYMENT_INITIATED": return <Clock className="w-4 h-4 text-tilled-earth" />;
      case "PENDING": return <Clock className="w-4 h-4 text-registry-ink/60" />;
      default: return <AlertCircle className="w-4 h-4 text-registry-ink/60" />;
    }
  };

  const handleDeepLink = (tab: string, comp: CompensationRecord) => {
    setSelectedProject(comp.projectId);
    if(tab === 'map') {
      setSelectedParcelId(comp.parcelId);
    }
    setActiveTab(tab);
  };

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.referenceId || "").toLowerCase().includes(q) ||
      (r.ulpin || "").toLowerCase().includes(q) ||
      (r.parcelId || "").toLowerCase().includes(q) ||
      (r.projectId || "").toLowerCase().includes(q) ||
      (r.beneficiaryName || "").toLowerCase().includes(q)
    );
  });

  const handleAssessmentSubmit = async () => {
    const mv = Number(marketValue);
    if (isNaN(mv) || mv < 0) return alert(t('Invalid market value', 'Invalid market value'));
    try {
      const res = await apiFetch(\`/api/compensation/\${selectedRecord?.id}/assess\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketValue: mv, additionalComponents: [] })
      });
      if (res.ok) {
        setIsAssessmentModalOpen(false);
        fetchRecords();
        setSelectedRecord(null);
      } else {
        alert(t('Assessment failed', 'Assessment failed'));
      }
    } catch(e) { console.error(e); }
  };

  const handleApprovalAction = async (action: 'APPROVE' | 'REJECT' | 'RETURN') => {
    if (action !== 'APPROVE' && !actionRemarks) {
      return alert(t('Reason is required', 'Reason is required for this action'));
    }
    try {
      const res = await apiFetch(\`/api/compensation/\${selectedRecord?.id}/approve\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: actionRemarks })
      });
      if (res.ok) {
        setIsApprovalModalOpen(false);
        fetchRecords();
        setSelectedRecord(null);
        setActionRemarks("");
      } else {
        alert(t('Action failed', 'Action failed'));
      }
    } catch(e) { console.error(e); }
  };

  const handlePaymentInitiate = async () => {
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) return alert(t('Invalid payment amount', 'Invalid payment amount'));
    try {
      const res = await apiFetch(\`/api/compensation/\${selectedRecord?.id}/pay\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        fetchRecords();
        setSelectedRecord(null);
      } else {
        const err = await res.json();
        alert(err.error || t('Payment failed', 'Payment failed'));
      }
    } catch(e) { console.error(e); }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <HandCoins className="w-8 h-8 text-tilled-earth" />
            {t('Compensation & Disbursement', 'Compensation & Disbursement')}
          </h2>
          <p className="text-registry-ink/60 mt-1">{t('Track statutory assessed compensation including 100% solatium margin.', 'Track statutory assessed compensation including 100% solatium margin.')}</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-registry-ink/50" />
          <input 
            type="text" 
            placeholder={t("Search by Ref ID, ULPIN, Beneficiary...", "Search by Ref ID, ULPIN, Beneficiary...")}
            className="w-full pl-10 pr-4 py-2 border border-graticule-teal/30 rounded-sm focus:outline-none focus:border-tilled-earth text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">{t('Ref ID', 'Ref ID')}</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">{t('ULPIN', 'ULPIN')}</th>
                <th className="px-6 py-4">{t('Beneficiary', 'Beneficiary')}</th>
                <th className="px-6 py-4">{t('Project', 'Project')}</th>
                <th className="px-6 py-4 text-right">{t('Market Value', 'Market Value')}</th>
                <th className="px-6 py-4 text-right">{t('Solatium', 'Solatium')}</th>
                <th className="px-6 py-4 text-right">{t('Total Assessed', 'Total Assessed')}</th>
                <th className="px-6 py-4 text-right">{t('Disbursed', 'Disbursed')}</th>
                <th className="px-6 py-4 text-right">{t('Balance', 'Balance')}</th>
                <th className="px-6 py-4">{t('Status', 'Status')}</th>
                <th className="px-6 py-4 text-right">{t('Actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    {t('Loading compensation records...', 'Loading compensation records...')}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-registry-ink/60">
                    {t('No compensation records found.', 'No compensation records found.')}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={record.id} 
                    className="hover:bg-graticule-teal/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.referenceId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.ulpin}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink">{record.beneficiaryName}</td>
                    <td className="px-6 py-4 text-xs text-registry-ink/80">{record.projectId}</td>
                    <td className="px-6 py-4 text-right text-registry-ink/80">{formatCurrency(record.marketValue)}</td>
                    <td className="px-6 py-4 text-right text-tilled-earth font-medium">+{formatCurrency(record.solatium)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-registry-ink">{formatCurrency(record.totalAssessed)}</td>
                    <td className="px-6 py-4 text-right font-medium text-cultivated-green">{formatCurrency(record.disbursedAmount)}</td>
                    <td className="px-6 py-4 text-right font-medium text-alluvium-red">{formatCurrency(record.balanceAmount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.paymentStatus)}
                        <span className={\`font-medium \${
                          record.paymentStatus === 'PAID' ? 'text-cultivated-green' :
                          record.paymentStatus === 'PARTIALLY_PAID' ? 'text-tilled-earth' :
                          'text-registry-ink/80'
                        }\`}>
                          {t(record.paymentStatus, record.paymentStatus)}
                        </span>
                      </div>
                      <div className="text-[10px] text-registry-ink/50 mt-1 uppercase tracking-wider">{t(record.assessmentStatus, record.assessmentStatus)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         className="px-3 py-1 bg-graticule-teal/10 text-graticule-teal hover:bg-graticule-teal hover:text-white rounded text-xs font-medium transition-colors"
                         onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                       >
                         {t('View Details', 'View Details')}
                       </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && !isAssessmentModalOpen && !isApprovalModalOpen && !isPaymentModalOpen && (
          <div className="fixed inset-0 bg-registry-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-sm shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper/50">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-registry-ink">
                    {t('Compensation Details', 'Compensation Details')}
                  </h3>
                  <p className="text-sm text-registry-ink/60 mt-1 font-mono">{selectedRecord.referenceId} • {selectedRecord.ulpin}</p>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="text-registry-ink/50 hover:text-alluvium-red p-2"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-registry-ink mb-3">{t('Beneficiary Information', 'Beneficiary Information')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-registry-ink/60">{t('Name', 'Name')}</div>
                        <div className="font-medium text-registry-ink">{selectedRecord.beneficiaryName}</div>
                      </div>
                      <div>
                        <div className="text-registry-ink/60">{t('Project', 'Project')}</div>
                        <div className="font-medium text-registry-ink">{selectedRecord.projectId}</div>
                      </div>
                      <div>
                        <div className="text-registry-ink/60">{t('Village', 'Village')}</div>
                        <div className="font-medium text-registry-ink">{selectedRecord.village}</div>
                      </div>
                      <div>
                        <div className="text-registry-ink/60">{t('Area', 'Area')}</div>
                        <div className="font-medium text-registry-ink">{selectedRecord.area} ha</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-registry-ink mb-3">{t('Valuation & Assessment', 'Valuation & Assessment')}</h4>
                    <div className="bg-graticule-teal/5 rounded border border-graticule-teal/10 p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-registry-ink/70">{t('Market Value', 'Market Value')}</span>
                        <span className="font-medium text-registry-ink">{formatCurrency(selectedRecord.marketValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-registry-ink/70">{t('Solatium (100%)', 'Solatium (100%)')}</span>
                        <span className="font-medium text-tilled-earth">+{formatCurrency(selectedRecord.solatium)}</span>
                      </div>
                      {selectedRecord.additionalComponents?.map((comp, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-registry-ink/70">{comp.label}</span>
                          <span className="font-medium text-tilled-earth">+{formatCurrency(comp.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-graticule-teal/20 flex justify-between font-semibold">
                        <span className="text-registry-ink">{t('Total Assessed', 'Total Assessed')}</span>
                        <span className="text-registry-ink">{formatCurrency(selectedRecord.totalAssessed)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-registry-ink mb-3">{t('Quick Links', 'Quick Links')}</h4>
                    <div className="flex flex-wrap gap-2">
                       <button onClick={() => handleDeepLink('map', selectedRecord)} className="flex items-center gap-1.5 px-3 py-1.5 bg-survey-paper text-registry-ink text-xs rounded hover:bg-graticule-teal/10 transition-colors border border-graticule-teal/20">
                         <MapPin className="w-3.5 h-3.5" /> View on Map
                       </button>
                       <button onClick={() => handleDeepLink('workflow', selectedRecord)} className="flex items-center gap-1.5 px-3 py-1.5 bg-survey-paper text-registry-ink text-xs rounded hover:bg-graticule-teal/10 transition-colors border border-graticule-teal/20">
                         <Building className="w-3.5 h-3.5" /> View Workflow
                       </button>
                       <button onClick={() => handleDeepLink('rnr', selectedRecord)} className="flex items-center gap-1.5 px-3 py-1.5 bg-survey-paper text-registry-ink text-xs rounded hover:bg-graticule-teal/10 transition-colors border border-graticule-teal/20">
                         <ShieldCheck className="w-3.5 h-3.5" /> View R&R
                       </button>
                       <button onClick={() => handleDeepLink('documents', selectedRecord)} className="flex items-center gap-1.5 px-3 py-1.5 bg-survey-paper text-registry-ink text-xs rounded hover:bg-graticule-teal/10 transition-colors border border-graticule-teal/20">
                         <FileText className="w-3.5 h-3.5" /> View Documents
                       </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-registry-ink mb-3">{t('Payment Status', 'Payment Status')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="bg-survey-paper/50 p-3 border border-graticule-teal/10 rounded">
                        <div className="text-registry-ink/60 mb-1">{t('Approved Amount', 'Approved Amount')}</div>
                        <div className="font-semibold text-lg text-registry-ink">{formatCurrency(selectedRecord.approvedAmount)}</div>
                      </div>
                      <div className="bg-cultivated-green/5 p-3 border border-cultivated-green/20 rounded">
                        <div className="text-cultivated-green/70 mb-1">{t('Disbursed Amount', 'Disbursed Amount')}</div>
                        <div className="font-semibold text-lg text-cultivated-green">{formatCurrency(selectedRecord.disbursedAmount)}</div>
                      </div>
                      <div className="bg-alluvium-red/5 p-3 border border-alluvium-red/20 rounded col-span-2">
                        <div className="text-alluvium-red/70 mb-1">{t('Balance Pending', 'Balance Pending')}</div>
                        <div className="font-semibold text-xl text-alluvium-red">{formatCurrency(selectedRecord.balanceAmount)}</div>
                      </div>
                    </div>
                    
                    {selectedRecord.paymentHistory && selectedRecord.paymentHistory.length > 0 && (
                      <div className="mt-4">
                         <h5 className="text-xs font-semibold uppercase text-registry-ink/60 mb-2">{t('Payment History', 'Payment History')}</h5>
                         <div className="space-y-2">
                           {selectedRecord.paymentHistory.map((ph: any, idx: number) => (
                             <div key={idx} className="flex justify-between items-center text-xs p-2 bg-survey-paper border border-graticule-teal/10 rounded">
                               <div>
                                 <div className="font-medium text-registry-ink">{ph.reference}</div>
                                 <div className="text-registry-ink/50">{ph.date} • {ph.initiatedBy}</div>
                               </div>
                               <div className="text-right">
                                 <div className="font-semibold text-cultivated-green">{formatCurrency(ph.amount)}</div>
                                 <div className="text-registry-ink/60">{ph.status}</div>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {profile?.role !== "Auditor" && profile?.role !== "Affected Citizen" && (
                <div className="p-4 border-t border-graticule-teal/20 bg-survey-paper flex justify-end gap-3">
                   {(selectedRecord.assessmentStatus === 'DRAFT' || selectedRecord.assessmentStatus === 'RETURNED') && (
                     <button onClick={() => setIsAssessmentModalOpen(true)} className="px-4 py-2 bg-graticule-teal text-white rounded font-medium hover:bg-tilled-earth transition-colors text-sm">
                       {t('Assess Compensation', 'Assess Compensation')}
                     </button>
                   )}
                   {selectedRecord.assessmentStatus === 'SUBMITTED' && (
                     <button onClick={() => setIsApprovalModalOpen(true)} className="px-4 py-2 bg-tilled-earth text-white rounded font-medium hover:bg-graticule-teal transition-colors text-sm">
                       {t('Review & Approve', 'Review & Approve')}
                     </button>
                   )}
                   {selectedRecord.assessmentStatus === 'APPROVED' && selectedRecord.balanceAmount > 0 && (
                     <button onClick={() => { setPaymentAmount(selectedRecord.balanceAmount.toString()); setIsPaymentModalOpen(true); }} className="px-4 py-2 bg-cultivated-green text-white rounded font-medium hover:bg-green-700 transition-colors text-sm">
                       {t('Initiate Payment', 'Initiate Payment')}
                     </button>
                   )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assessment Modal */}
      {isAssessmentModalOpen && selectedRecord && (
         <div className="fixed inset-0 bg-registry-ink/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded p-6 shadow-xl w-full max-w-md">
              <h3 className="text-lg font-serif font-semibold text-registry-ink mb-4">{t('Assess Compensation', 'Assess Compensation')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-registry-ink/70 mb-1">{t('Market Value (INR)', 'Market Value (INR)')}</label>
                  <input type="number" min="0" value={marketValue} onChange={(e) => setMarketValue(e.target.value)} className="w-full px-3 py-2 border border-graticule-teal/30 rounded focus:border-tilled-earth outline-none" />
                </div>
                <div className="text-xs text-registry-ink/60 bg-survey-paper p-3 rounded">
                  {t('Note: Solatium (100%) will be automatically calculated and added to the total assessed amount upon submission.', 'Note: Solatium (100%) will be automatically calculated and added to the total assessed amount upon submission.')}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                 <button onClick={() => setIsAssessmentModalOpen(false)} className="px-4 py-2 text-registry-ink/70 hover:bg-graticule-teal/10 rounded">{t('Cancel', 'Cancel')}</button>
                 <button onClick={handleAssessmentSubmit} className="px-4 py-2 bg-graticule-teal text-white rounded hover:bg-tilled-earth">{t('Submit Assessment', 'Submit Assessment')}</button>
              </div>
            </div>
         </div>
      )}

      {/* Approval Modal */}
      {isApprovalModalOpen && selectedRecord && (
         <div className="fixed inset-0 bg-registry-ink/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded p-6 shadow-xl w-full max-w-md">
              <h3 className="text-lg font-serif font-semibold text-registry-ink mb-4">{t('Review Assessment', 'Review Assessment')}</h3>
              <div className="mb-4">
                <div className="text-sm text-registry-ink/70 mb-1">{t('Total Assessed Amount', 'Total Assessed Amount')}</div>
                <div className="text-xl font-semibold text-registry-ink">{formatCurrency(selectedRecord.totalAssessed)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-registry-ink/70 mb-1">{t('Remarks (Required for Reject/Return)', 'Remarks (Required for Reject/Return)')}</label>
                <textarea value={actionRemarks} onChange={(e) => setActionRemarks(e.target.value)} rows={3} className="w-full px-3 py-2 border border-graticule-teal/30 rounded focus:border-tilled-earth outline-none"></textarea>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                 <button onClick={() => setIsApprovalModalOpen(false)} className="px-4 py-2 text-registry-ink/70 hover:bg-graticule-teal/10 rounded">{t('Cancel', 'Cancel')}</button>
                 <button onClick={() => handleApprovalAction('REJECT')} className="px-4 py-2 border border-alluvium-red text-alluvium-red rounded hover:bg-alluvium-red/10">{t('Reject', 'Reject')}</button>
                 <button onClick={() => handleApprovalAction('RETURN')} className="px-4 py-2 border border-tilled-earth text-tilled-earth rounded hover:bg-tilled-earth/10">{t('Return', 'Return')}</button>
                 <button onClick={() => handleApprovalAction('APPROVE')} className="px-4 py-2 bg-cultivated-green text-white rounded hover:bg-green-700">{t('Approve', 'Approve')}</button>
              </div>
            </div>
         </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedRecord && (
         <div className="fixed inset-0 bg-registry-ink/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded p-6 shadow-xl w-full max-w-md">
              <h3 className="text-lg font-serif font-semibold text-registry-ink mb-4">{t('Initiate PFMS Demo Payment', 'Initiate PFMS Demo Payment')}</h3>
              
              <div className="bg-survey-paper p-3 rounded mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-registry-ink/70">{t('Approved Amount', 'Approved Amount')}</span>
                  <span className="font-medium text-registry-ink">{formatCurrency(selectedRecord.approvedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-alluvium-red/80">{t('Maximum Balance Available', 'Maximum Balance Available')}</span>
                  <span className="font-semibold text-alluvium-red">{formatCurrency(selectedRecord.balanceAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink/70 mb-1">{t('Amount to Pay (INR)', 'Amount to Pay (INR)')}</label>
                <input type="number" min="1" max={selectedRecord.balanceAmount} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-3 py-2 border border-graticule-teal/30 rounded focus:border-tilled-earth outline-none" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                 <button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-registry-ink/70 hover:bg-graticule-teal/10 rounded">{t('Cancel', 'Cancel')}</button>
                 <button onClick={handlePaymentInitiate} className="px-4 py-2 bg-cultivated-green text-white rounded hover:bg-green-700">{t('Initiate PFMS Payment', 'Initiate PFMS Payment')}</button>
              </div>
            </div>
         </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/Compensation.tsx', content);
