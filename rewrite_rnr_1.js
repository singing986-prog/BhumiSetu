import fs from 'fs';

const code = `import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { RnRRecord, AuditEvent, DocumentRecord } from "../types";
import { Home, CheckCircle2, Clock, AlertCircle, Search, Filter, X, ChevronRight, Download, FileText, Check, FileCheck, MapPin, Building, Briefcase, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

export function RnR({ 
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
  setActiveTab?: (tab: string) => void,
  setSelectedProject?: (id: string) => void,
  setSelectedParcelId?: (id: string | null) => void
}) {
  const { t } = useTranslation();
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
    let url = \`/api/rnr?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject)}\`;
    if (search) url += \`&q=\${encodeURIComponent(search)}\`;
    if (categoryFilter !== "All Categories") url += \`&category=\${encodeURIComponent(categoryFilter)}\`;
    if (statusFilter !== "All Statuses") url += \`&approvalStatus=\${encodeURIComponent(statusFilter)}\`;
    
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
    apiFetch(\`/api/audit?rnrId=\${id}\`).then(r => r.json()).then(data => setAuditEvents(data || []));
    apiFetch(\`/api/documents\`).then(r => r.json()).then(data => setDocuments((data || []).filter((d: any) => d.parcelId === records.find(rec=>rec.id === id)?.parcelId)));
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
     return <span className={\`px-2 py-1 text-[10px] font-bold tracking-wider uppercase rounded-sm border \${bg}\`}>{status.replace(/_/g, ' ')}</span>;
  };

  const handleDeepLink = (tab: string, rec: RnRRecord) => {
    if (setSelectedProject) setSelectedProject(rec.projectId);
    if (tab === "map" && setSelectedParcelId) setSelectedParcelId(rec.parcelId);
    if (setActiveTab) setActiveTab(tab);
    setSelectedRecord(null);
  };

  // ... (Component structure continued in part 2)
`;

fs.writeFileSync('src/components/RnR.tsx', code);
