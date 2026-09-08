import React, { useState, useRef, useEffect } from "react";
import { Map as MapIcon, FileText, ClipboardCheck, HandCoins, Home, FileBarChart, ShieldAlert, Bell, User, LayoutDashboard, Database, FolderOpen, Settings, LogOut } from "lucide-react";
import { useTranslation } from "../i18n";

export function Sidebar({ activeTab, setActiveTab, profile = { name: "Ramesh Kumar", district: "New Delhi", role: "District LAO" } }: { activeTab: string, setActiveTab: (tab: string) => void, profile?: any }) {
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
        <div className="text-xs text-survey-paper/70">{profile.district}, NCT</div>
      </div>
    </aside>
  );
}

export function TopNav({ 
  setActiveTab,
  setIsAuthenticated,
  openModal,
  profile = { name: "Ramesh Kumar", role: "District LAO", email: "ramesh.k@bhoomisetu.gov.in", district: "New Delhi" }
}: { 
  setActiveTab?: (tab: string) => void,
  setIsAuthenticated?: (auth: boolean) => void,
  openModal?: (modal: string) => void,
  profile?: any
}) {
  const { t, language, setLanguage } = useTranslation();

  

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(data => setNotifications(data));
  }, []);
  /*
    { id: 1, title: "Section 24(2) Lapse Risk", msg: "Award is 4.8 years old with pending possession for CBIC Node 2.", time: "2 mins ago", loc: "Kanchipuram", read: false, severity: "high" },
    { id: 2, title: "Declaration Deadline", msg: "Section 19 Declaration pending for 14 parcels.", time: "1 hour ago", loc: "Rohtak", read: false, severity: "medium" },
    { id: 3, title: "Fund Disbursement", msg: "₹14.2 Cr disbursed to 45 beneficiaries.", time: "3 hours ago", loc: "Pune", read: true, severity: "low" }
  */
  const unreadCount = notifications.filter(n => !n.read).length;
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
        <div className="h-8 w-8 bg-survey-paper text-registry-ink flex items-center justify-center font-serif font-bold text-lg rounded-sm">
          B
        </div>
        <div>
          <h1 className="text-xl leading-tight">{t("header.title")}</h1>
          <div className="text-[10px] uppercase tracking-widest text-tilled-earth font-mono">Dept. of Land Resources</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 pl-6">
          <button onClick={toggleLanguage} className="text-registry-ink hover:text-graticule-teal text-sm font-medium transition-colors cursor-pointer outline-none">
            {language === "EN" ? (
              <span><strong>EN</strong> <span className="text-graticule-teal/50 font-normal">/ HI</span></span>
            ) : (
              <span><span className="text-graticule-teal/50 font-normal">EN / </span><strong>HI</strong></span>
            )}
          </button>
          <div className="relative" ref={useRef<HTMLDivElement>(null)}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsAlertsOpen(!isAlertsOpen);
              }}
              className="relative text-graticule-teal hover:text-registry-ink transition-colors outline-none cursor-pointer"
            >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-alluvium-red text-white flex items-center justify-center text-[9px] font-bold rounded-full border-2 border-survey-paper">{unreadCount}</span>}
            </button>
            {isAlertsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-graticule-teal/30 rounded-sm shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-graticule-teal/10 bg-survey-paper/50 flex justify-between items-center">
                  <h3 className="font-semibold text-registry-ink text-sm">Notifications</h3>
                  <button onClick={() => fetch('/api/notifications/read', {method: 'POST'}).then(r => r.json()).then(data => setNotifications(data))} className="text-xs text-graticule-teal hover:underline outline-none font-medium">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-registry-ink/50 text-sm">No new notifications.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => setNotifications(notifications.map(x => x.id === n.id ? {...x, read: true} : x))} className={`p-3 border-b border-graticule-teal/10 hover:bg-graticule-teal/5 transition-colors cursor-pointer group ${!n.read ? 'bg-survey-paper/30' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.severity === 'high' ? 'bg-alluvium-red' : n.severity === 'medium' ? 'bg-tilled-earth' : 'bg-cultivated-green'}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <p className={`text-sm text-registry-ink ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                             {!n.read && <span className="w-1.5 h-1.5 bg-graticule-teal rounded-full mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-registry-ink/70 mt-0.5 leading-snug line-clamp-2">{n.msg}</p>
                          <p className="text-[10px] text-registry-ink/50 mt-1.5 font-medium">{n.time} • {n.loc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-graticule-teal/10 bg-survey-paper/50 text-center">
                  <button onClick={() => { setIsAlertsOpen(false); if (setActiveTab) setActiveTab('alerts'); }} className="text-xs font-medium text-tilled-earth hover:underline outline-none">View All Notifications</button>
                </div>
              </div>
            )}
          </div>
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
                  <p className="text-sm font-semibold text-registry-ink">{profile.name}</p>
                  <p className="text-xs text-registry-ink/60">{profile.role} • {profile.district}</p>
                  <p className="text-xs text-graticule-teal mt-0.5">{profile.email}</p>
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
