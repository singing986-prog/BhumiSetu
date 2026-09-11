import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const toolsButton = `
          {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
            <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={\`p-2 transition-colors \${activeTool === 'draw' ? 'bg-graticule-teal/20 text-alluvium-red' : 'hover:bg-graticule-teal/10 text-registry-ink'}\`} title="GIS Tools">
              <PenTool className="w-5 h-5" />
            </button>
          )}
`;

code = code.replace(/<button onClick=\{\(\) => setActiveTool\(activeTool === 'draw' \? null : 'draw'\)\}[\s\S]*?<\/button>/, toolsButton.trim());
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map Auth Tools");
