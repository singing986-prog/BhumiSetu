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

export function KPILedger({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`)
      .then((res) => res.json())
      .then((data) => setKpis(data));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  if (!kpis) return <div className="h-24 animate-pulse bg-graticule-teal/10" />;

  const metrics = [
    { label: t("dashboard.kpi.areaNotified"), value: kpis.areaNotified },
    { label: t("dashboard.kpi.areaAcquired"), value: kpis.areaAcquired },
    { label: t("dashboard.kpi.compAssessed"), value: kpis.compensationAssessed },
    { label: t("dashboard.kpi.compPaid"), value: kpis.compensationDisbursed },
    { label: t("dashboard.kpi.familiesAffected"), value: kpis.familiesAffected },
    { label: t("dashboard.kpi.rnrSettled"), value: kpis.familiesRnR },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-y border-graticule-teal/30 bg-survey-paper">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          key={metric.label}
          className={`flex-1 min-w-[160px] p-3 py-4 ${i !== metrics.length - 1 ? "border-r border-graticule-teal" : ""}`}
        >
          <div className="text-xs text-registry-ink/60 font-medium uppercase tracking-wider mb-1">
            {metric.label}
          </div>
          <div className="text-2xl font-serif font-semibold text-registry-ink flex items-end justify-between">
            <AnimatedCounter value={metric.value} />
            <span className="text-[10px] font-sans font-normal text-cultivated-green pb-1 hidden lg:block">+{(Math.random() * 5 + 1).toFixed(1)}%</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function FilterBar({ 
  selectedState, setSelectedState, 
  selectedDistrict, setSelectedDistrict, 
  selectedProject, setSelectedProject,
  searchQuery, setSearchQuery,
  selectedStage, setSelectedStage,
  selectedCategory, setSelectedCategory,
  selectedRisk, setSelectedRisk
}: { 
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
    fetch(`/api/projects?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&stage=${encodeURIComponent(selectedStage || "All Stages")}&category=${encodeURIComponent(selectedCategory || "All Categories")}&risk=${encodeURIComponent(selectedRisk || "All Risks")}`)
      .then(r => r.json()).then(data => setProjects(data));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);


  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(data => setLocations(data));
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
      fetch(`/api/search?q=${encodeURIComponent(val)}`).then(r => r.json()).then(data => setSearchResults(data));
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
          <span className="font-medium text-registry-ink/60 uppercase tracking-wider text-[10px] w-12">Scope</span>
          <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict("All Districts"); setSelectedProject("All Projects"); }} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer">
            {Object.keys(locations).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-graticule-teal/30">/</span>
          <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedProject("All Projects"); }} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer max-w-[150px]">
            {currentDistricts.map(d => <option key={d} value={d}>{d}</option>)}
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
          <span className="font-medium text-registry-ink/60 uppercase tracking-wider text-[10px] w-12">Filter</span>
          <div className="relative">
            <input type="text" value={searchQuery || ""} onChange={handleSearch} placeholder="Search ULPIN, Village, or Project..." className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none focus:border-graticule-teal w-64" />
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

export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const { t } = useTranslation();
  useEffect(() => {
    fetch(`/api/risk?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`).then(r => r.json()).then(data => setRisks(data));
  }, [selectedState, selectedDistrict]);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-graticule-teal/10">
        <div>
          <h3 className="font-serif text-lg font-semibold text-alluvium-red flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> 
            Acquisition Risk Watch
          </h3>
          <p className="text-sm text-registry-ink/60 mt-1">3 projects require immediate attention</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {/* High Risk Item */}
        <div className="p-4 bg-alluvium-red/5 border border-alluvium-red/20 rounded-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="px-2 py-0.5 bg-alluvium-red text-white text-[10px] font-bold tracking-wider rounded-sm uppercase">High Risk</div>
            <span className="text-xs text-registry-ink/50">28 days overdue</span>
          </div>
          <h4 className="font-medium text-registry-ink text-sm">{risks[0]?.name || t("risk.project1", "Western Dedicated Freight Corridor Phase 3")}</h4>
          <p className="text-xs text-registry-ink/70 mt-2 flex items-center gap-2"><Circle className="w-1.5 h-1.5 fill-alluvium-red text-alluvium-red"/> 3 contributing risk factors</p>
          <button onClick={() => setActivePlan(risks[0])} className="text-xs font-medium text-alluvium-red hover:underline mt-3">{t("risk.viewInterventionPlan")} &rarr;</button>
        </div>

        {/* Medium Risk Items */}
        <div className="flex flex-col gap-3">
           <div className="p-3 border border-tilled-earth/20 bg-tilled-earth/5 rounded-sm flex justify-between items-center group cursor-pointer hover:bg-tilled-earth/10 transition-colors">
              <div>
                <h4 className="font-medium text-registry-ink text-sm">{risks[1]?.name || t("risk.project2", "Godavari Irrigation Canal Ext.")}</h4>
                <p className="text-[10px] text-registry-ink/60 mt-0.5">Approaching Sec 19 deadline</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-tilled-earth"></div>
           </div>
           
           <div className="p-3 border border-tilled-earth/20 bg-tilled-earth/5 rounded-sm flex justify-between items-center group cursor-pointer hover:bg-tilled-earth/10 transition-colors">
              <div>
                <h4 className="font-medium text-registry-ink text-sm">{risks[2]?.name || t("risk.project3", "Delhi-Dehradun Expressway")}</h4>
                <p className="text-[10px] text-registry-ink/60 mt-0.5">High objection volume detected</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-tilled-earth"></div>
           </div>
        </div>
      </div>

      {activePlan && (
        <div className="fixed inset-0 bg-registry-ink/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif text-lg font-semibold text-registry-ink">Intervention Plan</h3>
              <button onClick={() => setActivePlan(null)} className="text-registry-ink/60 hover:text-registry-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="font-medium text-registry-ink mb-4">{activePlan.projectName || activePlan.name || "Western Dedicated Freight Corridor Phase 3"}</h4>
              <p className="text-sm text-registry-ink/80 mb-4">Risk Level: <strong>{activePlan.level || "High"}</strong> (Score: {activePlan.score || 85})</p>
              <div className="space-y-4">
                <div className="bg-alluvium-red/5 border border-alluvium-red/20 p-4 rounded-sm">
                  <h5 className="text-sm font-semibold text-alluvium-red mb-2">Recommended Actions:</h5>
                  <ul className="list-disc list-inside text-sm text-registry-ink/80 space-y-1">
                    <li>Schedule joint inspection with Revenue Dept.</li>
                    <li>Fast-track dispute resolution via Lok Adalat.</li>
                    <li>Escalate to District Collector for immediate review.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const { t } = useTranslation();
  const [stages, setStages] = useState<any[]>([
    { id: 1, name: t("workflow.notification"), status: "pending", date: "-" },
    { id: 2, name: t("workflow.declaration"), status: "pending", date: "-" },
    { id: 3, name: t("workflow.award"), status: "pending", date: "-" },
    { id: 4, name: t("workflow.compensation"), status: "pending", date: "-" },
    { id: 5, name: t("workflow.possession"), status: "pending", date: "-" },
    { id: 6, name: t("workflow.rnr"), status: "pending", date: "-" },
  ]);
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
    
    fetch(`/api/documents?state=${encodeURIComponent(selectedState || '')}&project=${encodeURIComponent(selectedProject || '')}&stage=${encodeURIComponent(apiStage)}`)
      .then(r => r.json())
      .then(data => {
        setDocuments(data);
        setDocsLoading(false);
      });
  };


  useEffect(() => {
    fetch(`/api/workflow?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject)}&stage=${encodeURIComponent(selectedStage)}&category=${encodeURIComponent(selectedCategory)}&risk=${encodeURIComponent(selectedRisk)}`).then(r => r.json()).then(data => {
      setStages(data.map((s: any) => {
        // Fix dates to include year if missing
        let displayDate = s.date;
        if (displayDate.includes("Pending (Due:")) {
          displayDate = displayDate.replace("Pending (Due: ", "Pending · Due ").replace(")", " 2026");
        } else if (displayDate !== "-" && !displayDate.includes("2025") && !displayDate.includes("2026")) {
           displayDate = displayDate + " 2025";
        }
        return { ...s, name: t(`workflow.${s.name}`), date: displayDate };
      }));
    });
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk, t]);

  const contextLabel = selectedProject !== "All Projects" ? `Project ${selectedProject.split('-').pop()}` : (selectedDistrict !== "All Districts" ? `${selectedDistrict} Aggregate` : `${selectedState} Aggregate`);

  // Mock Sec 24(2) check: If stage 3 (Award) is > 5 years old and Stage 4/5 are pending
  const checkLapse = () => {
    const award = stages.find(s => s.id === 3);
    const comp = stages.find(s => s.id === 4);
    const poss = stages.find(s => s.id === 5);
    
    // Check if we are simulating the lapse risk project
    if (selectedProject === "PRJ-2026-003" || (award?.date && award.date.includes("2019") && comp?.status === "pending")) {
      return true;
    }
    return false;
  };
  const isLapseRisk = checkLapse();

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
            Award Deadline Risk
          </div>
        )}
      </div>
      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex gap-4 pb-6 flex-1 cursor-pointer group" onClick={() => setActiveWorkflowStage(stage)}>
            {/* Connecting line */}
            {i !== stages.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2 group-hover:bg-graticule-teal transition-colors"></div>
            )}
            
            <div className="relative z-10 bg-white">
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-cultivated-green" />
              ) : stage.status === "current" ? (
                <div className="w-6 h-6 rounded-full border-2 border-tilled-earth flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-tilled-earth"></div>
                </div>
              ) : (
                <Circle className="w-6 h-6 text-graticule-teal/40 group-hover:text-graticule-teal transition-colors" />
              )}
            </div>
            
            <div className="-mt-1 group-hover:bg-graticule-teal/5 p-1 -ml-1 rounded-sm w-full transition-colors">
              <div className={`font-medium ${stage.status === "pending" ? "text-registry-ink/50" : "text-registry-ink"}`}>
                <span className="font-mono text-xs text-graticule-teal mr-2">{stage.id.toString().padStart(2, '0')}</span>
                {stage.name}
              </div>
              <div className={`text-xs mt-0.5 ${stage.status === "current" ? "text-alluvium-red font-medium" : "text-registry-ink/60"}`}>
                {stage.date}
              </div>
            </div>
          </div>
        ))}
      </div>
      {activeWorkflowStage && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[100] p-4" onClick={() => setActiveWorkflowStage(null)}>
          <div className="bg-white rounded-sm shadow-lg w-full max-w-md flex flex-col border border-graticule-teal/30 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-graticule-teal/10 flex justify-between items-center bg-survey-paper/50">
              <h2 className="font-serif text-lg font-semibold text-registry-ink flex items-center gap-2">
                {activeWorkflowStage.name} Details
              </h2>
              <button onClick={() => setActiveWorkflowStage(null)} className="text-registry-ink/40 hover:text-alluvium-red transition-colors outline-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">{t("stage.status")}</span>
                  <span className="font-medium capitalize">{activeWorkflowStage.status}</span>
                </div>
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">{activeWorkflowStage.status === "completed" ? "Completed On" : "Deadline"}</span>
                  <span className="font-medium">{activeWorkflowStage.date.replace("Pending · Due ", "")}</span>
                </div>
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">{t("stage.responsibleAuthority")}</span>
                  <span className="font-medium">District LAO</span>
                </div>
                <div className="flex justify-between border-b border-graticule-teal/10 pb-2">
                  <span className="text-registry-ink/60">{t("stage.linkedDocuments")}</span>
                  <button onClick={handleViewDocuments} className="font-medium text-tilled-earth cursor-pointer hover:underline outline-none text-left">{t("stage.view")} &rarr;</button>
                </div>
                <div className="pt-2">
                  <span className="text-registry-ink/60 block mb-2">{t("stage.pendingActions")}</span>
                  <ul className="list-disc pl-5 text-registry-ink/80 space-y-1">
                    <li>Submit statutory review report</li>
                    <li>Verify remaining objections</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showDocsModal && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[110] p-4" onClick={() => setShowDocsModal(false)}>
          <div className="bg-white rounded-sm shadow-xl w-full max-w-4xl flex flex-col border border-graticule-teal/30 overflow-hidden h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-graticule-teal/10 flex justify-between items-center bg-survey-paper/50">
              <h2 className="font-serif text-lg font-semibold text-registry-ink flex items-center gap-2">
                {activeWorkflowStage?.name} - {t("doc.drawerTitle", "Linked Documents")}
              </h2>
              <button onClick={() => setShowDocsModal(false)} className="text-registry-ink/40 hover:text-alluvium-red transition-colors outline-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-white p-6">
              {docsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tilled-earth"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-registry-ink/50 space-y-3">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p>{t("doc.noDocs", "No documents found")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="border border-graticule-teal/20 rounded-sm p-4 hover:border-graticule-teal/50 transition-colors flex flex-col h-full bg-survey-paper/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="p-2 bg-survey-paper rounded-sm shrink-0 border border-graticule-teal/10">
                            {doc.type === "Report" || doc.type === "Gazette" ? <FileText className="w-5 h-5 text-tilled-earth" /> : <File className="w-5 h-5 text-registry-ink/60" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-registry-ink truncate text-sm" title={doc.title}>{doc.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-registry-ink/60 mt-1 uppercase tracking-wider">
                              <span className="bg-graticule-teal/10 px-1.5 py-0.5 rounded-sm">{doc.type}</span>
                              <span>{doc.version}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 bg-cultivated-green/10 text-cultivated-green rounded-full shrink-0">
                          {doc.status}
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-graticule-teal/10 text-xs text-registry-ink/70 flex justify-between items-center">
                        <div>
                          <p>{t("doc.uploadedBy", "Uploaded By")}: <span className="font-medium text-registry-ink/90">{doc.uploadedBy}</span></p>
                          <p>{doc.uploadDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPreviewDoc(doc)} className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/20 rounded-sm hover:bg-graticule-teal/5 text-registry-ink transition-colors flex items-center gap-1.5 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                            {t("doc.preview", "Preview")}
                          </button>
                          <a href={doc.url} download className="px-3 py-1.5 bg-tilled-earth text-white rounded-sm hover:bg-tilled-earth/90 transition-colors flex items-center gap-1.5 cursor-pointer">
                            <Download className="w-3.5 h-3.5" />
                            {t("doc.download", "Download")}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {previewDoc && (
        <div className="fixed inset-0 bg-registry-ink/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4 md:p-8" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-sm shadow-2xl w-full h-full max-w-6xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-graticule-teal/20 flex justify-between items-center bg-registry-ink text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-graticule-teal" />
                <h3 className="font-serif text-lg">{previewDoc.title}</h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{previewDoc.version}</span>
              </div>
              <div className="flex items-center gap-4">
                <a href={previewDoc.url} download className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-sm">
                  <Download className="w-4 h-4" />
                  {t("doc.download", "Download")}
                </a>
                <button onClick={() => setPreviewDoc(null)} className="text-white/60 hover:text-white transition-colors outline-none cursor-pointer p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-survey-paper overflow-auto flex items-center justify-center p-8">
              {/* Document Preview Placeholder */}
              <div className="bg-white shadow-md border border-graticule-teal/10 w-full max-w-3xl aspect-[1/1.4] p-12 flex flex-col relative">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                   <div className="transform -rotate-45 text-6xl font-serif text-registry-ink font-bold whitespace-nowrap">BHOOMI-SETU PREVIEW</div>
                </div>
                
                {/* Header */}
                <div className="border-b-2 border-registry-ink/80 pb-6 mb-8 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-registry-ink mb-1">{previewDoc.type.toUpperCase()} DOCUMENT</h1>
                    <p className="text-sm text-registry-ink/60 font-mono">Ref: {previewDoc.checksum.substring(0,8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-registry-ink">{previewDoc.uploadedBy}</p>
                    <p className="text-sm text-registry-ink/70">{previewDoc.uploadDate}</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-6">{previewDoc.title.replace('.pdf', '').replace(/_/g, ' ')}</h2>
                  <div className="space-y-4 text-registry-ink/80 text-justify leading-relaxed">
                    <p>This document pertains to the land acquisition process under the RFCTLARR Act, 2013 for the designated project scope. The attached schedule specifies the exact parcels, survey numbers, and extents required for public purpose.</p>
                    
                    <p>In exercise of the powers conferred by the relevant sections of the Act, this notification/declaration/award serves as the official record of proceedings conducted on {previewDoc.uploadDate}.</p>
                    
                    <div className="my-8 p-4 bg-survey-paper/50 border border-graticule-teal/20 rounded-sm">
                       <h4 className="font-semibold mb-2">Summary of Records</h4>
                       <ul className="list-disc list-inside space-y-1 text-sm">
                         <li>Document Type: {previewDoc.type}</li>
                         <li>Status: {previewDoc.status}</li>
                         <li>Integrity Hash: <span className="font-mono">{previewDoc.checksum}</span></li>
                       </ul>
                    </div>
                    
                    <p>Verified and digitally signed by the competent authority. This is a system-generated preview and serves as a true copy of the original record available in the central repository.</p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-registry-ink/20 flex justify-between items-center text-sm text-registry-ink/60">
                   <p>Page 1 of 1</p>
                   <p>Generated by BhoomiSetu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure X import is added if not present