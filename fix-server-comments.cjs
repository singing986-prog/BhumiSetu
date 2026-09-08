const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// I will just use regex to remove the commented blocks or rewrite cleanly.
// Let's rewrite the APIs cleanly.
// Remove everything between `/*` and the next `app.get`
content = content.replace(/\/\*[\s\S]*?app\.get\("\/api\/risk"/, 'app.get("/api/risk"');
content = content.replace(/\/\*[\s\S]*?app\.get\("\/api\/parcels"/, 'app.get("/api/parcels"');
content = content.replace(/\/\/ replace the old one\n  \/\*[\s\S]*?app\.get\("\/api\/parcels"/, 'app.get("/api/parcels"');

fs.writeFileSync('server.ts', content);
