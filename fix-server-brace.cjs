const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The file ends with:
//   });
// startServer();
// }
// Or something like that. Let's just fix it by replacing the last few lines.

content = content.replace(/startServer\(\);\s*\}/, '}\nstartServer();');

fs.writeFileSync('server.ts', content);
