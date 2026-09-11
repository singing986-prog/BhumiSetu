const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const gisEndpoints = `
  // --- GIS Additional APIs ---
  app.patch("/api/parcels/:id", authenticateToken, (req, res) => {
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const idx = db.parcels.findIndex(p => p.parcelId === req.params.id || p.ulpin === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Parcel not found" });
    const p = db.parcels[idx];
    
    // Auth check based on project jurisdiction
    const proj = db.projects.find(pr => pr.id === p.projectId);
    if (proj) {
       if (user.role === "State Nodal Officer" && user.state !== proj.state) return res.status(403).json({ error: "Unauthorized jurisdiction" });
       if (user.role === "District LAO" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
       if (user.role === "Project Implementing Agency") {
         const uObj = demoUsers.find(u => u.id === user.id);
         if (!uObj.assignedProjects.includes(proj.id)) return res.status(403).json({ error: "Unauthorized project" });
       }
    }

    if (req.body.geometry) {
      // Expecting valid geojson geometry
      p.geometry = req.body.geometry.coordinates[0];
    }
    if (req.body.area) p.area = req.body.area;
    
    res.json({ success: true, parcel: p });
  });

  app.delete("/api/parcels/:id", authenticateToken, (req, res) => {
    const user = req.user;
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const idx = db.parcels.findIndex(p => p.parcelId === req.params.id || p.ulpin === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Parcel not found" });
    const p = db.parcels[idx];
    
    const proj = db.projects.find(pr => pr.id === p.projectId);
    if (proj) {
       if (user.role === "State Nodal Officer" && user.state !== proj.state) return res.status(403).json({ error: "Unauthorized jurisdiction" });
       if (user.role === "District LAO" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
       if (user.role === "Project Implementing Agency") {
         const uObj = demoUsers.find(u => u.id === user.id);
         if (!uObj.assignedProjects.includes(proj.id)) return res.status(403).json({ error: "Unauthorized project" });
       }
    }
    db.parcels.splice(idx, 1);
    res.json({ success: true });
  });
  
  app.get("/api/gis/layers", authenticateToken, (req, res) => {
    const projectId = req.query.projectId;
    // Generate deterministic demo data based on projectId
    const proj = db.projects.find(p => p.id === projectId);
    if(!proj) return res.status(404).json({error: "Project not found"});
    
    const projGeom = typeof proj.footprint === 'string' ? JSON.parse(proj.footprint) : proj.footprint;
    // Basic fallback if project has no footprint
    const baseCoords = projGeom && projGeom.coordinates ? projGeom.coordinates[0][0] : [77.018, 28.125];
    
    const layers = {
      projectCorridors: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { name: proj.projectName, type: "corridor" },
          geometry: projGeom || { type: "Polygon", coordinates: [[[baseCoords[0]-0.01, baseCoords[1]-0.01], [baseCoords[0]+0.01, baseCoords[1]-0.01], [baseCoords[0]+0.01, baseCoords[1]+0.01], [baseCoords[0]-0.01, baseCoords[1]+0.01], [baseCoords[0]-0.01, baseCoords[1]-0.01]]] }
        }]
      },
      ecoSensitiveZones: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { name: "Demo Eco-Sensitive Zone", category: "Protected Forest", restriction: "No clear-felling" },
          geometry: { type: "Polygon", coordinates: [[[baseCoords[0]+0.02, baseCoords[1]+0.02], [baseCoords[0]+0.04, baseCoords[1]+0.02], [baseCoords[0]+0.04, baseCoords[1]+0.04], [baseCoords[0]+0.02, baseCoords[1]+0.04], [baseCoords[0]+0.02, baseCoords[1]+0.02]]] }
        }]
      },
      villageBoundaries: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { village: "Demo Village", district: proj.district, state: proj.state },
          geometry: { type: "Polygon", coordinates: [[[baseCoords[0]-0.05, baseCoords[1]-0.05], [baseCoords[0]+0.05, baseCoords[1]-0.05], [baseCoords[0]+0.05, baseCoords[1]+0.05], [baseCoords[0]-0.05, baseCoords[1]+0.05], [baseCoords[0]-0.05, baseCoords[1]-0.05]]] }
        }]
      }
    };
    res.json(layers);
  });
`;

code = code.replace(/app\.get\("\/api\/parcels"/, gisEndpoints + '\n  app.get("/api/parcels"');
fs.writeFileSync('server.ts', code);
console.log('Done');
