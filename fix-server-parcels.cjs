const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Rewrite /api/parcels
content = content.replace(
  /app\.get\("\/api\/parcels", \([\s\S]*?\}\);/,
  `app.get("/api/parcels", (req, res) => {
    const projs = filterProjects(req.query);
    const validStates = projs.map(p => p.state);
    
    // Minimal mock parcels mapping to states
    const parcels = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[77.017, 28.124], [77.019, 28.124], [77.019, 28.126], [77.017, 28.126], [77.017, 28.124]]] },
          properties: { ulpin: "06122344556677", project: "Delhi-Mumbai Expressway (Phase 4)", status: "Notification", state: "Haryana", district: "Nuh", village: "Khedki", area: 1.2, khasra: "45/2", landType: "Agricultural", owner: "Private" }
        },
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[77.020, 28.120], [77.022, 28.120], [77.022, 28.122], [77.020, 28.122], [77.020, 28.120]]] },
          properties: { ulpin: "06122344556678", project: "Delhi-Mumbai Expressway (Phase 4)", status: "Award", state: "Haryana", district: "Nuh", village: "Khedki", area: 2.1, khasra: "46/1", landType: "Commercial", owner: "Private" }
        },
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[73.856, 18.520], [73.858, 18.520], [73.858, 18.522], [73.856, 18.522], [73.856, 18.520]]] },
          properties: { ulpin: "27122344556677", project: "Pune-Nashik Semi High-Speed Rail", status: "Declaration", state: "Maharashtra", district: "Pune", village: "Shivajinagar", area: 0.5, khasra: "12/A", landType: "Residential", owner: "Private" }
        }
      ]
    };
    
    // Filter by matching state/district/project via properties.project or properties.state
    const projNames = projs.map(p => p.projectName);
    const filteredFeatures = parcels.features.filter(f => projNames.includes(f.properties.project));
    
    res.json({ type: "FeatureCollection", features: filteredFeatures });
  });`
);

fs.writeFileSync('server.ts', content);
