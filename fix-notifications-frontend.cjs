const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  'const [notifications, setNotifications] = useState([',
  `const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(data => setNotifications(data));
  }, []);
  /*`
);

content = content.replace(
  '  ]);\n  const unreadCount',
  '  */\n  const unreadCount'
);

content = content.replace(
  'onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}',
  `onClick={() => fetch('/api/notifications/read', {method: 'POST'}).then(r => r.json()).then(data => setNotifications(data))}`
);

fs.writeFileSync('src/components/Layout.tsx', content);
