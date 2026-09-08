const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Ensure layers respect the state toggles
content = content.replace(
  /interactiveLayerIds={parcels \? \["parcels-sec11-fill", "parcels-award-fill", "corridor-line"\] : \[\]}/,
  'interactiveLayerIds={parcels ? [...(showSec11 ? ["parcels-sec11-fill"] : []), ...(showAward ? ["parcels-award-fill"] : []), ...(showCorridor ? ["corridor-line"] : [])] : []}'
);

content = content.replace(
  'id="parcels-sec11-fill"',
  'id="parcels-sec11-fill"\n              layout={{ visibility: showSec11 ? "visible" : "none" }}'
);

content = content.replace(
  'id="parcels-sec11-line"',
  'id="parcels-sec11-line"\n              layout={{ visibility: showSec11 ? "visible" : "none" }}'
);

content = content.replace(
  'id="parcels-award-fill"',
  'id="parcels-award-fill"\n              layout={{ visibility: showAward ? "visible" : "none" }}'
);

content = content.replace(
  'id="parcels-award-line"',
  'id="parcels-award-line"\n              layout={{ visibility: showAward ? "visible" : "none" }}'
);

content = content.replace(
  'id="corridor-line"',
  'id="corridor-line"\n              layout={{ visibility: showCorridor ? "visible" : "none" }}'
);

// Map Tools Toolbar
const mapTools = `
      <div className="absolute top-4 left-4 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
        <button className="p-2 hover:bg-graticule-teal/10 transition-colors border-b border-graticule-teal/20" title="Layers">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <button className="p-2 hover:bg-graticule-teal/10 transition-colors border-b border-graticule-teal/20" title="Search">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <button className="p-2 hover:bg-graticule-teal/10 transition-colors border-b border-graticule-teal/20" title="Draw/Measure">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button className="p-2 hover:bg-graticule-teal/10 transition-colors" title="Locate">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
      </div>
`;

content = content.replace(
  '<NavigationControl position="top-right" />',
  '<NavigationControl position="top-right" />\n' + mapTools
);

fs.writeFileSync('src/components/Map.tsx', content);
