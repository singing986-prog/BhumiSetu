const fs = require('fs');
let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Sidebar
layoutContent = layoutContent.replace(
  'export function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {',
  'export function Sidebar({ activeTab, setActiveTab, profile = { name: "Ramesh Kumar", district: "New Delhi" } }: { activeTab: string; setActiveTab: (tab: string) => void; profile?: any }) {'
);

layoutContent = layoutContent.replace(
  '<div className="font-semibold text-survey-paper truncate">Ramesh Kumar</div>',
  '<div className="font-semibold text-survey-paper truncate">{profile.name}</div>'
);
layoutContent = layoutContent.replace(
  '<div className="text-xs text-survey-paper/70">{t("district.newDelhi")}, NCT</div>',
  '<div className="text-xs text-survey-paper/70">{profile.district}, NCT</div>'
);

// TopNav
layoutContent = layoutContent.replace(
  'export function TopNav({ \n  setActiveTab,\n  selectedState = "All States",\n  setSelectedState,\n  selectedDistrict = "All Districts",\n  setSelectedDistrict,\n  setIsAuthenticated,\n  openModal\n}: { \n  setActiveTab?: (tab: string) => void,\n  selectedState?: string,\n  setSelectedState?: (s: string) => void,\n  selectedDistrict?: string,\n  setSelectedDistrict?: (d: string) => void,\n  setIsAuthenticated?: (auth: boolean) => void,\n  openModal?: (modal: string) => void\n}) {',
  `export function TopNav({ 
  setActiveTab,
  setIsAuthenticated,
  openModal,
  profile = { name: "Ramesh Kumar", role: "District LAO", email: "ramesh.k@bhoomisetu.gov.in", district: "New Delhi" }
}: { 
  setActiveTab?: (tab: string) => void,
  setIsAuthenticated?: (auth: boolean) => void,
  openModal?: (modal: string) => void,
  profile?: any
}) {`
);

layoutContent = layoutContent.replace(
  '<p className="text-sm font-semibold text-registry-ink">Ramesh Kumar</p>',
  '<p className="text-sm font-semibold text-registry-ink">{profile.name}</p>'
);
layoutContent = layoutContent.replace(
  '<p className="text-xs text-registry-ink/60">{t("header.role")} • {t("district.newDelhi")}</p>',
  '<p className="text-xs text-registry-ink/60">{profile.role} • {profile.district}</p>'
);
layoutContent = layoutContent.replace(
  '<p className="text-xs text-graticule-teal mt-0.5">ramesh.k@bhoomisetu.gov.in</p>',
  '<p className="text-xs text-graticule-teal mt-0.5">{profile.email}</p>'
);

fs.writeFileSync('src/components/Layout.tsx', layoutContent);
