import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const searchEndpoint = `
  app.get("/api/gis/search", authenticateToken, (req, res) => {
    const q = (req.query.q as string || "").toLowerCase();
    if (!q) return res.json([]);
    
    const results: any[] = [];
    
    // Search Projects
    db.projects.forEach(p => {
      if (p.projectName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.state.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)) {
        results.push({ type: 'project', id: p.id, title: p.projectName, subtitle: \`\${p.district}, \${p.state}\` });
      }
    });
    
    // Search Parcels
    db.parcels.forEach(p => {
      const props = p.properties || {};
      if (
        (props.ulpin && props.ulpin.toLowerCase().includes(q)) ||
        (props.parcelId && props.parcelId.toLowerCase().includes(q)) ||
        (props.surveyNumber && props.surveyNumber.toLowerCase().includes(q)) ||
        (props.village && props.village.toLowerCase().includes(q)) ||
        (props.district && props.district.toLowerCase().includes(q))
      ) {
        results.push({ 
           type: 'parcel', 
           id: props.parcelId || props.ulpin, 
           title: props.ulpin || props.parcelId, 
           subtitle: \`\${props.village || ''} \${props.surveyNumber ? 'Survey: '+props.surveyNumber : ''}\`,
           feature: p
        });
      }
    });
    
    res.json(results.slice(0, 20));
  });
`;

if (!code.includes('/api/gis/search')) {
  code = code.replace('app.get("/api/gis/layers"', searchEndpoint + '\n  app.get("/api/gis/layers"');
  fs.writeFileSync('server.ts', code);
  console.log("Added /api/gis/search endpoint");
}
