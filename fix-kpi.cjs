const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  '          <div className="text-2xl font-serif font-semibold text-registry-ink">\n            {metric.value}\n          </div>',
  `          <div className="text-2xl font-serif font-semibold text-registry-ink flex items-end justify-between">
            {metric.value}
            <span className="text-[10px] font-sans font-normal text-cultivated-green pb-1 hidden lg:block">+{(Math.random() * 5 + 1).toFixed(1)}%</span>
          </div>`
);

content = content.replace(
  'export function PredictiveRisk',
  'export function FilterBar({ selectedState, selectedDistrict }: { selectedState: string, selectedDistrict: string }) {\n  return (\n    <div className="bg-white border-b border-graticule-teal/30 p-2 flex gap-2 items-center text-xs overflow-x-auto whitespace-nowrap">\n      <div className="font-medium text-registry-ink/60 px-2 uppercase tracking-wider text-[10px]">Context</div>\n      <div className="px-3 py-1 bg-survey-paper border border-graticule-teal/20 rounded-sm">India / {selectedState} / {selectedDistrict} / All Projects</div>\n      <div className="w-px h-4 bg-graticule-teal/30 mx-2"></div>\n      <input type="text" placeholder="Search ULPIN or Project..." className="px-3 py-1 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none focus:border-graticule-teal" />\n      <select className="px-3 py-1 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer"><option>All Stages</option><option>Notification</option><option>Award</option></select>\n      <select className="px-3 py-1 bg-survey-paper border border-graticule-teal/20 rounded-sm outline-none cursor-pointer"><option>All Categories</option><option>Highway</option><option>Rail</option></select>\n      <button className="px-3 py-1 text-graticule-teal hover:underline ml-auto">Reset Filters</button>\n    </div>\n  );\n}\n\nexport function PredictiveRisk'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
