import { apiFetch } from "./api";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Sidebar, TopNav } from "./components/Layout";
import { KPILedger, WorkflowTracker, PredictiveRisk } from "./components/Dashboard";
import { GISMap } from "./components/Map";
import { Proposals } from "./components/Proposals";
import { Compensation } from "./components/Compensation";
import { RnR } from "./components/RnR";
import { Documents } from "./components/Documents";
import { AlertsPanel } from "./components/Alerts";
import { MapView } from "./components/MapView";
import { Awards } from "./components/Awards";
import { Reports } from "./components/Reports";
import { Grievances } from "./components/Grievance";
import { FilterBar } from "./components/Dashboard";
import { DashboardAnalytics } from "./components/DashboardAnalytics";
import { useTranslation } from "./i18n";
import { Login } from "./components/Login";
import { Settings, User, X, Check } from "lucide-react";

function Modal({ title, icon: Icon, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-lg w-full max-w-md flex flex-col border border-graticule-teal/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-graticule-teal/10 flex justify-between items-center bg-survey-paper/50">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-tilled-earth" />
            <h2 className="font-serif text-lg font-semibold text-registry-ink">{title}</h2>
          </div>
          <button onClick={onClose} className="text-registry-ink/40 hover:text-alluvium-red transition-colors outline-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("bhoomi_token"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRisk, setSelectedRisk] = useState("All Risks");
  
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState("Live");
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}));
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const reconnectAttempts = useRef(0);


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      localStorage.removeItem("bhoomi_token");
      localStorage.removeItem("bhoomi_refresh");
    };
    window.addEventListener('bhoomi_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bhoomi_unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    let pingInterval: any;
    
    const connectToMockWebSocket = () => {
      setSyncStatus("Connecting");
      
      setTimeout(() => {
        setSyncStatus("Live");
        setLastSync(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}));
        reconnectAttempts.current = 0;
        
        // Setup heartbeat
        pingInterval = setInterval(() => {
          // Simulate a random disconnect 2% of the time to demonstrate reconnect logic
          if (Math.random() < 0.02) {
            setSyncStatus("Offline");
            clearInterval(pingInterval);
            handleReconnect();
          } else {
            setLastSync(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}));
          }
        }, 10000);
      }, 1000);
    };

    const handleReconnect = () => {
      setSyncStatus("Reconnecting");
      const backoff = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current += 1;
      
      setTimeout(() => {
        connectToMockWebSocket();
      }, backoff);
    };

    connectToMockWebSocket();

    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, []);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordState, setPasswordState] = useState({ error: "", success: false });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true });
  const { t } = useTranslation();
  useEffect(() => {
    const token = localStorage.getItem("bhoomi_token");
    const refresh = localStorage.getItem("bhoomi_refresh");
    if (isAuthenticated && token) {
      // Decode user from token or refresh
      apiFetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      }).then(r => {
        if(r.ok) return r.json();
        throw new Error('session expired');
      }).then(data => {
        localStorage.setItem("bhoomi_token", data.token);
        setProfile(data.user);
        setSelectedState(data.user.state === "All" ? "All States" : (data.user.state || "All States"));
        setSelectedDistrict(data.user.district === "All" ? "All Districts" : (data.user.district || "All Districts"));
        setIsHydrating(false);
      }).catch(() => {
        setIsAuthenticated(false); 
        localStorage.removeItem("bhoomi_token"); 
        localStorage.removeItem("bhoomi_refresh");
        setIsHydrating(false);
      });
    } else {
      setIsHydrating(false);
    }
  }, [isAuthenticated]);

  if (isHydrating) {
    return <div className="min-h-screen flex items-center justify-center bg-survey-paper"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-alluvium-red"></div></div>;
  }
  if (!isAuthenticated || !profile) {
    return <Login onLogin={(user) => { 
      setIsAuthenticated(true); 
      setProfile(user);
      setSelectedState(user.state === "All" ? "All States" : (user.state || "All States"));
      setSelectedDistrict(user.district === "All" ? "All Districts" : (user.district || "All Districts"));
    }} />;
  }

  return (
    <div className="h-screen bg-survey-paper text-registry-ink flex flex-col font-sans overflow-hidden">
      <TopNav 
        setActiveTab={setActiveTab} 
        setIsAuthenticated={setIsAuthenticated}
        openModal={setActiveModal}
        profile={profile}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
        
        <main className={`flex-1 flex flex-col min-w-0 ${activeTab === "map" ? "overflow-hidden relative" : "overflow-y-auto"}`}>
          {activeTab === "dashboard" && (
            <>
              <FilterBar profile={profile} selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedProject={selectedProject} setSelectedProject={setSelectedProject} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedStage={selectedStage} setSelectedStage={setSelectedStage} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedRisk={selectedRisk} setSelectedRisk={setSelectedRisk} />
              <KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} onNavigate={setActiveTab} />
              <div className="flex-none min-h-[600px] p-6 flex flex-col xl:flex-row gap-6">
                <div className="flex-[2] min-h-[400px] xl:min-h-0 flex flex-col shadow-sm relative">
                  <div className="p-4 bg-white border-x border-t border-graticule-teal/30 font-serif font-semibold text-registry-ink flex justify-between items-center">
                    <h2>{t("dashboard.mapTitle")}</h2>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowSyncPanel(!showSyncPanel)} 
                        className={`text-xs font-sans font-medium px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${syncStatus === 'Live' ? 'bg-graticule-teal/10 text-graticule-teal border border-graticule-teal/30 hover:bg-graticule-teal/20' : syncStatus === 'Offline' ? 'bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30' : 'bg-registry-ink/10 text-registry-ink border border-registry-ink/20'}`}
                      >
                        {syncStatus === "Live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cultivated-green mr-1.5 mb-0.5 animate-pulse"></span>}
                        {syncStatus === "Offline" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-alluvium-red mr-1.5 mb-0.5"></span>}
                        {(syncStatus === "Syncing..." || syncStatus === "Connecting" || syncStatus === "Reconnecting") && <span className="inline-block w-1.5 h-1.5 rounded-full bg-graticule-teal mr-1.5 mb-0.5 animate-ping"></span>}
                        {syncStatus}
                      </button>

                      {showSyncPanel && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-graticule-teal/30 shadow-xl rounded-sm z-[100] p-4 text-xs font-sans font-normal">
                          <h4 className="font-semibold text-registry-ink mb-3 border-b border-graticule-teal/10 pb-2">{t("sync.connectionStatus", "Connection Status")}</h4>
                          <div className="space-y-2 text-registry-ink/80">
                            <div className="flex justify-between">
                              <span>{t("sync.status", "Status:")}</span>
                              <span className={`font-medium ${syncStatus === 'Live' ? 'text-cultivated-green' : 'text-alluvium-red'}`}>{syncStatus}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("sync.lastSync", "Last Sync:")}</span>
                              <span>{lastSync}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("sync.autoUpdate", "Auto-update:")}</span>
                              <span className="text-graticule-teal">{t("sync.enabled", "Enabled")}</span>
                            </div>
                          </div>
                          {syncStatus === 'Offline' && (
                            <button 
                              onClick={() => setSyncStatus("Connecting")}
                              className="mt-4 w-full bg-tilled-earth text-white py-1.5 rounded-sm hover:bg-tilled-earth/90 transition-colors cursor-pointer"
                            >
                              {t("sync.reconnect", "Reconnect Now")}
</button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0">
                      <GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} isAutoSync={autoSync} searchQuery={searchQuery} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[350px] flex flex-col gap-6 overflow-y-auto pr-2">
                  <div className="shadow-sm flex-none">
                    <WorkflowTracker selectedState={selectedState} selectedDistrict={selectedDistrict} />
                  </div>
                  <PredictiveRisk selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} />
                </div>
              </div>
              <div className="flex-none pb-6">
                <DashboardAnalytics 
                  selectedState={selectedState} 
                  selectedDistrict={selectedDistrict} 
                  selectedProject={selectedProject} 
                  selectedStage={selectedStage} 
                  selectedCategory={selectedCategory} 
                  selectedRisk={selectedRisk} 
                />
              </div>

            </>
          )}

          {activeTab === "proposals" && <div className="h-full overflow-y-auto p-4"><Proposals profile={profile} setActiveTab={setActiveTab} setSelectedProject={setSelectedProject} selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} /></div>}
          {activeTab === "compensation" && <div className="h-full overflow-y-auto p-4"><Compensation selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} /></div>}
          {activeTab === "rnr" && <div className="h-full overflow-y-auto p-4"><RnR selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} /></div>}
          {activeTab === "documents" && <div className="h-full overflow-y-auto p-4"><Documents selectedState={selectedState} selectedDistrict={selectedDistrict} selectedProject={selectedProject} selectedStage={selectedStage} selectedCategory={selectedCategory} selectedRisk={selectedRisk} profile={profile} setActiveTab={setActiveTab} setSelectedProject={setSelectedProject}  /></div>}
          {activeTab === "alerts" && <div className="h-full overflow-y-auto p-4"><AlertsPanel setActiveTab={setActiveTab} selectedState={selectedState} selectedDistrict={selectedDistrict} /></div>}
          {activeTab === "map" && <div className="h-full w-full absolute inset-0"><MapView setActiveTab={setActiveTab} profile={profile} selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedStage={selectedStage} setSelectedStage={setSelectedStage} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedRisk={selectedRisk} setSelectedRisk={setSelectedRisk} /></div>}
          {activeTab === "awards" && <div className="h-full overflow-y-auto p-4"><Awards selectedState={selectedState} selectedDistrict={selectedDistrict} setActiveTab={setActiveTab} setSelectedProject={setSelectedProject} profile={profile} /></div>}
          {activeTab === "reports" && <div className="h-full overflow-y-auto p-4"><Reports selectedState={selectedState} selectedDistrict={selectedDistrict} /></div>}
          {activeTab === "grievance" && <div className="h-full overflow-y-auto p-4"><Grievances selectedState={selectedState} selectedDistrict={selectedDistrict} /></div>}

          {activeTab !== "dashboard" && activeTab !== "proposals" && activeTab !== "compensation" && activeTab !== "rnr" && activeTab !== "documents" && activeTab !== "alerts" && activeTab !== "map" && activeTab !== "awards" && activeTab !== "reports" && activeTab !== "grievance" && (
            <div className="p-8 flex items-center justify-center h-full text-registry-ink/60">
              <div className="text-center">
                <div className="text-4xl mb-4 text-graticule-teal/40 flex justify-center">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-registry-ink mb-2">{t(`nav.${activeTab}`, activeTab.charAt(0).toUpperCase() + activeTab.slice(1))} {t("module.title", "Module")}</h3>
                <p>{t("module.comingSoon", "This module is available in subsequent build phases.")}</p>
              </div>
            </div>
          )}
        </main>
      </div>

            {activeModal === "profile" && (
        <Modal title={t("profile.myProfile", "My Profile")} icon={User} onClose={() => { setActiveModal(null); setIsEditingProfile(false); }}>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-graticule-teal/10 flex items-center justify-center text-4xl text-registry-ink border border-graticule-teal/30">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            
            {passwordState.error && activeModal === "profile" && <div className="text-alluvium-red text-xs">{passwordState.error}</div>}
            {passwordState.success && activeModal === "profile" && <div className="text-cultivated-green text-xs">Profile updated successfully.</div>}
            
            {!isEditingProfile ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Full Name</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">{profile.name}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Email</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">{profile.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Role & Jurisdiction</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm opacity-70">{profile.role} • {profile.district}</div>
                </div>
                <button onClick={() => { setEditProfileForm({name: profile.name, email: profile.email}); setIsEditingProfile(true); setPasswordState({error: "", success: false}); }} className="w-full px-4 py-2 border border-registry-ink text-registry-ink rounded-sm text-sm font-medium hover:bg-graticule-teal/5 transition-colors mt-4">
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Full Name</label>
                  <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Email</label>
                  <input type="email" value={editProfileForm.email} onChange={e => setEditProfileForm({...editProfileForm, email: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Role & Jurisdiction (Read Only)</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm opacity-50">{profile.role} • {profile.district}</div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 px-4 py-2 border border-registry-ink text-registry-ink rounded-sm text-sm font-medium hover:bg-graticule-teal/5 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => {
                    apiFetch('/api/profile', {
                      method: 'POST', headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ name: editProfileForm.name, email: editProfileForm.email })
                    }).then(r => r.json()).then(data => {
                      setProfile(data);
                      setIsEditingProfile(false);
                      setPasswordState({error: "", success: true});
                    }).catch(e => setPasswordState({error: "Failed to save profile.", success: false}));
                  }} className="flex-1 px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {activeModal === "settings" && (
        <Modal title={t("profile.settings", "Account Settings")} icon={Settings} onClose={() => { setActiveModal(null); setPasswordState({error: "", success: false}); setPasswordForm({current: "", newPass: "", confirm: ""}); }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Preferences</h3>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors">
                <span className="text-sm">Email Notifications</span>
                <input type="checkbox" checked={notifPrefs.email} onChange={e => {
                  setNotifPrefs({...notifPrefs, email: e.target.checked});
                  apiFetch('/api/profile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ notifEmail: e.target.checked }) });
                }} className="accent-tilled-earth w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors mt-2">
                <span className="text-sm">SMS Alerts</span>
                <input type="checkbox" checked={notifPrefs.sms} onChange={e => {
                  setNotifPrefs({...notifPrefs, sms: e.target.checked});
                  apiFetch('/api/profile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ notifSms: e.target.checked }) });
                }} className="accent-tilled-earth w-4 h-4" />
              </label>
            </div>
            
            <div className="pt-2 border-t border-graticule-teal/10">
              <h3 className="text-sm font-semibold mb-3">Change Password</h3>
              {passwordState.error && <div className="text-alluvium-red text-xs mb-2">{passwordState.error}</div>}
              {passwordState.success && <div className="text-cultivated-green text-xs mb-2">Password changed successfully. Please log in again.</div>}
              
              <div className="space-y-3">
                <input type="password" placeholder={t("profile.currentPassword", "Current Password")} value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                <input type="password" placeholder={t("profile.newPassword", "New Password")} value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                <input type="password" placeholder={t("profile.confirmPassword", "Confirm New Password")} value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                <button onClick={() => {
                  if (passwordForm.newPass !== passwordForm.confirm) {
                    setPasswordState({error: "Passwords do not match", success: false});
                    return;
                  }
                  apiFetch('/api/password', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ current: passwordForm.current, newPass: passwordForm.newPass })
                  }).then(r => r.json()).then(data => {
                    if (data.error) setPasswordState({error: data.error, success: false});
                    else {
                      setPasswordState({error: "", success: true});
                      setPasswordForm({current: "", newPass: "", confirm: ""});
                      setTimeout(() => { setIsAuthenticated(false); localStorage.removeItem("bhoomi_token"); localStorage.removeItem("bhoomi_refresh"); }, 2000); // Logout after change
                    }
                  }).catch(e => setPasswordState({error: "Server error", success: false}));
                }} className="w-full px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors mt-2">
                  {t("profile.updatePassword", "Update Password")}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
