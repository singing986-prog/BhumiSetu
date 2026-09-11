const fs = require('fs');

const riskComponent = `
export function PredictiveRisk({ selectedState = "All States", selectedDistrict = "All Districts", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [selectedRiskProj, setSelectedRiskProj] = useState<any | null>(null);

  useEffect(() => {
    apiFetch(\`/api/risk?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject)}&stage=\${encodeURIComponent(selectedStage)}&category=\${encodeURIComponent(selectedCategory)}&risk=\${encodeURIComponent(selectedRisk)}\`)
      .then(res => res.json())
      .then(data => setRisks(data));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Predictive Delay-Risk</h3>
          <p className="text-sm text-registry-ink/60 mt-1">AI-Powered Risk Assessment</p>
        </div>
        <div className="px-3 py-1 bg-registry-ink/10 text-registry-ink border border-registry-ink/20 text-[10px] uppercase font-bold tracking-wider rounded-sm">
          Analytics Engine Active
        </div>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {risks.length > 0 ? risks.map((risk, i) => (
          <div key={i} className="p-4 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal transition-colors cursor-pointer group" onClick={() => setSelectedRiskProj(risk)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-registry-ink group-hover:text-graticule-teal transition-colors">{risk.projectName}</h4>
                <p className="text-xs text-registry-ink/60 mt-1">{risk.district}, {risk.state}</p>
              </div>
              <div className={\`px-2 py-1 rounded-sm text-xs font-bold \${risk.level === 'High' ? 'bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30' : risk.level === 'Medium' ? 'bg-tilled-earth/10 text-tilled-earth border border-tilled-earth/30' : 'bg-cultivated-green/10 text-cultivated-green border border-cultivated-green/30'}\`}>
                {risk.level} Risk
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-[10px] text-registry-ink/60 uppercase font-medium mb-1">Risk Score</div>
                <div className="text-xl font-serif font-bold text-registry-ink">{risk.score}/100</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-registry-ink/60 uppercase font-medium mb-1">Impact</div>
                <div className="text-sm font-medium text-alluvium-red">{risk.overdueDays} days delay</div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-sm text-registry-ink/60 text-center py-8">No risk data available for the current selection.</div>
        )}
      </div>

      {selectedRiskProj && (
        <div className="fixed inset-0 bg-registry-ink/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-graticule-teal/20 flex justify-between items-center bg-survey-paper">
              <h3 className="font-serif font-bold text-registry-ink flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-alluvium-red" />
                Intervention Plan: {selectedRiskProj.projectName}
              </h3>
              <button onClick={() => setSelectedRiskProj(null)} className="p-1 hover:bg-white rounded-sm text-registry-ink/60 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
               <div className="flex gap-6">
                 <div className="flex-1 bg-alluvium-red/5 border border-alluvium-red/20 p-4 rounded-sm text-center">
                    <div className="text-4xl font-serif font-bold text-alluvium-red mb-1">{selectedRiskProj.score}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-alluvium-red">Risk Score</div>
                 </div>
                 <div className="flex-[2] bg-survey-paper border border-graticule-teal/20 p-4 rounded-sm flex flex-col justify-center">
                    <div className="text-xs uppercase text-registry-ink/60 font-medium mb-1">AI Recommendation</div>
                    <div className="font-medium text-registry-ink">{selectedRiskProj.recommendation}</div>
                 </div>
               </div>

               <div>
                 <h4 className="font-semibold text-registry-ink mb-3 uppercase text-xs tracking-wider border-b border-graticule-teal/20 pb-2">Primary Risk Factors</h4>
                 <ul className="space-y-2">
                   {selectedRiskProj.factors?.map((f: string, i: number) => (
                     <li key={i} className="flex items-start gap-2 text-sm text-registry-ink/80">
                       <span className="w-1.5 h-1.5 rounded-full bg-alluvium-red mt-1.5 flex-shrink-0" />
                       {f}
                     </li>
                   ))}
                 </ul>
               </div>

               {selectedRiskProj.lapseRisk && selectedRiskProj.lapseRisk !== 'LOW' && (
                 <div className="bg-alluvium-red/10 border border-alluvium-red/30 p-4 rounded-sm">
                   <h4 className="font-bold text-alluvium-red mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Section 24(2) Lapse Risk: {selectedRiskProj.lapseRisk}
                   </h4>
                   <p className="text-sm text-alluvium-red/90">{selectedRiskProj.lapseReason}</p>
                 </div>
               )}

               <div>
                 <h4 className="font-semibold text-registry-ink mb-3 uppercase text-xs tracking-wider border-b border-graticule-teal/20 pb-2">Proposed Interventions</h4>
                 <div className="space-y-3">
                    <button onClick={() => { alert('Intervention actioned!'); setSelectedRiskProj(null); }} className="w-full text-left p-3 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal hover:bg-graticule-teal/5 transition-colors cursor-pointer">
                      <div className="font-medium text-sm text-registry-ink">Escalate to State Nodal Officer</div>
                      <div className="text-xs text-registry-ink/60 mt-1">Generate automated briefing document and alert SNO.</div>
                    </button>
                    <button onClick={() => { alert('Intervention actioned!'); setSelectedRiskProj(null); }} className="w-full text-left p-3 border border-graticule-teal/20 rounded-sm hover:border-graticule-teal hover:bg-graticule-teal/5 transition-colors cursor-pointer">
                      <div className="font-medium text-sm text-registry-ink">Schedule High-Power Committee Review</div>
                      <div className="text-xs text-registry-ink/60 mt-1">Add to agenda for next weekly cross-departmental review.</div>
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.appendFileSync('src/components/Dashboard.tsx', riskComponent);
