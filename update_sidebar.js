const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const getDashboardLabelCode = `
  let dashboardLabel = t("nav.dashboard");
  if (profile?.role === "State Nodal Officer") dashboardLabel = t("nav.dashboardState", "State Dashboard");
  else if (profile?.role === "District LAO") dashboardLabel = t("nav.dashboardDistrict", "District Dashboard");
  else if (profile?.role === "Project Implementing Agency") dashboardLabel = t("nav.dashboardProject", "Project Dashboard");
  else if (profile?.role === "Field Surveyor") dashboardLabel = t("nav.dashboardField", "Field Dashboard");
  else if (profile?.role === "Affected Citizen") dashboardLabel = t("nav.dashboardCitizen", "My Case");
  else if (profile?.role === "Super Admin" || profile?.role === "Central Ministry Officer" || profile?.role === "Auditor") dashboardLabel = t("nav.dashboardNational", "National Dashboard");
`;

code = code.replace(
  /const allTabs = \[/,
  `${getDashboardLabelCode}\n  const allTabs = [`
);

code = code.replace(
  /{ id: "dashboard", label: t\("nav.dashboard"\), icon: LayoutDashboard },/,
  `{ id: "dashboard", label: dashboardLabel, icon: LayoutDashboard },`
);

fs.writeFileSync('src/components/Layout.tsx', code);
