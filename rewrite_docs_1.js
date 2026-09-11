import fs from 'fs';

const code = `import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../api";
import { DocumentRecord } from "../types";
import { FolderOpen, Download, ShieldCheck, ShieldAlert, Upload, X, Search, FileText, CheckCircle2, History, Link as LinkIcon, MapPin, Map, FileCheck, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Documents({ 
  selectedState = "All States", 
  selectedDistrict = "All Districts", 
  selectedProject = "All Projects", 
  selectedStage, selectedCategory, selectedRisk,
  profile, setActiveTab, setSelectedProject, setSelectedParcelId 
}: any) {
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
    let url = \`/api/documents?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject)}\`;
    if (search) url += \`&q=\${encodeURIComponent(search)}\`;
    if (typeFilter !== "ALL") url += \`&type=\${encodeURIComponent(typeFilter)}\`;
    if (statusFilter !== "ALL") url += \`&status=\${encodeURIComponent(statusFilter)}\`;
    
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
    apiFetch(\`/api/documents/\${id}/versions\`).then(r=>r.json()).then(data => setVersions(data || []));
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
    
    const url = isUploadVersion ? \`/api/documents/\${selectedDoc!.id}/version\` : "/api/documents";
    
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
     apiFetch(\`/api/documents/\${id}/verify-integrity\`, {method: "POST"})
      .then(r=>r.json())
      .then(() => loadDocs());
  };

  const handleDownload = (id: string, version?: string) => {
     let url = \`/api/documents/\${id}/download\`;
     if (version) url += \`/\${version}\`;
     window.open(url, '_blank');
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
`;
fs.writeFileSync('rewrite_docs_1.js.txt', code); // Backup
fs.writeFileSync('src/components/Documents.tsx', code);
