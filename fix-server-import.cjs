const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'import path from "path";',
  'import path from "path";\nimport { WebSocketServer } from "ws";'
);

fs.writeFileSync('server.ts', content);
