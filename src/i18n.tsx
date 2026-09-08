import React, { createContext, useState, useContext, ReactNode } from "react";

type Language = "EN" | "HI";

type Translations = Record<string, string>;

const enTranslations: Translations = {

  "filter.allStates": "All States",
  "filter.allDistricts": "All Districts",
  "filter.allProjects": "All Projects",
  "filter.allStages": "All Stages",
  "filter.allCategories": "All Categories",
  "filter.allRisks": "All Risks",
  "filter.resetFilters": "Reset Filters",
  "filter.searchPlaceholder": "Search projects, ULPIN...",
  "map.drawMode": "Drawing Mode Active",
  "map.draw": "Draw",
  "map.measure": "Measure",
  "map.fullscreen": "Fullscreen",
  "map.clear": "Clear",
  "map.cancel": "Cancel",
  "map.layers": "Layers",
  "map.search": "Search",
  "workflow.acquisitionLifecycle": "Acquisition Lifecycle",
  "workflow.awardDeadlineRisk": "Award Deadline Risk",
  "workflow.due": "Due",
  "workflow.blocked": "Blocked",
  "risk.acquisitionRiskWatch": "Acquisition Risk Watch",
  "risk.projectsRequireAttention": "projects require immediate attention",
  "risk.daysOverdue": "days overdue",
  "risk.contributingRiskFactors": "contributing risk factors",
  "risk.viewInterventionPlan": "View intervention plan",
  "stage.details": "Stage Details",
  "stage.status": "Status",
  "stage.deadline": "Deadline",
  "stage.responsibleAuthority": "Responsible Authority",
  "stage.linkedDocuments": "Linked Documents",
  "stage.view": "View",
  "stage.pendingActions": "Pending Actions",
  "doc.drawerTitle": "Linked Documents",
  "doc.name": "Document Name",
  "doc.type": "Type",
  "doc.version": "Version",
  "doc.uploadedBy": "Uploaded By",
  "doc.uploadDate": "Date",
  "doc.status": "Status",
  "doc.preview": "Preview",
  "doc.download": "Download",
  "doc.history": "History",
  "doc.previewUnavailable": "Preview unavailable",
  "doc.currentVersion": "Current Version",
  "doc.noDocs": "No documents found",

  // Navigation
  "nav.dashboard": "National Dashboard",
  "nav.proposals": "Proposals",
  "nav.map": "GIS Map",
  "nav.compensation": "Compensation",
  "nav.rnr": "R&R",
  "nav.documents": "Documents",
  "nav.awards": "Awards",
  "nav.reports": "Reports",
  "nav.grievance": "Grievance",
  
  // Header / Session
  "header.title": "BhoomiSetu",
  "header.sessionInfo": "SESSION INFO",
  "header.role": "District LAO",
  "header.state": "All States",
  "header.district": "All Districts",

  // TopNav States
  "state.all": "All States",
  "state.delhi": "Delhi",
  "state.haryana": "Haryana",
  "state.up": "Uttar Pradesh",
  "state.maha": "Maharashtra",
  "state.tn": "Tamil Nadu",

  // TopNav Districts
  "district.all": "All Districts",
  "district.newDelhi": "New Delhi",
  "district.northDelhi": "North Delhi",
  "district.southDelhi": "South Delhi",
  "district.eastDelhi": "East Delhi",
  "district.westDelhi": "West Delhi",

  // Dashboard specifics
  "dashboard.kpi.areaNotified": "Area Notified",
  "dashboard.kpi.areaAcquired": "Area Acquired",
  "dashboard.kpi.compAssessed": "Comp. Assessed",
  "dashboard.kpi.compPaid": "Comp. Paid",
  "dashboard.kpi.familiesAffected": "Families Affected",
  "dashboard.kpi.rnrSettled": "R&R Settled",
  "dashboard.mapTitle": "Live Parcel Map",
  "dashboard.autoSyncActive": "Auto-sync active",
  "dashboard.autoSyncPaused": "Auto-sync paused",
  "dashboard.trackerTitle": "Workflow Tracker",
  "dashboard.riskTitle": "Predictive Risk Model",

  // Workflow Stages
  "workflow.notification": "Notification",
  "workflow.declaration": "Declaration",
  "workflow.award": "Award",
  "workflow.compensation": "Compensation",
  "workflow.possession": "Possession",
  "workflow.rnr": "R&R",
  "workflow.status.completed": "completed",
  "workflow.status.current": "current",
  "workflow.status.pending": "pending",
  "workflow.actLabel": "RFCTLARR Act, 2013 Track",
  "workflow.lapseRisk": "Sec 24(2) Lapse Risk",

  // Risk Model
  "risk.desc": "AI model forecast based on district history & objection volume",
  "risk.high": "High Risk Project",
  "risk.medium": "Medium Risk Project",
  "risk.low": "Low Risk Project",

  // Map Legend
  "map.legend.title": "Map Legend",
  "map.legend.sec11": "Section 11 Notification",
  "map.legend.award": "Award / Possession",
  "map.legend.alignment": "Proposed Alignment",
  // Proposals
  "proposals.title": "Project Proposals",
  "proposals.desc": "Track and manage land acquisition proposals across all ministries.",
  "proposals.new": "New Proposal",
  "proposals.table.id": "Reference ID",
  "proposals.table.name": "Project Name",
  "proposals.table.ministry": "Ministry",
  "proposals.table.location": "Location",
  "proposals.table.area": "Area (Ha)",
  "proposals.table.risk": "Delay Risk",
  "proposals.table.status": "Status",
  "proposals.status.approved": "Approved",
  "proposals.status.underScrutiny": "Under Scrutiny",
  "proposals.status.rejected": "Rejected",
};

