const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The alerts block starts with `{isAlertsOpen && (` and ends just before `          <div className="relative" ref={dropdownRef}>`
const alertsOld = /\{isAlertsOpen && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<div className="relative" ref=\{dropdownRef\}>/;

const alertsNew = `{isAlertsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-graticule-teal/30 rounded-sm shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-graticule-teal/10 bg-survey-paper/50 flex justify-between items-center">
                  <h3 className="font-semibold text-registry-ink text-sm">Notifications</h3>
                  <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-xs text-graticule-teal hover:underline outline-none font-medium">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-registry-ink/50 text-sm">No new notifications.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => setNotifications(notifications.map(x => x.id === n.id ? {...x, read: true} : x))} className={\`p-3 border-b border-graticule-teal/10 hover:bg-graticule-teal/5 transition-colors cursor-pointer group \${!n.read ? 'bg-survey-paper/30' : ''}\`}>
                      <div className="flex gap-3">
                        <div className={\`mt-1.5 w-2 h-2 rounded-full shrink-0 \${n.severity === 'high' ? 'bg-alluvium-red' : n.severity === 'medium' ? 'bg-tilled-earth' : 'bg-cultivated-green'}\`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <p className={\`text-sm text-registry-ink \${!n.read ? 'font-semibold' : 'font-medium'}\`}>{n.title}</p>
                             {!n.read && <span className="w-1.5 h-1.5 bg-graticule-teal rounded-full mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-registry-ink/70 mt-0.5 leading-snug line-clamp-2">{n.msg}</p>
                          <p className="text-[10px] text-registry-ink/50 mt-1.5 font-medium">{n.time} • {n.loc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-graticule-teal/10 bg-survey-paper/50 text-center">
                  <button onClick={() => { setIsAlertsOpen(false); if (setActiveTab) setActiveTab('alerts'); }} className="text-xs font-medium text-tilled-earth hover:underline outline-none">View All Notifications</button>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>`;

content = content.replace(alertsOld, alertsNew);

fs.writeFileSync('src/components/Layout.tsx', content);
