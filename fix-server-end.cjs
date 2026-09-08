const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The end of the file looks like this:
const correctEnd = `
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const wss = new WebSocketServer({ noServer: true });
  
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(msg.toString());
        }
      });
    });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on port \${PORT}\`);
  });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
}

startServer();
`;

const startIndex = content.indexOf('  if (process.env.NODE_ENV !== "production") {');
if (startIndex > -1) {
  content = content.slice(0, startIndex) + correctEnd;
  fs.writeFileSync('server.ts', content);
}
