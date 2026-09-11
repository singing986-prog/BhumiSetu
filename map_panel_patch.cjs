const fs = require('fs');
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Add selectedFeature state
code = code.replace(
  /const \[hoverInfo, setHoverInfo\] = useState<any>\(null\);/,
  `const [hoverInfo, setHoverInfo] = useState<any>(null);\n  const [selectedFeature, setSelectedFeature] = useState<any>(null);`
);

// Add click handler
code = code.replace(
  /onClick=\{\(e\) => \{[\s\S]*?\}\}/,
  `onClick={(e) => {
            const feature = e.features?.[0];
            if (feature?.properties) {
              setSelectedFeature(feature.properties);
            } else {
              setSelectedFeature(null);
            }
          }}`
);

// Add the right panel UI
const panelUI = `
      {/* Right Details Panel */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 bg-white w-80 border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col max-h-[calc(100%-2rem)] overflow-hidden">
          <div className="p-4 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center shrink-0">
            <h3 className="font-serif font-semibold text-registry-ink truncate mr-2">
              {selectedFeature.ulpin ? \`Parcel: \${selectedFeature.ulpin}\` : (selectedFeature.village || selectedFeature.name || "Feature Details")}
            </h3>
            <button onClick={() => setSelectedFeature(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 overflow-y-auto space-y-4">
            {Object.entries(selectedFeature).map(([key, value]) => {
              if (key === 'id') return null;
              return (
                <div key={key} className="flex flex-col gap-1 border-b border-graticule-teal/10 pb-2 last:border-0">
                  <span className="text-xs text-registry-ink/60 uppercase tracking-wide">{key}</span>
                  <span className="font-medium text-registry-ink break-words">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Drawing Tools */}`;

code = code.replace(/\{\/\* Drawing Tools \*\/\}/, panelUI);

fs.writeFileSync('src/components/Map.tsx', code);
console.log('Done');
