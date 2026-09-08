const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Completely rewrite PredictiveRisk component
const riskReplaceStart = 'export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {';
const riskReplaceEnd = '    </div>\n  );\n}';

const newRisk = `export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {
  const [risks, setRisks] = useState<any[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    fetch(\`/api/risk?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}\`).then(r => r.json()).then(data => setRisks(data));
  }, [selectedState, selectedDistrict]);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-graticule-teal/10">
        <div>
          <h3 className="font-serif text-lg font-semibold text-alluvium-red flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> 
            Acquisition Risk Watch
          </h3>
          <p className="text-sm text-registry-ink/60 mt-1">3 projects require immediate attention</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {/* High Risk Item */}
        <div className="p-4 bg-alluvium-red/5 border border-alluvium-red/20 rounded-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="px-2 py-0.5 bg-alluvium-red text-white text-[10px] font-bold tracking-wider rounded-sm uppercase">High Risk</div>
            <span className="text-xs text-registry-ink/50">28 days overdue</span>
          </div>
          <h4 className="font-medium text-registry-ink text-sm">{risks[0]?.name || t("risk.project1", "Western Dedicated Freight Corridor Phase 3")}</h4>
          <p className="text-xs text-registry-ink/70 mt-2 flex items-center gap-2"><Circle className="w-1.5 h-1.5 fill-alluvium-red text-alluvium-red"/> 3 contributing risk factors</p>
          <button className="text-xs font-medium text-alluvium-red hover:underline mt-3">View intervention plan →</button>
        </div>

        {/* Medium Risk Items */}
        <div className="flex flex-col gap-3">
           <div className="p-3 border border-tilled-earth/20 bg-tilled-earth/5 rounded-sm flex justify-between items-center group cursor-pointer hover:bg-tilled-earth/10 transition-colors">
              <div>
                <h4 className="font-medium text-registry-ink text-sm">{risks[1]?.name || t("risk.project2", "Godavari Irrigation Canal Ext.")}</h4>
                <p className="text-[10px] text-registry-ink/60 mt-0.5">Approaching Sec 19 deadline</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-tilled-earth"></div>
           </div>
           
           <div className="p-3 border border-tilled-earth/20 bg-tilled-earth/5 rounded-sm flex justify-between items-center group cursor-pointer hover:bg-tilled-earth/10 transition-colors">
              <div>
                <h4 className="font-medium text-registry-ink text-sm">{risks[2]?.name || t("risk.project3", "Delhi-Dehradun Expressway")}</h4>
                <p className="text-[10px] text-registry-ink/60 mt-0.5">High objection volume detected</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-tilled-earth"></div>
           </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowTracker`;

content = content.replace(/export function PredictiveRisk[\s\S]*?export function WorkflowTracker/, newRisk);

fs.writeFileSync('src/components/Dashboard.tsx', content);
