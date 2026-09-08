const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// I will add a clickedFeature state
content = content.replace(
  'const [hoverInfo, setHoverInfo] = useState<any>(null);',
  'const [hoverInfo, setHoverInfo] = useState<any>(null);\n  const [clickedFeature, setClickedFeature] = useState<any>(null);'
);

content = content.replace(
  'const onHover = (event: any) => {',
  `const onClick = (event: any) => {
    const { features } = event;
    const clicked = features && features[0];
    if (clicked) {
      setClickedFeature(clicked);
    } else {
      setClickedFeature(null);
    }
  };

  const onHover = (event: any) => {`
);

content = content.replace(
  'onMouseLeave={() => setHoverInfo(null)}',
  'onMouseLeave={() => setHoverInfo(null)}\n        onClick={onClick}'
);

// Add the detail panel for the clicked feature
const detailPanel = `
      {clickedFeature && (
        <div className="absolute right-6 top-6 bottom-6 w-80 bg-white border border-graticule-teal/30 shadow-xl z-20 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-start">
            <div>
              <h3 className="font-serif font-semibold text-registry-ink text-lg">Parcel Details</h3>
              <p className="text-xs text-registry-ink/60 mt-1">{clickedFeature.properties.ulpin || 'N/A'}</p>
            </div>
            <button onClick={() => setClickedFeature(null)} className="text-registry-ink/50 hover:text-alluvium-red transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-4 space-y-4 text-sm">
            <div>
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Location</div>
              <div className="font-medium text-registry-ink">{clickedFeature.properties.village || 'Khedki'}, {selectedDistrict}, {selectedState}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Survey / Khasra</div>
                <div className="font-medium text-registry-ink">{clickedFeature.properties.khasra || '45/2'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Area</div>
                <div className="font-medium text-registry-ink">{clickedFeature.properties.area || '0.0'} Ha</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Land Type</div>
              <div className="font-medium text-registry-ink">{clickedFeature.properties.landType || 'Agricultural'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Ownership Status</div>
              <div className="font-medium text-registry-ink">{clickedFeature.properties.owner || 'Private'}</div>
            </div>
            <div className="border-t border-graticule-teal/10 pt-4 mt-2">
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider mb-2">Acquisition Status</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-registry-ink/70">Stage</span>
                  <span className="font-medium capitalize">{clickedFeature.properties.status || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-registry-ink/70">Compensation</span>
                  <span className="font-medium text-tilled-earth">Assessed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-registry-ink/70">R&R</span>
                  <span className="font-medium text-registry-ink/50">N/A</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border border-graticule-teal text-graticule-teal rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-graticule-teal hover:text-white transition-colors">
              View Full Record
            </button>
          </div>
        </div>
      )}
`;

content = content.replace(
  '      <div className="absolute bottom-6 left-6 bg-white p-4 border border-graticule-teal/30 shadow-sm text-sm z-10">',
  detailPanel + '      <div className="absolute bottom-6 left-6 bg-white p-4 border border-graticule-teal/30 shadow-sm text-sm z-10">'
);

fs.writeFileSync('src/components/Map.tsx', content);
