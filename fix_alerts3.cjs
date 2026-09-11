const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const notifEndpoint = `
  app.get("/api/notifications", authenticateToken, (req, res) => {
    const user = (req as any).user;
    const notifs = (db.notifications || []).filter(n => n.recipientId === user.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(notifs);
  });
  
  app.post("/api/notifications/:id/read", authenticateToken, (req, res) => {
    const user = (req as any).user;
    const n = (db.notifications || []).find(n => n.id === req.params.id && n.recipientId === user.id);
    if(n) n.read = true;
    res.json({ success: true });
  });
`;

if (!serverCode.includes('/api/notifications')) {
    serverCode = serverCode.replace(
      /app\.get\("\/api\/compensation"/,
      notifEndpoint + '\n  app.get("/api/compensation"'
    );
    fs.writeFileSync('server.ts', serverCode);
    console.log("Added /api/notifications");
}
