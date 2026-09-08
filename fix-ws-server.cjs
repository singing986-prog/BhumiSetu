const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const wsSetup = `
import { WebSocketServer } from 'ws';

// (later in startServer)
`;

// Insert WebSocket setup inside startServer
const startServerBlock = `  const wss = new WebSocketServer({ noServer: true });
  
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      // broadcast
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(msg.toString());
        }
      });
    });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
`;

content = content.replace(
  '  app.listen(PORT, "0.0.0.0", () => {\n    console.log(`Server running on http://localhost:${PORT}`);\n  });',
  startServerBlock
);
content = content.replace("import path from 'path';", "import path from 'path';\nimport { WebSocketServer } from 'ws';");

fs.writeFileSync('server.ts', content);
