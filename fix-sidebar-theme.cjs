const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Update Sidebar styling
content = content.replace(
  'className={`bg-white border-r border-graticule-teal/30 flex flex-col transition-all duration-300 z-20 ${isOpen ? "w-64" : "w-16 md:w-20"}`}',
  'className={`bg-registry-ink text-survey-paper flex flex-col transition-all duration-300 z-20 ${isOpen ? "w-64" : "w-16 md:w-20"}`}'
);

// Update Logo background
content = content.replace(
  'className="h-16 border-b border-graticule-teal/30 flex items-center justify-center shrink-0"',
  'className="h-16 border-b border-white/10 flex items-center justify-center shrink-0"'
);

content = content.replace(
  '<div className="h-8 w-8 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-lg rounded-sm">',
  '<div className="h-8 w-8 bg-survey-paper text-registry-ink flex items-center justify-center font-serif font-bold text-lg rounded-sm">'
);

// Update nav items styling
content = content.replace(
  /className=\{\`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors \[\^`\]\*\`\}/g,
  (match) => {
    return 'className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${activeTab === item.id ? "bg-white/10 text-survey-paper border-l-4 border-alluvium-red" : "text-survey-paper/70 hover:bg-white/5 hover:text-survey-paper border-l-4 border-transparent"}`}'
  }
);

// Remove the old hover states that hardcoded colors
content = content.replace(
  '${activeTab === item.id ? "bg-graticule-teal/10 text-registry-ink border-r-4 border-registry-ink" : "text-registry-ink/70 hover:bg-graticule-teal/5 border-r-4 border-transparent"}',
  '${activeTab === item.id ? "bg-white/10 text-survey-paper border-l-4 border-alluvium-red" : "text-survey-paper/70 hover:bg-white/5 hover:text-survey-paper border-l-4 border-transparent"}'
);

// Update bottom profile in sidebar
content = content.replace(
  'className="p-4 border-t border-graticule-teal/30 flex items-center gap-3"',
  'className="p-4 border-t border-white/10 flex items-center gap-3"'
);

content = content.replace(
  '<div className="h-8 w-8 rounded-full bg-graticule-teal/20 flex items-center justify-center text-registry-ink shrink-0">',
  '<div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-survey-paper shrink-0">'
);

content = content.replace(
  '<div className="font-semibold text-registry-ink truncate">Ramesh Kumar</div>',
  '<div className="font-semibold text-survey-paper truncate">Ramesh Kumar</div>'
);
content = content.replace(
  '<div className="text-xs text-registry-ink/70">{t("district.newDelhi")}, NCT</div>',
  '<div className="text-xs text-survey-paper/70">{t("district.newDelhi")}, NCT</div>'
);

fs.writeFileSync('src/components/Layout.tsx', content);
