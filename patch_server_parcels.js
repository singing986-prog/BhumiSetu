import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('import * as turf')) {
  code = code.replace('import path from "path";', 'import path from "path";\nimport * as turf from "@turf/turf";');
}

let nextUlpin = 200000;
const patchCode = `
  app.put("/api/parcels/:parcelId", authenticateToken, (req, res) => {
    const { geometry, area, projectId } = req.body;
    const { parcelId } = req.params;
    const user = req.user;
    
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const parcelIndex = db.parcels.findIndex(p => p.parcelId === parcelId);
    if (parcelIndex === -1) return res.status(404).json({ error: "Parcel not found" });
    
    const parcel = db.parcels[parcelIndex];
    const projId = projectId || parcel.projectId;
    const proj = db.projects.find(pr => pr.id === projId);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    if (user.role === "State Nodal Officer" && user.state !== proj.state) return res.status(403).json({ error: "Unauthorized jurisdiction" });
    if (user.role === "District LAO" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
    if (user.role === "Field Surveyor" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
    if (user.role === "Project Implementing Agency") {
      const uObj = demoUsers.find(u => u.id === user.id);
      if (!uObj.assignedProjects.includes(proj.id)) return res.status(403).json({ error: "Unauthorized project" });
    }

    // Server-side validation
    let finalArea = area;
    if (geometry && geometry.type === 'Polygon') {
      finalArea = (turf.area(geometry as any) / 10000).toFixed(2) + ' ha';
    }

    db.parcels[parcelIndex] = {
      ...parcel,
      projectId: projId,
      geometry: geometry ? geometry.coordinates[0] : parcel.geometry,
      area: finalArea || parcel.area
    };

    // Audit event
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.push({ timestamp: new Date().toISOString(), user: user.name, role: user.role, action: "PARCEL_UPDATED", details: "Parcel " + parcelId + " updated" });

    res.json(db.parcels[parcelIndex]);
  });

  app.delete("/api/parcels/:parcelId", authenticateToken, (req, res) => {
    const { parcelId } = req.params;
    const user = req.user;
    
    if (user.role === "Auditor" || user.role === "Affected Citizen") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const parcelIndex = db.parcels.findIndex(p => p.parcelId === parcelId);
    if (parcelIndex === -1) return res.status(404).json({ error: "Parcel not found" });
    
    const parcel = db.parcels[parcelIndex];
    const proj = db.projects.find(pr => pr.id === parcel.projectId);
    
    if (proj) {
      if (user.role === "State Nodal Officer" && user.state !== proj.state) return res.status(403).json({ error: "Unauthorized jurisdiction" });
      if (user.role === "District LAO" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
      if (user.role === "Field Surveyor" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
      if (user.role === "Project Implementing Agency") {
        const uObj = demoUsers.find(u => u.id === user.id);
        if (!uObj.assignedProjects.includes(proj.id)) return res.status(403).json({ error: "Unauthorized project" });
      }
    }

    db.parcels.splice(parcelIndex, 1);

    // Audit event
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.push({ timestamp: new Date().toISOString(), user: user.name, role: user.role, action: "PARCEL_ARCHIVED", details: "Parcel " + parcelId + " archived" });

    res.json({ success: true });
  });
`;

if (!code.includes('app.put("/api/parcels/:parcelId"')) {
  code = code.replace(/app\.post\("\/api\/parcels", authenticateToken, \(req, res\) => \{[\s\S]*?\n  \}\);\n/, (match) => {
    // Add server side area calculation to POST as well
    let replaced = match.replace(/const newParcelId = "PAR-" \+ \(db\.parcels\.length \+ 1\)\.toString\(\)\.padStart\(3, '0'\);/, 
      `const newParcelId = "PAR-" + (Date.now() % 1000000).toString().padStart(6, '0');`
    ).replace(/ulpin: "Demo-ULPIN-" \+ \(100000 \+ db\.parcels\.length\)\.toString\(\),/,
      `ulpin: "Demo-ULPIN-" + (Date.now() % 1000000).toString(),`
    );
    
    let areaInject = `
    let finalArea = area;
    if (geometry && geometry.type === 'Polygon') {
      finalArea = (turf.area(geometry as any) / 10000).toFixed(2) + ' ha';
    }
    `;
    replaced = replaced.replace('const newParcelId =', areaInject + 'const newParcelId =').replace('area: area', 'area: finalArea');
    
    let auditInject = `
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.push({ timestamp: new Date().toISOString(), user: user.name, role: user.role, action: "PARCEL_CREATED", details: "Parcel " + newParcelId + " created" });
    `;
    replaced = replaced.replace('res.json(newParcel);', auditInject + 'res.json(newParcel);');

    return replaced + patchCode;
  });
  
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with PUT and DELETE endpoints");
} else {
  console.log("Endpoints already exist");
}
