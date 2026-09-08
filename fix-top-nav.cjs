const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// We want to add a dropdown for the notifications instead of just redirecting to the tab
content = content.replace(
  '<button \n            onClick={() => setActiveTab && setActiveTab(\'alerts\')}\n            className="relative text-graticule-teal hover:text-registry-ink transition-colors"\n          >',
  `<div className="relative" ref={useRef<HTMLDivElement>(null)}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsAlertsOpen(!isAlertsOpen);
              }}
              className="relative text-graticule-teal hover:text-registry-ink transition-colors outline-none cursor-pointer"
            >`
);

content = content.replace(
  '<span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-alluvium-red rounded-full border-2 border-survey-paper"></span>\n          </button>',
  `<span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-alluvium-red rounded-full border-2 border-survey-paper"></span>
            </button>
            {isAlertsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-graticule-teal/30 rounded-sm shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-graticule-teal/10 bg-survey-paper/50 flex justify-between items-center">
                  <h3 className="font-semibold text-registry-ink text-sm">Notifications</h3>
                  <button className="text-xs text-graticule-teal hover:underline outline-none">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-graticule-teal/10 hover:bg-graticule-teal/5 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-alluvium-red shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-registry-ink">Section 24(2) Lapse Risk</p>
                        <p className="text-xs text-registry-ink/60 mt-0.5 line-clamp-2">Award is 4.8 years old with pending possession for CBIC Node 2.</p>
                        <p className="text-[10px] text-registry-ink/40 mt-1">2 mins ago • Kanchipuram</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-b border-graticule-teal/10 hover:bg-graticule-teal/5 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-tilled-earth shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-registry-ink">SLA Breach Warning</p>
                        <p className="text-xs text-registry-ink/60 mt-0.5 line-clamp-2">Sec 19 Declaration delayed by 45 days beyond SIA clearance for Pune-Nashik Rail.</p>
                        <p className="text-[10px] text-registry-ink/40 mt-1">1 hour ago • Pune</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-graticule-teal/5 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-transparent border border-graticule-teal/40 shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-registry-ink text-registry-ink/70">Approval Pending</p>
                        <p className="text-xs text-registry-ink/50 mt-0.5 line-clamp-2">District LAO submitted compensation award for Nuh Expressway Phase.</p>
                        <p className="text-[10px] text-registry-ink/40 mt-1">Yesterday • Nuh</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-graticule-teal/10 bg-survey-paper/50 text-center">
                  <button onClick={() => { setIsAlertsOpen(false); if (setActiveTab) setActiveTab('alerts'); }} className="text-xs font-medium text-tilled-earth hover:underline outline-none">View All Notifications</button>
                </div>
              </div>
            )}
          </div>`
);

content = content.replace(
  'const [isProfileOpen, setIsProfileOpen] = useState(false);',
  'const [isProfileOpen, setIsProfileOpen] = useState(false);\n  const [isAlertsOpen, setIsAlertsOpen] = useState(false);'
);

fs.writeFileSync('src/components/Layout.tsx', content);
