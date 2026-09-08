const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  'const [syncState, setSyncState] = useState<"Live" | "Syncing" | "Offline">("Live");',
  `const [syncState, setSyncState] = useState<"Live" | "Syncing" | "Offline">("Connecting");
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: any;
    
    const connect = () => {
      setSyncState("Connecting");
      ws = new WebSocket(window.location.protocol === 'https:' ? 'wss://' + window.location.host : 'ws://' + window.location.host);
      ws.onopen = () => {
        setSyncState("Syncing");
        setTimeout(() => setSyncState("Live"), 800);
      };
      ws.onclose = () => {
        setSyncState("Offline");
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        setSyncState("Offline");
      };
    };
    
    connect();
    
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);`
);

content = content.replace(
  '{syncState === "Live" ? <span className="w-2 h-2 rounded-full bg-cultivated-green animate-pulse"></span> : <span className="w-2 h-2 rounded-full bg-alluvium-red"></span>}',
  '{syncState === "Live" ? <span className="w-2 h-2 rounded-full bg-cultivated-green animate-pulse"></span> : syncState === "Syncing" || syncState === "Connecting" ? <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse"></span> : <span className="w-2 h-2 rounded-full bg-alluvium-red"></span>}'
);

fs.writeFileSync('src/components/Layout.tsx', content);
