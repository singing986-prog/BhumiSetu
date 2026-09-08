const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'export function KPILedger() {',
  'export function KPILedger({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {'
);

content = content.replace(
  'fetch("/api/kpis")',
  'fetch(`/api/kpis?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)'
);
content = content.replace(
  '}, []);',
  '}, [selectedState, selectedDistrict]);'
);

content = content.replace(
  'export function PredictiveRisk() {',
  'export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {\n  const [risks, setRisks] = useState<any[]>([]);\n  useEffect(() => {\n    fetch(`/api/risk?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`).then(r => r.json()).then(data => setRisks(data));\n  }, [selectedState, selectedDistrict]);'
);

content = content.replace(
  '{t("risk.project1", "Western Dedicated Freight Corridor Phase 3")}',
  '{risks[0]?.name || t("risk.project1", "Western Dedicated Freight Corridor Phase 3")}'
);
content = content.replace(
  '{t("risk.project2", "Godavari Irrigation Canal Ext.")}',
  '{risks[1]?.name || t("risk.project2", "Godavari Irrigation Canal Ext.")}'
);
content = content.replace(
  '{t("risk.project3", "Delhi-Dehradun Expressway")}',
  '{risks[2]?.name || t("risk.project3", "Delhi-Dehradun Expressway")}'
);

content = content.replace(
  'export function WorkflowTracker() {\n  const { t } = useTranslation();\n  const stages = [',
  'export function WorkflowTracker({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {\n  const { t } = useTranslation();\n  const [stages, setStages] = useState<any[]>([\n'
);

content = content.replace(
  '    { id: 6, name: t("workflow.rnr"), status: "pending", date: "-" },\n  ];',
  '    { id: 6, name: t("workflow.rnr"), status: "pending", date: "-" },\n  ]);\n  useEffect(() => {\n    fetch(`/api/workflow?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`).then(r => r.json()).then(data => {\n      setStages(data.map((s: any) => ({ ...s, name: t(`workflow.${s.name}`) })));\n    });\n  }, [selectedState, selectedDistrict, t]);'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
