const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The notification UI is likely in Layout, but looking at App.tsx:
// It passes profile to Header? We don't have Header. Layout is where the header is.
// Actually let's check Layout.tsx

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const fetchNotif = `
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
     apiFetch('/api/notifications').then(r => r.json()).then(data => {
         if(!data.error) setNotifications(data);
     }).catch(console.error);
  }, []);

  const markRead = (id: string) => {
     apiFetch(\`/api/notifications/\${id}/read\`, { method: "POST" });
     setNotifications(notifications.map(n => n.id === id ? {...n, read: true} : n));
  };
`;

if (!layout.includes('const [notifications')) {
    layout = layout.replace(
       /export function Layout\(\{ children, activeTab, setActiveTab, profile \}: \{ children: React\.ReactNode, activeTab: string, setActiveTab: \(tab: string\) => void, profile: any \}\) \{/,
       "export function Layout({ children, activeTab, setActiveTab, profile }: { children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void, profile: any }) {\n" + fetchNotif
    );
}

// Replace the hardcoded bell
const notifBell = `
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-registry-ink/70 hover:text-registry-ink hover:bg-graticule-teal/10 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-alluvium-red rounded-full"></span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-graticule-teal/30 shadow-lg z-50 rounded-sm">
               <div className="p-3 border-b border-graticule-teal/30 font-medium text-sm">Notifications</div>
               <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                     <div className="p-4 text-center text-sm text-registry-ink/60">No notifications</div>
                  ) : (
                     notifications.map(n => (
                        <div key={n.id} onClick={() => { markRead(n.id); if(setActiveTab) setActiveTab('proposals'); setShowNotif(false); }} className={\`p-3 border-b border-graticule-teal/10 hover:bg-survey-paper/50 cursor-pointer \${!n.read ? 'bg-graticule-teal/5' : ''}\`}>
                           <div className="text-xs font-medium">{n.title}</div>
                           <div className="text-xs text-registry-ink/70">{n.message}</div>
                           <div className="text-[10px] text-registry-ink/50 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                     ))
                  )}
               </div>
            </div>
          )}
        </div>
`;

layout = layout.replace(
  /<button className="relative p-2 text-registry-ink\/70 hover:text-registry-ink hover:bg-graticule-teal\/10 rounded-full transition-colors">[\s\S]*?<\/button>/,
  notifBell
);

fs.writeFileSync('src/components/Layout.tsx', layout);
console.log("Updated Layout with real notifications");
