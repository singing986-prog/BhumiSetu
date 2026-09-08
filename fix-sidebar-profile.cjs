const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  'export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {',
  'export function Sidebar({ activeTab, setActiveTab, profile = { name: "Ramesh Kumar", district: "New Delhi", role: "District LAO" } }: { activeTab: string, setActiveTab: (tab: string) => void, profile?: any }) {'
);

fs.writeFileSync('src/components/Layout.tsx', content);
