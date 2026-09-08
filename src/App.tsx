/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [autoSync, setAutoSync] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-survey-paper text-registry-ink flex flex-col font-sans">
      <TopNav 
        setActiveTab={setActiveTab} 
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        setIsAuthenticated={setIsAuthenticated}
        openModal={setActiveModal}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {activeTab === "dashboard" && (
            <>
              <KPILedger />
              <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
                <div className="flex-[2] min-h-[500px] lg:min-h-0 flex flex-col shadow-sm">
                  <div className="p-4 bg-white border-x border-t border-graticule-teal/30 font-serif font-semibold text-registry-ink flex justify-between items-center">
                    <h2>{t("dashboard.mapTitle")}</h2>
                    <button 
                      onClick={() => setAutoSync(!autoSync)} 
                      className={`text-xs font-sans font-medium px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${autoSync ? 'bg-graticule-teal/10 text-graticule-teal border border-graticule-teal/30 hover:bg-graticule-teal/20' : 'bg-registry-ink/10 text-registry-ink/60 border border-registry-ink/20 hover:bg-registry-ink/20'}`}
                    >
                      {autoSync ? t("dashboard.autoSyncActive") : t("dashboard.autoSyncPaused")}
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0">
                      <GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} isAutoSync={autoSync} />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[300px] flex flex-col">
                  <div className="shadow-sm">
                    <WorkflowTracker />
                  </div>
                  <PredictiveRisk />
                </div>
              </div>
            </>
          )}

          {activeTab === "proposals" && <Proposals />}
          {activeTab === "compensation" && <Compensation />}
          {activeTab === "rnr" && <RnR />}
          {activeTab === "documents" && <Documents />}
          {activeTab === "alerts" && <AlertsPanel setActiveTab={setActiveTab} />}
          {activeTab === "map" && <MapView selectedState={selectedState} selectedDistrict={selectedDistrict} />}
          {activeTab === "awards" && <Awards />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "grievance" && <Grievances />}

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
        <Modal title={t("profile.myProfile", "My Profile")} icon={User} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-graticule-teal/10 flex items-center justify-center text-4xl text-registry-ink border border-graticule-teal/30">
                RK
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-registry-ink/60 mb-1">Full Name</label>
              <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">Ramesh Kumar</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-registry-ink/60 mb-1">Email</label>
              <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">ramesh.k@bhoomisetu.gov.in</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-registry-ink/60 mb-1">Role</label>
              <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">District LAO • New Delhi</div>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "settings" && (
        <Modal title={t("profile.settings", "Account Settings")} icon={Settings} onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Preferences</h3>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors">
                <span className="text-sm">Email Notifications</span>
                <input type="checkbox" defaultChecked className="accent-tilled-earth w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors mt-2">
                <span className="text-sm">SMS Alerts</span>
                <input type="checkbox" defaultChecked className="accent-tilled-earth w-4 h-4" />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Security</h3>
              <button className="w-full px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
