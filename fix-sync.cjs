const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const [autoSync, setAutoSync] = useState(true);',
  `const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState("Live");
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));

  useEffect(() => {
    if (!autoSync) {
      setSyncStatus("Offline");
      return;
    }
    const interval = setInterval(() => {
      setSyncStatus("Syncing...");
      setTimeout(() => {
        setSyncStatus("Live");
        setLastSync(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
      }, 800);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoSync]);`
);

content = content.replace(
  '{autoSync ? t("dashboard.autoSyncActive") : t("dashboard.autoSyncPaused")}',
  `{syncStatus === "Live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cultivated-green mr-1.5 mb-0.5 animate-pulse"></span>}
   {syncStatus === "Offline" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-registry-ink/40 mr-1.5 mb-0.5"></span>}
   {syncStatus === "Syncing..." && <span className="inline-block w-1.5 h-1.5 rounded-full bg-graticule-teal mr-1.5 mb-0.5 animate-ping"></span>}
   {syncStatus} <span className="text-[10px] font-normal opacity-70 ml-1">({lastSync})</span>`
);

fs.writeFileSync('src/App.tsx', content);
