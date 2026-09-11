import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
  app.get("/api/gis/layers", authenticateToken, (req, res) => {
    const projectId = req.query.projectId;
    // Generate deterministic demo data based on projectId
    const proj = db.projects.find(p => p.id === projectId);
    if(!proj) return res.status(404).json({error: "Project not found"});
    
    const projGeom = typeof proj.footprint === 'string' ? JSON.parse(proj.footprint) : proj.footprint;
    // Basic fallback if project has no footprint
    const baseCoords = projGeom && projGeom.coordinates ? projGeom.coordinates[0][0] : [77.018, 28.125];
    
    // Create plausible offsets based on the base coordinate
    const c0 = baseCoords[0];
    const c1 = baseCoords[1];

    const layers = {
      projectCorridors: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { name: proj.projectName, type: "corridor", projectId: proj.id },
          geometry: projGeom || { type: "Polygon", coordinates: [[[c0-0.01, c1-0.01], [c0+0.01, c1-0.01], [c0+0.01, c1+0.01], [c0-0.01, c1+0.01], [c0-0.01, c1-0.01]]] }
        }]
      },
      ecoSensitiveZones: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { zoneId: "ECO-100", zoneName: "Demo Eco Zone", category: "Protected", restriction: "No Construction", source: "Demo", projectId: proj.id },
          geometry: { type: "Polygon", coordinates: [[[c0+0.015, c1+0.015], [c0+0.025, c1+0.015], [c0+0.025, c1+0.025], [c0+0.015, c1+0.025], [c0+0.015, c1+0.015]]] }
        }]
      },
      villageBoundaries: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { villageId: "VIL-200", villageName: "Demo Village", district: proj.district, state: proj.state, projectId: proj.id, projectCount: 1, parcelCount: 12 },
          geometry: { type: "Polygon", coordinates: [[[c0-0.02, c1-0.02], [c0+0.02, c1-0.02], [c0+0.02, c1+0.02], [c0-0.02, c1+0.02], [c0-0.02, c1-0.02]]] }
        }]
      },
      section11Notification: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { notificationId: "SEC11-300", date: "2024-01-15", stage: "Section 11", projectId: proj.id },
          geometry: { type: "Polygon", coordinates: [[[c0-0.005, c1-0.005], [c0+0.005, c1-0.005], [c0+0.005, c1+0.005], [c0-0.005, c1+0.005], [c0-0.005, c1-0.005]]] }
        }]
      },
      awardPossession: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { awardStatus: "Completed", possessionStatus: "Pending", date: "2024-05-20", projectId: proj.id },
          geometry: { type: "Polygon", coordinates: [[[c0-0.002, c1-0.002], [c0+0.002, c1-0.002], [c0+0.002, c1+0.002], [c0-0.002, c1+0.002], [c0-0.002, c1-0.002]]] }
        }]
      },
      proposedAlignment: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { name: "Proposed Alignment", type: "alignment", projectId: proj.id },
          geometry: { type: "LineString", coordinates: [[c0-0.01, c1], [c0, c1], [c0+0.01, c1]] }
        }]
      }
    };
    res.json(layers);
  });
`;

code = code.replace(/app\.get\("\/api\/gis\/layers", authenticateToken, \(req, res\) => \{[\s\S]*?res\.json\(layers\);\n  \}\);/, replacement.trim());
fs.writeFileSync('server.ts', code);
console.log("Patched GIS layers mock data in server.ts");
