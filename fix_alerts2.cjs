const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need an API endpoint for notifications
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
      /app\.get\("\/api\/alerts"[\s\S]*?\}\);/,
      notifEndpoint + '\n  app.get("/api/alerts", authenticateToken, (req, res) => {'
    );
    fs.writeFileSync('server.ts', serverCode);
    console.log("Added /api/notifications");
}