const hiTranslations: Translations = {

  "filter.allStates": "सभी राज्य",
  "filter.allDistricts": "सभी जिले",
  "filter.allProjects": "सभी परियोजनाएं",
  "filter.allStages": "सभी चरण",
  "filter.allCategories": "सभी श्रेणियां",
  "filter.allRisks": "सभी जोखिम",
  "filter.resetFilters": "फ़िल्टर रीसेट करें",
  "filter.searchPlaceholder": "परियोजनाएं, ULPIN खोजें...",
  "map.drawMode": "ड्राइंग मोड सक्रिय",
  "map.draw": "आकर्षित",
  "map.measure": "मापना",
  "map.fullscreen": "पूर्ण स्क्रीन",
  "map.clear": "साफ़ करें",
  "map.cancel": "रद्द करें",
  "map.layers": "परतें",
  "map.search": "खोजें",
  "workflow.acquisitionLifecycle": "अधिग्रहण जीवनचक्र",
  "workflow.awardDeadlineRisk": "पुरस्कार की समय सीमा का जोखिम",
  "workflow.due": "देय",
  "workflow.blocked": "अवरुद्ध",
  "risk.acquisitionRiskWatch": "अधिग्रहण जोखिम निगरानी",
  "risk.projectsRequireAttention": "परियोजनाओं पर तत्काल ध्यान देने की आवश्यकता है",
  "risk.daysOverdue": "दिन अतिदेय",
  "risk.contributingRiskFactors": "योगदान देने वाले जोखिम कारक",
  "risk.viewInterventionPlan": "हस्तक्षेप योजना देखें",
  "stage.details": "चरण विवरण",
  "stage.status": "स्थिति",
  "stage.deadline": "समय सीमा",
  "stage.responsibleAuthority": "जिम्मेदार प्राधिकारी",
  "stage.linkedDocuments": "लिंक किए गए दस्तावेज़",
  "stage.view": "देखें",
  "stage.pendingActions": "लंबित कार्य",
  "doc.drawerTitle": "लिंक किए गए दस्तावेज़",
  "doc.name": "दस्तावेज़ का नाम",
  "doc.type": "प्रकार",
  "doc.version": "संस्करण",
  "doc.uploadedBy": "द्वारा अपलोड किया गया",
  "doc.uploadDate": "तारीख",
  "doc.status": "स्थिति",
  "doc.preview": "पूर्वावलोकन",
  "doc.download": "डाउनलोड",
  "doc.history": "इतिहास",
  "doc.previewUnavailable": "पूर्वावलोकन उपलब्ध नहीं है",
  "doc.currentVersion": "वर्तमान संस्करण",
  "doc.noDocs": "कोई दस्तावेज़ नहीं मिला",

  // Navigation
  "nav.dashboard": "राष्ट्रीय डैशबोर्ड",
  "nav.proposals": "प्रस्ताव",
  "nav.map": "जीआईएस मानचित्र",
  "nav.compensation": "मुआवजा",
  "nav.rnr": "पुनर्वास (R&R)",
  "nav.documents": "दस्तावेज़",
  "nav.awards": "पुरस्कार",
  "nav.reports": "रिपोर्ट",
  "nav.grievance": "शिकायत",

  // Header / Session
  "header.title": "भूमि-सेतु",
  "header.sessionInfo": "सत्र जानकारी",
  "header.role": "जिला एलएओ",
  "header.state": "सभी राज्य",
  "header.district": "सभी जिले",

  // TopNav States
  "state.all": "सभी राज्य",
  "state.delhi": "दिल्ली",
  "state.haryana": "हरियाणा",
  "state.up": "उत्तर प्रदेश",
  "state.maha": "महाराष्ट्र",
  "state.tn": "तमिलनाडु",

  // TopNav Districts
  "district.all": "सभी जिले",
  "district.newDelhi": "नई दिल्ली",
  "district.northDelhi": "उत्तरी दिल्ली",
  "district.southDelhi": "दक्षिणी दिल्ली",
  "district.eastDelhi": "पूर्वी दिल्ली",
  "district.westDelhi": "पश्चिमी दिल्ली",

  // Dashboard specifics
  "dashboard.kpi.areaNotified": "अधिसूचित क्षेत्र",
  "dashboard.kpi.areaAcquired": "अधिग्रहित क्षेत्र",
  "dashboard.kpi.compAssessed": "मुआवजा निर्धारित",
  "dashboard.kpi.compPaid": "मुआवजा वितरित",
  "dashboard.kpi.familiesAffected": "प्रभावित परिवार",
  "dashboard.kpi.rnrSettled": "पुनर्वास पूर्ण",
  "dashboard.mapTitle": "लाइव पार्सल मानचित्र",
  "dashboard.autoSyncActive": "स्वतः-सिंक सक्रिय",
  "dashboard.autoSyncPaused": "स्वतः-सिंक रुका हुआ",
  "dashboard.trackerTitle": "कार्यप्रवाह ट्रैकर",
  "dashboard.riskTitle": "अनुमानित जोखिम मॉडल",

  // Workflow Stages
  "workflow.notification": "अधिसूचना",
  "workflow.declaration": "घोषणा",
  "workflow.award": "पुरस्कार",
  "workflow.compensation": "मुआवजा",
  "workflow.possession": "कब्ज़ा",
  "workflow.rnr": "पुनर्वास",
  "workflow.status.completed": "पूर्ण",
  "workflow.status.current": "वर्तमान",
  "workflow.status.pending": "लंबित",
  "workflow.actLabel": "RFCTLARR अधिनियम, 2013 ट्रैक",
  "workflow.lapseRisk": "धारा 24(2) समाप्ति जोखिम",

  // Risk Model
  "risk.desc": "जिले के इतिहास और आपत्ति की मात्रा के आधार पर एआई मॉडल पूर्वानुमान",
  "risk.high": "उच्च जोखिम परियोजना",
  "risk.medium": "मध्यम जोखिम परियोजना",
  "risk.low": "कम जोखिम परियोजना",
  "risk.project1": "पश्चिमी समर्पित माल ढुलाई गलियारा चरण 3",
  "risk.project2": "गोदावरी सिंचाई नहर विस्तार",
  "risk.project3": "दिल्ली-देहरादून एक्सप्रेसवे",

  // Map Legend
  "map.legend.title": "मानचित्र लेजेंड",
  "map.legend.sec11": "धारा 11 अधिसूचना",
  "map.legend.award": "पुरस्कार / कब्ज़ा",
  "map.legend.alignment": "प्रस्तावित संरेखण",

  // Proposals
  "proposals.title": "परियोजना प्रस्ताव",
  "proposals.desc": "सभी मंत्रालयों के भूमि अधिग्रहण प्रस्तावों को ट्रैक और प्रबंधित करें।",
  "proposals.new": "नया प्रस्ताव",
  "proposals.table.id": "संदर्भ आईडी",
  "proposals.table.name": "परियोजना का नाम",
  "proposals.table.ministry": "मंत्रालय",
  "proposals.table.location": "स्थान",
  "proposals.table.area": "क्षेत्र (हेक्टेयर)",
  "proposals.table.risk": "विलंब जोखिम",
  "proposals.table.status": "स्थिति",
  "proposals.status.approved": "स्वीकृत",
  "proposals.status.underScrutiny": "जांच के अधीन",
  "proposals.status.rejected": "अस्वीकृत",

  // Profile
  "profile.myProfile": "मेरी प्रोफ़ाइल",
  "profile.settings": "खाता सेटिंग्स",
  "profile.signOut": "साइन आउट",
  "module.title": "मॉड्यूल",
  "module.comingSoon": "यह मॉड्यूल आगामी निर्माण चरणों में उपलब्ध होगा।",
};

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("bhoomisetu_lang") as Language) || "EN";
  });
  
  const setLanguage = (lang: Language) => {
    localStorage.setItem("bhoomisetu_lang", lang);
    setLanguageState(lang);
  };

  const t = (key: string, fallback?: string) => {
    const translations = language === "HI" ? hiTranslations : enTranslations;
    return translations[key] || fallback || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
