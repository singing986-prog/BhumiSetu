const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const postPatch = `app.post("/api/parcels", authenticateToken, (req, res) => {
    const { geometry, area, projectId } = req.body;
    const user = req.user;
    
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const proj = db.projects.find(pr => pr.id === projectId);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    if (user.role === "State Nodal Officer" && user.state !== proj.state) return res.status(403).json({ error: "Unauthorized jurisdiction" });
    if (user.role === "District LAO" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
    if (user.role === "Project Implementing Agency") {
      const uObj = demoUsers.find(u => u.id === user.id);
      if (!uObj.assignedProjects.includes(proj.id)) return res.status(403).json({ error: "Unauthorized project" });
    }

    const newParcelId = "PAR-" + (db.parcels.length + 1).toString().padStart(3, '0');
    const newParcel = {
      parcelId: newParcelId,
      projectId: projectId || "PRJ-2026-001",
      ulpin: "Demo-ULPIN-" + (100000 + db.parcels.length).toString(),
      stage: "Notification",
      state: proj.state,
      district: proj.district,
      village: "Draft Village",
      area: area,
      surveyNumber: "Draft",
      landType: "Agricultural",
      owner: "Pending",
      risk: "Low",
      geometry: geometry.coordinates[0]
    };
    
    db.parcels.push(newParcel);
    res.json(newParcel);
  });`;

code = code.replace(/app\.post\("\/api\/parcels"[\s\S]*?res\.json\(newParcel\);\s*\}\);/, postPatch);
fs.writeFileSync('server.ts', code);
console.log('Done');
