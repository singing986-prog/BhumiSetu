const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'app.get("/api/parcels", (req, res) => {',
  `app.get("/api/parcels", (req, res) => {
    const state = req.query.state || "All States";
    const dist = req.query.district || "All Districts";
    const isDelhi = state === "Delhi";
    
    // Adjust base coordinates to show different parcel locations based on state selection
    const locationCoordinates = {
      "Delhi": [77.2090, 28.6139],
      "Nuh": [77.018, 28.125],
      "All States": [77.018, 28.125], // Default near Delhi/Nuh for the mock
    };
    
    const baseLng = locationCoordinates[dist] ? locationCoordinates[dist][0] : locationCoordinates[state] ? locationCoordinates[state][0] : 77.018;
    const baseLat = locationCoordinates[dist] ? locationCoordinates[dist][1] : locationCoordinates[state] ? locationCoordinates[state][1] : 28.125;
    `
);

content = content.replace(
  '[77.0100, 28.1100]',
  '[baseLng - 0.008, baseLat - 0.015]'
);
content = content.replace(
  '[77.0150, 28.1250]',
  '[baseLng - 0.003, baseLat]'
);
content = content.replace(
  '[77.0250, 28.1500]',
  '[baseLng + 0.007, baseLat + 0.025]'
);

content = content.replace(
  '[77.0120, 28.1180]',
  '[baseLng - 0.006, baseLat - 0.007]'
);
content = content.replace(
  '[77.0160, 28.1170]',
  '[baseLng - 0.002, baseLat - 0.008]'
);
content = content.replace(
  '[77.0180, 28.1220]',
  '[baseLng, baseLat - 0.003]'
);
content = content.replace(
  '[77.0140, 28.1230]',
  '[baseLng - 0.004, baseLat - 0.002]'
);
content = content.replace(
  '[77.0120, 28.1180]',
  '[baseLng - 0.006, baseLat - 0.007]'
);

content = content.replace(
  '[77.0200, 28.1310]',
  '[baseLng + 0.002, baseLat + 0.006]'
);
content = content.replace(
  '[77.0230, 28.1300]',
  '[baseLng + 0.005, baseLat + 0.005]'
);
content = content.replace(
  '[77.0240, 28.1350]',
  '[baseLng + 0.006, baseLat + 0.010]'
);
content = content.replace(
  '[77.0210, 28.1360]',
  '[baseLng + 0.003, baseLat + 0.011]'
);
content = content.replace(
  '[77.0200, 28.1310]',
  '[baseLng + 0.002, baseLat + 0.006]'
);

fs.writeFileSync('server.ts', content);
