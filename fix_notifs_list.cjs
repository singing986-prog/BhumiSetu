const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');
// Fix notification array, the latest isn't showing proposal. Let's trace why

const notifEndpoint = `
  app.get("/api/notifications", authenticateToken, (req, res) => {
    const user = (req as any).user;
    const notifs = (db.notifications || []).filter(n => n.recipientId === user.id || n.recipientId === 'ALL').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(notifs);
  });
`;

serverCode = serverCode.replace(
  /app\.get\("\/api\/notifications", authenticateToken, \(req, res\) => \{[\s\S]*?res\.json\(notifs\);\s*\}\);/,
  notifEndpoint
);
fs.writeFileSync('server.ts', serverCode);
console.log("Updated notif filtering");
