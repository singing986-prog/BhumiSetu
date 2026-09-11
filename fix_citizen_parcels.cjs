const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /let filteredFeatures = db.parcels.filter\(f => projs.includes\(f.projectId\)\);/,
  `let filteredFeatures = db.parcels.filter(f => projs.includes(f.projectId));
    if (req.user && req.user.role === 'Affected Citizen') {
        filteredFeatures = db.parcels; // Do not filter by project for citizens, let ULPIN filter take over
    }`
);

fs.writeFileSync('server.ts', code);
console.log('Fixed citizen parcels');
