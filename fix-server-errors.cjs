const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const q = req.query.q ? req.query.q.toLowerCase() : "";',
  'const q = req.query.q ? String(req.query.q).toLowerCase() : "";'
);

content = content.replace(
  'const baseLng = locationCoordinates[dist] ? locationCoordinates[dist][0] : locationCoordinates[state] ? locationCoordinates[state][0] : 77.018;',
  'const baseLng = locationCoordinates[String(dist)] ? locationCoordinates[String(dist)][0] : locationCoordinates[String(state)] ? locationCoordinates[String(state)][0] : 77.018;'
);

content = content.replace(
  'const baseLat = locationCoordinates[dist] ? locationCoordinates[dist][1] : locationCoordinates[state] ? locationCoordinates[state][1] : 28.125;',
  'const baseLat = locationCoordinates[String(dist)] ? locationCoordinates[String(dist)][1] : locationCoordinates[String(state)] ? locationCoordinates[String(state)][1] : 28.125;'
);

fs.writeFileSync('server.ts', content);
