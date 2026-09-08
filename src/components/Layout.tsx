import React, { useState, useRef, useEffect } from "react";
import { Map as MapIcon, FileText, ClipboardCheck, HandCoins, Home, FileBarChart, ShieldAlert, Bell, User, LayoutDashboard, Database, FolderOpen, Settings, LogOut } from "lucide-react";
import { useTranslation } from "../i18n";

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { t } = useTranslation();

  const tabs = [
    { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { id: "proposals", label: t("nav.proposals"), icon: FileText },
    { id: "map", label: t("nav.map"), icon: MapIcon },
    { id: "compensation", label: t("nav.compensation"), icon: HandCoins },
    { id: "rnr", label: t("nav.rnr"), icon: Home },
    { id: "documents", label: t("nav.documents"), icon: FolderOpen },
    { id: "awards", label: t("nav.awards"), icon: ClipboardCheck },
    { id: "reports", label: t("nav.reports"), icon: FileBarChart },
    { id: "grievance", label: t("nav.grievance"), icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-graticule-teal/30 h-[calc(100vh-64px)] overflow-y-auto bg-survey-paper flex flex-col hidden md:flex">
      <nav className="p-4 space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-none border-l-2 ${
              activeTab === tab.id
                ? "border-tilled-earth bg-graticule-teal/10 text-registry-ink font-medium"
                : "border-transparent text-registry-ink/70 hover:bg-graticule-teal/5 hover:text-registry-ink"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-tilled-earth" : "text-graticule-teal"}`} />
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-graticule-teal/30">
        <div className="text-xs text-graticule-teal mb-2 font-mono uppercase tracking-wider">{t("header.sessionInfo")}</div>
        <div className="text-sm font-medium">{t("header.role")}</div>
        <div className="text-xs text-registry-ink/70">{t("district.newDelhi")}, NCT</div>
      </div>
    </aside>
  );
}

export function TopNav({ 
  setActiveTab,
  selectedState = "All States",
  setSelectedState,
  selectedDistrict = "All Districts",
  setSelectedDistrict,
  setIsAuthenticated,
  openModal
}: { 
  setActiveTab?: (tab: string) => void,
  selectedState?: string,
  setSelectedState?: (s: string) => void,
  selectedDistrict?: string,
  setSelectedDistrict?: (d: string) => void,
  setIsAuthenticated?: (auth: boolean) => void,
  openModal?: (modal: string) => void
}) {
  const { t, language, setLanguage } = useTranslation();

  const stateDistricts: Record<string, string[]> = {
    "All States": ["All Districts"],
    "Delhi": ["All Districts", "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Haryana": ["All Districts", "Nuh", "Gurugram", "Faridabad", "Rohtak", "Hisar", "Ambala"],
    "Uttar Pradesh": ["All Districts", "Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Meerut"],
    "Maharashtra": ["All Districts", "Pune", "Mumbai", "Nashik", "Nagpur", "Thane"],
    "Tamil Nadu": ["All Districts", "Chennai", "Kanchipuram", "Coimbatore", "Madurai"]
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    if (setSelectedState) setSelectedState(newState);
    if (setSelectedDistrict) setSelectedDistrict("All Districts"); // Reset district on state change
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (setSelectedDistrict) setSelectedDistrict(e.target.value);
  };

  const currentDistricts = stateDistricts[selectedState] || ["All Districts"];

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "HI" : "EN");
  };

  const getStateI18nKey = (stateVal: string) => {
    const mapping: Record<string, string> = {
      "All States": "state.all", "Delhi": "state.delhi", "Haryana": "state.haryana",
      "Uttar Pradesh": "state.up", "Maharashtra": "state.maha", "Tamil Nadu": "state.tn"
    };
    return mapping[stateVal] || stateVal;
  };

  const getDistrictI18nKey = (districtVal: string) => {
    const mapping: Record<string, string> = {
      "All Districts": "district.all", "New Delhi": "district.newDelhi", "North Delhi": "district.northDelhi",
      "South Delhi": "district.southDelhi", "East Delhi": "district.eastDelhi", "West Delhi": "district.westDelhi"
    };
    return mapping[districtVal] || districtVal; // Default to English name if not explicitly mapped
  };

  return (
    <header className="h-16 border-b border-graticule-teal/30 bg-survey-paper flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-lg rounded-sm">
          B
        </div>
        <div>
          <h1 className="text-xl leading-tight">{t("header.title")}</h1>
          <div className="text-[10px] uppercase tracking-widest text-tilled-earth font-mono">Dept. of Land Resources</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center border border-graticule-teal/30 rounded-sm bg-white overflow-hidden text-sm">
          <select 
            value={selectedState} 
            onChange={handleStateChange}
            className="px-3 py-1.5 bg-transparent outline-none border-r border-graticule-teal/30 text-registry-ink font-medium cursor-pointer"
          >
            {Object.keys(stateDistricts).map(state => (
              <option key={state} value={state}>{t(getStateI18nKey(state), state)}</option>
            ))}
          </select>
          <select 
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="px-3 py-1.5 bg-transparent outline-none text-registry-ink cursor-pointer max-w-[150px]"
          >
            {currentDistricts.map(district => (
              <option key={district} value={district}>{t(getDistrictI18nKey(district), district)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 border-l border-graticule-teal/30 pl-6">
          <button onClick={toggleLanguage} className="text-registry-ink hover:text-graticule-teal text-sm font-medium transition-colors cursor-pointer outline-none">
            {language === "EN" ? (
              <span><strong>EN</strong> <span className="text-graticule-teal/50 font-normal">/ HI</span></span>
            ) : (
              <span><span className="text-graticule-teal/50 font-normal">EN / </span><strong>HI</strong></span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('alerts')}
            className="relative text-graticule-teal hover:text-registry-ink transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-alluvium-red rounded-full border-2 border-survey-paper"></span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-graticule-teal/10 flex items-center justify-center text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/20 transition-colors focus:outline-none"
            >
              <User className="h-4 w-4" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-graticule-teal/30 rounded-sm shadow-sm z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-graticule-teal/10 bg-survey-paper/50">
                  <p className="text-sm font-semibold text-registry-ink">Ramesh Kumar</p>
                  <p className="text-xs text-registry-ink/60">{t("header.role")} • {t("district.newDelhi")}</p>
                  <p className="text-xs text-graticule-teal mt-0.5">ramesh.k@bhoomisetu.gov.in</p>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => { setIsProfileOpen(false); if (openModal) openModal("profile"); }}
                    className="w-full text-left px-4 py-2 text-sm text-registry-ink hover:bg-graticule-teal/5 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-graticule-teal" />
                    {t("profile.myProfile", "My Profile")}
                  </button>
                  <button 
                    onClick={() => { setIsProfileOpen(false); if (openModal) openModal("settings"); }}
                    className="w-full text-left px-4 py-2 text-sm text-registry-ink hover:bg-graticule-teal/5 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-graticule-teal" />
                    {t("profile.settings", "Account Settings")}
                  </button>
                </div>
                <div className="py-1 border-t border-graticule-teal/10">
                  <button 
                    onClick={() => { setIsProfileOpen(false); if (setIsAuthenticated) setIsAuthenticated(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-alluvium-red hover:bg-alluvium-red/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("profile.signOut", "Sign Out")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
