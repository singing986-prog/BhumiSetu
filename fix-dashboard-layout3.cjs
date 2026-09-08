const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-h-[800px]"',
  'className="flex-1 p-6 flex flex-col xl:flex-row gap-6 min-h-0"'
);

// We need the wrapper to scroll or not scroll depending on dashboard.
// Currently: <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
// For dashboard, we want the main to not scroll if possible, or at least flex correctly.
// Let's use `h-full` and `min-h-0`.
content = content.replace(
  '<main className="flex-1 flex flex-col min-w-0 overflow-y-auto">',
  '<main className={`flex-1 flex flex-col min-w-0 ${activeTab === "dashboard" ? "overflow-hidden" : "overflow-y-auto"}`}>'
);

content = content.replace(
  '                <div className="flex-[2] min-h-[500px] lg:min-h-0 flex flex-col shadow-sm">',
  '                <div className="flex-[2] min-h-[400px] xl:min-h-0 flex flex-col shadow-sm relative">'
);

content = content.replace(
  '                <div className="flex-1 min-w-[300px] flex flex-col">',
  '                <div className="flex-1 min-w-[350px] flex flex-col gap-6 overflow-y-auto pr-2">'
);

// WorkflowTracker wrapper
content = content.replace(
  '                  <div className="shadow-sm">',
  '                  <div className="shadow-sm flex-none">'
);

fs.writeFileSync('src/App.tsx', content);
