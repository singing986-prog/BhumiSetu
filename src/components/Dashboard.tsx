import { apiFetch } from "../api";
import React from 'react';
import { useState, useEffect } from "react";
import { KPI } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, Circle, AlertCircle, X, FileText, File, Eye, Download } from "lucide-react";
import { useTranslation } from "../i18n";

function AnimatedCounter({ value }: { value: string | number }) {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  useEffect(() => {
    if (isNaN(numericValue)) return;
    let start = 0;
    const duration = 1000;
    const increment = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue]);

  if (isNaN(numericValue)) return <>{value}</>;
  
  // Format based on magnitude
  let formatted = Math.floor(count).toLocaleString('en-IN');
  return <>{formatted}</>;
}

export function KPILedger({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks", onNavigate }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string, onNavigate?: (tab: string) => void }) {
  const [kpis, setKpis] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    apiFetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`)
      .then((res) => res.json())
      .then((data) => setKpis(data));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  if (!kpis) return <div className="h-24 animate-pulse bg-graticule-teal/10" />;

  const metrics = [
    { label: t("dashboard.kpi.areaNotified"), value: kpis?.areaNotified ?? 0, change: kpis?.changes?.areaNotified, action: () => onNavigate?.("proposals") },
    { label: t("dashboard.kpi.areaAcquired"), value: kpis?.areaAcquired ?? 0, change: kpis?.changes?.areaAcquired, action: () => onNavigate?.("map") },
    { label: t("dashboard.kpi.compAssessed"), value: kpis?.compensationAssessed ?? 0, change: kpis?.changes?.compensationAssessed, action: () => onNavigate?.("compensation") },
    { label: t("dashboard.kpi.compPaid"), value: kpis?.compensationDisbursed ?? 0, change: kpis?.changes?.compensationDisbursed, action: () => onNavigate?.("compensation") },
    { label: t("dashboard.kpi.familiesAffected"), value: kpis?.familiesAffected ?? 0, change: kpis?.changes?.familiesAffected, action: () => onNavigate?.("rnr") },
    { label: t("dashboard.kpi.rnrSettled"), value: kpis?.familiesRnR ?? 0, change: kpis?.changes?.familiesRnR, action: () => onNavigate?.("rnr") },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-y border-graticule-teal/30 bg-survey-paper">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          key={metric.label}
          onClick={metric.action}
          className={`flex-1 min-w-[160px] p-3 py-4 cursor-pointer hover:bg-graticule-teal/5 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-graticule-teal ${i !== metrics.length - 1 ? "border-r border-graticule-teal" : ""}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); metric.action?.(); } }}
        >
          <div className="text-xs text-registry-ink/60 font-medium uppercase tracking-wider mb-1">
            {metric.label}
          </div>
          <div className="text-2xl font-serif font-semibold text-registry-ink flex items-end justify-between">
            <AnimatedCounter value={metric.value} />
            {metric.change !== undefined && (
              <span className={`text-[10px] font-sans font-medium pb-1 hidden lg:block ${metric.change >= 0 ? 'text-cultivated-green' : 'text-alluvium-red'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            )}
          </div>
          <div className="text-[10px] text-registry-ink/40 mt-1 hidden lg:block">vs previous reporting period</div>
        </motion.div>
      ))}
    </div>
  );
}

export function FilterBar({ 
  profile,
  selectedState, setSelectedState, 
  selectedDistrict, setSelectedDistrict, 
  selectedProject, setSelectedProject,
  searchQuery, setSearchQuery,
  selectedStage, setSelectedStage,
  selectedCategory, setSelectedCategory,
  selectedRisk, setSelectedRisk
}: { 
  profile?: any,
  selectedState: string, setSelectedState: (s: string) => void,
  selectedDistrict: string, setSelectedDistrict: (d: string) => void,
  selectedProject: string, setSelectedProject: (p: string) => void,
  searchQuery?: string, setSearchQuery?: (q: string) => void,
  selectedStage?: string, setSelectedStage?: (s: string) => void,
  selectedCategory?: string, setSelectedCategory?: (c: string) => void,
  selectedRisk?: string, setSelectedRisk?: (r: string) => void
}) {
  const [projects, setProjects] = useState<any[]>([]);
  const [locations, setLocations] = useState<Record<string, string[]>>({"All States": ["All Districts"]});
  const { t } = useTranslation();
  // using props for search now
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    apiFetch(`/api/projects?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&stage=${encodeURIComponent(selectedStage || "All Stages")}&category=${encodeURIComponent(selectedCategory || "All Categories")}&risk=${encodeURIComponent(selectedRisk || "All Risks")}`)
      .then(r => r.json()).then(data => setProjects(data));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);


  useEffect(() => {
    apiFetch('/api/locations').then(r => r.json()).then(data => setLocations(data));
  }, []);
  
  const currentDistricts = locations[selectedState] || ["All Districts"];
  
  // Remove old stateDistricts
  /*
    "All States": ["All Districts"],
    "Delhi": ["All Districts", "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Haryana": ["All Districts", "Nuh", "Gurugram", "Faridabad", "Rohtak", "Hisar", "Ambala"],
    "Uttar Pradesh": ["All Districts", "Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Meerut"],
    "Maharashtra": ["All Districts", "Pune", "Mumbai", "Nashik", "Nagpur", "Thane"],
    "Tamil Nadu": ["All Districts", "Chennai", "Kanchipuram", "Coimbatore", "Madurai"]
  };
  */

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if(setSearchQuery) setSearchQuery(val);
    if (val.length > 2) {
      apiFetch(`/api/search?q=${encodeURIComponent(val)}`).then(r => r.json()).then(data => setSearchResults(data));
    } else {
      setSearchResults([]);
    }
  };

  const resetFilters = () => {
    setSelectedState("All States");
    setSelectedDistrict("All Districts");
    setSelectedProject("All Projects");
    if(setSearchQuery) setSearchQuery("");
    if(setSelectedStage) setSelectedStage("All Stages");
    if(setSelectedCategory) setSelectedCategory("All Categories");
    if(setSelectedRisk) setSelectedRisk("All Risks");
    setSearchResults([]);
  };

  return (
    <div className="bg-white border-b border-graticule-teal/30 p-4 flex flex-col gap-4 text-sm z-40 relative">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-registry-ink/60 uppercase tracking-wider text-[10px] w-12">{t("filter.scope", "Scope")}</span>
          <select disabled={profile?.state && profile.state !== 'All' && profile.state !== 'All States'} value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict("All Districts"); setSelectedProject("All Projects"); }} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer disabled:opacity-50">
            {Object.keys(locations).map(s => <option key={s} value={s}>{t("state." + s.toLowerCase().replace(/ /g, ""), s)}</option>)}
          </select>
          <span className="text-graticule-teal/30">/</span>
          <select disabled={profile?.district && profile.district !== 'All' && profile.district !== 'All Districts'} value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedProject("All Projects"); }} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer max-w-[150px] disabled:opacity-50">
            {currentDistricts.map(d => <option key={d} value={d}>{t("district." + d.toLowerCase().replace(/ /g, ""), d)}</option>)}
          </select>
          <span className="text-graticule-teal/30">/</span>
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer max-w-[200px] truncate">
            <option value="All Projects">{t("filter.allProjects")}</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-graticule-teal/10 pt-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-registry-ink/60 uppercase tracking-wider text-[10px] w-12">{t("filter.filter", "Filter")}</span>
          <div className="relative">
            <input type="text" value={searchQuery || ""} onChange={handleSearch} placeholder={t("filter.searchPlaceholder", "Search ULPIN, Village, or Project...")} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none focus:border-graticule-teal w-64" />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-graticule-teal/30 shadow-lg rounded-sm overflow-hidden z-50">
                {searchResults.map((r, i) => (
                  <div key={i} className="px-3 py-2 hover:bg-graticule-teal/5 cursor-pointer border-b border-graticule-teal/10 last:border-0" onClick={() => { 
    if(setSearchQuery) setSearchQuery(r.id || r.name); 
    setSearchResults([]);
    if (r.type === "Project") {
      setSelectedProject(r.id);
      // Try to extract state and district if available in detail (e.g. "Haryana • Nuh")
      const parts = r.detail.split(' • ');
      if (parts.length === 2) {
        setSelectedState(parts[0]);
        setSelectedDistrict(parts[1]);
      }
    } else if (r.type === "Parcel") {
      const parts = r.detail.split(' • ');
      if (parts.length === 2) {
        setSelectedState(parts[0]);
        setSelectedDistrict(parts[1]);
      }
    }
  }}>
                    <div className="text-xs font-semibold text-registry-ink">{r.name}</div>
                    <div className="text-[10px] text-registry-ink/60">{r.type} • {r.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <select value={selectedStage} onChange={e => setSelectedStage && setSelectedStage(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            <option>{t("filter.allStages")}</option><option>Notification</option><option>Declaration</option><option>Award</option><option>Compensation</option><option>Possession</option><option>R&R</option>
          </select>
          <select value={selectedCategory} onChange={e => setSelectedCategory && setSelectedCategory(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            <option>{t("filter.allCategories")}</option><option>Highway</option><option>Rail</option><option>Irrigation</option><option>Industrial Corridor</option><option>Urban Development</option><option>Renewable Energy</option><option>Other</option>
          </select>
          <select value={selectedRisk} onChange={e => setSelectedRisk && setSelectedRisk(e.target.value)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            <option>{t("filter.allRisks")}</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <button onClick={resetFilters} className="px-3 py-1.5 text-xs text-graticule-teal hover:underline ml-auto">{t("filter.resetFilters")}</button>
        </div>
      </div>
    </div>
  );
}


export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const { t } = useTranslation();
  const [stages, setStages] = useState<any[]>([]);
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<any>(null);
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
    
    apiFetch(`/api/documents?state=${encodeURIComponent(selectedState || '')}&project=${encodeURIComponent(selectedProject || '')}&stage=${encodeURIComponent(apiStage)}`)
      .then(r => r.json())
      .then(data => {
        setDocuments(data);
        setDocsLoading(false);
      });
  };

  useEffect(() => {
    apiFetch(`/api/workflow?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`).then(r => r.json()).then(data => {
      setStages(data.map((s: any) => {
        return { ...s, name: t(`workflow.${s.name}`), displayDate: s.display || s.date };
      }));
    });
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk, t]);

  const contextLabel = selectedProject !== "All Projects" ? `Project ${selectedProject.split('-').pop()}` : (selectedDistrict !== "All Districts" ? `${selectedDistrict} Aggregate` : `${selectedState} Aggregate`);

  const checkLapse = () => {
    // Rely on new status fields
    const poss = stages.find(s => s.id === 5);
    const comp = stages.find(s => s.id === 4);
    if (poss && poss.status === 'OVERDUE' && poss.daysOverdue > 365) return true;
    if (comp && comp.status === 'OVERDUE' && comp.daysOverdue > 180) return true;
    return false;
  };
  const isLapseRisk = checkLapse();
  
  const [executeModal, setExecuteModal] = useState<any>(null);
  const [executeRemarks, setExecuteRemarks] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = (action: any) => {
     setExecuteModal({ actionName: action.name, actionId: action.id });
  };
  
  const submitExecute = async () => {
    setIsExecuting(true);
    try {
        const stageMap: Record<string, string> = {
          [t("workflow.notification")]: "Notification",
          [t("workflow.declaration")]: "Declaration",
          [t("workflow.award")]: "Award",
          [t("workflow.compensation")]: "Compensation",
          [t("workflow.possession")]: "Possession",
          [t("workflow.rnr")]: "R&R",
        };
        const apiStage = stageMap[activeWorkflowStage.name] || activeWorkflowStage.name;
        
        const res = await apiFetch(`/api/workflow/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: selectedProject !== "All Projects" ? selectedProject : undefined,
                stage: apiStage,
                actionId: executeModal.actionId,
                remarks: executeRemarks
            })
        });
        
        if (!res.ok) {
            const data = await res.json();
            alert("Error: " + data.error);
        } else {
            // refresh
            const updated = await apiFetch(`/api/workflow?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`).then(r => r.json());
            setStages(updated.map((s: any) => ({ ...s, name: t(`workflow.${s.name}`), displayDate: s.display || s.date })));
            setActiveWorkflowStage(null);
        }
    } finally {
        setIsExecuting(false);
        setExecuteModal(null);
        setExecuteRemarks("");
    }
  };

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Workflow Tracker</h3>
          <p className="text-sm text-registry-ink/60 mt-1">{contextLabel} · Acquisition Lifecycle</p>
        </div>
        {isLapseRisk ? (
          <div className="px-3 py-1 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer hover:bg-alluvium-red/20 transition-colors" title="Section 24(2) Triggered: Award > 5 years with pending compensation/possession">
            <AlertCircle className="w-3.5 h-3.5" />
            Section 24(2) Lapse Risk
          </div>
        ) : (
          <div className="px-3 py-1 bg-tilled-earth/10 text-tilled-earth border border-tilled-earth/30 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1.5" title="Statutory Milestone Risk">
            <AlertCircle className="w-3.5 h-3.5" />
            Milestone Tracking
          </div>
        )}
      </div>
      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex gap-4 pb-6 flex-1 cursor-pointer group" onClick={() => setActiveWorkflowStage(stage)}>
            {i !== stages.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2 group-hover:bg-graticule-teal transition-colors"></div>
            )}
            
            <div className="relative z-10 bg-white">
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-cultivated-green" />
              ) : stage.status === "current" ? (
                <div className="w-6 h-6 rounded-full border-2 border-alluvium-red flex items-center justify-center bg-white shadow-[0_0_0_4px_rgba(180,57,44,0.1)]">
                  <div className="w-2 h-2 rounded-full bg-alluvium-red animate-pulse" />
                </div>
              ) : (
                <Circle className="w-6 h-6 text-graticule-teal/30" />
              )}
            </div>
            
            <div className="flex-1 -mt-1 group-hover:translate-x-1 transition-transform">
              <h4 className={`text-sm font-semibold ${stage.status === 'completed' ? 'text-registry-ink/60 line-through' : stage.status === 'current' ? 'text-registry-ink' : 'text-registry-ink/40'}`}>
                {stage.name}
              </h4>
              <div className={`text-[10px] font-medium mt-1 truncate max-w-full ${stage.status === 'OVERDUE' ? 'text-alluvium-red' : stage.status === 'DUE_SOON' ? 'text-tilled-earth' : 'text-registry-ink/60'}`}>
                {stage.displayDate}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeWorkflowStage && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-graticule-teal/30 p-6 z-50 flex flex-col transform transition-transform duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg font-bold text-registry-ink">{activeWorkflowStage.name}</h3>
            <button onClick={() => setActiveWorkflowStage(null)} className="p-2 hover:bg-survey-paper rounded-sm text-registry-ink/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div>
              <div className="text-xs uppercase tracking-wider text-registry-ink/60 font-medium">Status & Deadline</div>
              <div className={`text-sm font-medium mt-1 ${activeWorkflowStage.status === 'OVERDUE' ? 'text-alluvium-red' : activeWorkflowStage.status === 'DUE_SOON' ? 'text-tilled-earth' : 'text-registry-ink/60'}`}>{activeWorkflowStage.displayDate}</div>
            </div>
            
            <div>
              <div className="text-xs uppercase tracking-wider text-registry-ink/60 font-medium">Responsible Authority</div>
              <div className="text-sm text-registry-ink font-medium mt-1">{activeWorkflowStage.authority}</div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-registry-ink/60 font-medium mb-2">Pending Actions</div>
              {activeWorkflowStage.pendingActions?.length > 0 ? (
                <ul className="space-y-2">
                  {activeWorkflowStage.pendingActions?.map((action: any, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-alluvium-red flex-shrink-0" />
                      <span className="text-sm text-registry-ink">{typeof action === 'string' ? action : action.name}</span>
                      {(typeof action !== 'string' && action.actionType === 'modal') && (
                        <button className="ml-auto px-3 py-1 bg-graticule-teal text-white text-xs rounded hover:bg-graticule-teal/90 transition-colors cursor-pointer" onClick={() => handleExecute(action)}>
                           Execute
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-registry-ink/40 italic">No pending actions</div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-graticule-teal/20 mt-auto">
            <button onClick={handleViewDocuments} className="w-full py-3 border border-graticule-teal text-graticule-teal font-medium text-sm rounded-sm hover:bg-graticule-teal hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              View Linked Documents
            </button>
          </div>
        </div>
      )}

      {showDocsModal && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif font-bold text-registry-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-graticule-teal" />
                {activeWorkflowStage?.name} Documents
              </h3>
              <button onClick={() => { setShowDocsModal(false); setPreviewDoc(null); }} className="p-1 hover:bg-white rounded-sm text-registry-ink/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {docsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-graticule-teal border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : previewDoc ? (
                <div className="space-y-4">
                  <button onClick={() => setPreviewDoc(null)} className="text-sm text-graticule-teal hover:underline mb-2 cursor-pointer">
                    &larr; Back to list
                  </button>
                  <div className="aspect-[1/1.4] w-full max-w-md mx-auto bg-survey-paper border border-graticule-teal/20 p-8 relative flex flex-col">
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button className="p-2 bg-white shadow-sm border border-graticule-teal/20 rounded hover:bg-survey-paper text-registry-ink cursor-pointer" title="Download">
                         <Download className="w-4 h-4" />
                       </button>
                    </div>
                    <h4 className="font-serif font-bold text-center text-xl text-registry-ink mb-6 mt-4 border-b border-registry-ink/20 pb-4">{previewDoc.title}</h4>
                    <div className="space-y-4 text-sm text-registry-ink/80 flex-1">
                      <p><strong>Stage:</strong> {previewDoc.stage}</p>
                      <p><strong>Type:</strong> {previewDoc.type}</p>
                      <p><strong>Uploaded By:</strong> {previewDoc.uploadedBy}</p>
                      <p><strong>Date:</strong> {previewDoc.uploadDate}</p>
                      <p><strong>File Size:</strong> {previewDoc.size}</p>
                    </div>
                    
                    <div className="mt-6 p-4 bg-cultivated-green/5 border border-cultivated-green/20 rounded-sm">
                      <div className="text-sm text-registry-ink/80">Integrity Check</div>
                      <div className="flex items-center gap-1 text-cultivated-green mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-mono font-medium" title="Calculated from real file buffer if uploaded">
                          {previewDoc?.verificationStatus || (previewDoc?.checksum ? `Verified (SHA-256: ${previewDoc.checksum.substring(0, 16)}...)` : "Demo document — integrity verification unavailable")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal transition-colors group cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-survey-paper rounded flex items-center justify-center flex-shrink-0 group-hover:bg-graticule-teal/10 transition-colors">
                          <File className="w-5 h-5 text-graticule-teal" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-registry-ink">{doc.title} <span className="ml-2 text-xs text-registry-ink/50">(V{doc.version || "1.0"})</span></div>
                          <div className="text-xs text-registry-ink/60 mt-0.5">{doc.type} · {doc.uploadDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === "Verified" && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cultivated-green bg-cultivated-green/10 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <button className="p-2 text-registry-ink/40 hover:text-graticule-teal transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-registry-ink/60">
                  <FileText className="w-12 h-12 mx-auto text-graticule-teal/30 mb-3" />
                  <p>No documents linked to this stage yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {executeModal && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-xl flex flex-col">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif font-bold text-registry-ink flex items-center gap-2">Execute Action: {executeModal.actionName}</h3>
              <button onClick={() => setExecuteModal(null)} className="p-1 hover:bg-white rounded-sm text-registry-ink/60 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-registry-ink mb-1">Remarks / Notes</label>
                  <textarea 
                     value={executeRemarks} 
                     onChange={(e) => setExecuteRemarks(e.target.value)}
                     className="w-full h-24 p-2 border border-graticule-teal/30 rounded-sm focus:border-graticule-teal outline-none text-sm"
                     placeholder="Enter details for this execution step..."
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-registry-ink mb-1">Supporting Document</label>
                  <input type="file" className="text-sm w-full" />
               </div>
            </div>
            <div className="p-4 border-t border-graticule-teal/20 flex justify-end gap-3 bg-survey-paper mt-auto">
               <button onClick={() => setExecuteModal(null)} className="px-4 py-2 border border-graticule-teal/30 rounded-sm text-sm font-medium hover:bg-graticule-teal/5 transition-colors cursor-pointer">Cancel</button>
               <button onClick={submitExecute} disabled={isExecuting} className="px-4 py-2 bg-graticule-teal text-white rounded-sm text-sm font-medium hover:bg-graticule-teal/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                 {isExecuting ? 'Executing...' : 'Complete Action'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [selectedRiskProj, setSelectedRiskProj] = useState<any | null>(null);

  useEffect(() => {
    apiFetch(`/api/risk?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`)
      .then(res => res.json())
      .then(data => setRisks(data));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Predictive Delay-Risk</h3>
          <p className="text-sm text-registry-ink/60 mt-1">AI-Powered Risk Assessment</p>
        </div>
        <div className="px-3 py-1 bg-registry-ink/10 text-registry-ink border border-registry-ink/20 text-[10px] uppercase font-bold tracking-wider rounded-sm">
          Analytics Engine Active
        </div>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {risks.length > 0 ? risks.map((risk, i) => (
          <div key={i} className="p-4 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal transition-colors cursor-pointer group" onClick={() => setSelectedRiskProj(risk)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-registry-ink group-hover:text-graticule-teal transition-colors">{risk.projectName}</h4>
                <p className="text-xs text-registry-ink/60 mt-1">{risk.district}, {risk.state}</p>
              </div>
              <div className={`px-2 py-1 rounded-sm text-xs font-bold ${risk.level === 'High' ? 'bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30' : risk.level === 'Medium' ? 'bg-tilled-earth/10 text-tilled-earth border border-tilled-earth/30' : 'bg-cultivated-green/10 text-cultivated-green border border-cultivated-green/30'}`}>
                {risk.level} Risk
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-[10px] text-registry-ink/60 uppercase font-medium mb-1">Risk Score</div>
                <div className="text-xl font-serif font-bold text-registry-ink">{risk.score}/100</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-registry-ink/60 uppercase font-medium mb-1">Impact</div>
                <div className="text-sm font-medium text-alluvium-red">{risk.overdueDays} days delay</div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-sm text-registry-ink/60 text-center py-8">No risk data available for the current selection.</div>
        )}
      </div>

      {selectedRiskProj && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif font-bold text-registry-ink flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-alluvium-red" />
                Intervention Plan: {selectedRiskProj.projectName}
              </h3>
              <button onClick={() => setSelectedRiskProj(null)} className="p-1 hover:bg-white rounded-sm text-registry-ink/60 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
               <div className="flex gap-6">
                 <div className="flex-1 bg-alluvium-red/5 border border-alluvium-red/20 p-4 rounded-sm text-center">
                    <div className="text-4xl font-serif font-bold text-alluvium-red mb-1">{selectedRiskProj.score}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-alluvium-red">Risk Score</div>
                 </div>
                 <div className="flex-[2] bg-survey-paper border border-graticule-teal/20 p-4 rounded-sm flex flex-col justify-center">
                    <div className="text-xs uppercase text-registry-ink/60 font-medium mb-1">AI Recommendation</div>
                    <div className="font-medium text-registry-ink">{selectedRiskProj.recommendation}</div>
                 </div>
               </div>

               <div>
                 <h4 className="font-semibold text-registry-ink mb-3 uppercase text-xs tracking-wider border-b border-graticule-teal/20 pb-2">Primary Risk Factors</h4>
                 <ul className="space-y-2">
                   {selectedRiskProj.factors?.map((f: string, i: number) => (
                     <li key={i} className="flex items-start gap-2 text-sm text-registry-ink/80">
                       <span className="w-1.5 h-1.5 rounded-full bg-alluvium-red mt-1.5 flex-shrink-0" />
                       {f}
                     </li>
                   ))}
                 </ul>
               </div>

               {selectedRiskProj.lapseRisk && selectedRiskProj.lapseRisk !== 'LOW' && (
                 <div className="bg-alluvium-red/10 border border-alluvium-red/30 p-4 rounded-sm">
                   <h4 className="font-bold text-alluvium-red mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Section 24(2) Lapse Risk: {selectedRiskProj.lapseRisk}
                   </h4>
                   <p className="text-sm text-alluvium-red/90">{selectedRiskProj.lapseReason}</p>
                 </div>
               )}

               <div>
                 <h4 className="font-semibold text-registry-ink mb-3 uppercase text-xs tracking-wider border-b border-graticule-teal/20 pb-2">Proposed Interventions</h4>
                 <div className="space-y-3">
                    <button onClick={() => { alert('Intervention actioned!'); setSelectedRiskProj(null); }} className="w-full text-left p-3 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal hover:bg-graticule-teal/5 transition-colors cursor-pointer">
                      <div className="font-medium text-sm text-registry-ink">Escalate to State Nodal Officer</div>
                      <div className="text-xs text-registry-ink/60 mt-1">Generate automated briefing document and alert SNO.</div>
                    </button>
                    <button onClick={() => { alert('Intervention actioned!'); setSelectedRiskProj(null); }} className="w-full text-left p-3 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal hover:bg-graticule-teal/5 transition-colors cursor-pointer">
                      <div className="font-medium text-sm text-registry-ink">Schedule High-Power Committee Review</div>
                      <div className="text-xs text-registry-ink/60 mt-1">Add to agenda for next weekly cross-departmental review.</div>
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
