const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Convert notifications to state
content = content.replace(
  'const [isAlertsOpen, setIsAlertsOpen] = useState(false);',
  `const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Section 24(2) Lapse Risk", msg: "Award is 4.8 years old with pending possession for CBIC Node 2.", time: "2 mins ago", loc: "Kanchipuram", read: false, severity: "high" },
    { id: 2, title: "Declaration Deadline", msg: "Section 19 Declaration pending for 14 parcels.", time: "1 hour ago", loc: "Rohtak", read: false, severity: "medium" },
    { id: 3, title: "Fund Disbursement", msg: "₹14.2 Cr disbursed to 45 beneficiaries.", time: "3 hours ago", loc: "Pune", read: true, severity: "low" }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;`
);

content = content.replace(
  '<span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-alluvium-red rounded-full border-2 border-survey-paper"></span>',
  `{unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-alluvium-red text-white flex items-center justify-center text-[9px] font-bold rounded-full border-2 border-survey-paper">{unreadCount}</span>}`
);

const notificationsOld = /<div className="max-h-80 overflow-y-auto">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const notificationsNew = `<div className="max-h-80 overflow-y-auto">
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
              </div>
            )}
`;

content = content.replace(
  '<button className="text-xs text-graticule-teal hover:underline outline-none">Mark all as read</button>',
  '<button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-xs text-graticule-teal hover:underline outline-none font-medium">Mark all as read</button>'
);

content = content.replace(notificationsOld, notificationsNew);

fs.writeFileSync('src/components/Layout.tsx', content);
