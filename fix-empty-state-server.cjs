const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Modify the parcel api to return empty feature collection if a state with no data is selected
content = content.replace(
  'const baseLat = locationCoordinates[String(dist)] ? locationCoordinates[String(dist)][1] : locationCoordinates[String(state)] ? locationCoordinates[String(state)][1] : 28.125;',
  `const baseLat = locationCoordinates[String(dist)] ? locationCoordinates[String(dist)][1] : locationCoordinates[String(state)] ? locationCoordinates[String(state)][1] : 28.125;
    
    // Simulate empty state for a particular district like 'Mumbai'
    if (dist === "Mumbai") {
       return res.json({ type: "FeatureCollection", features: [] });
    }`
);

fs.writeFileSync('server.ts', content);
