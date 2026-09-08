const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const searchRegex = /app\.get\("\/api\/search", \([\s\S]*?\}\);/;
const searchImpl = `
  app.get("/api/search", (req, res) => {
    const q = req.query.q ? String(req.query.q).toLowerCase() : "";
    if (!q) return res.json([]);
    
    const results = [];
    
    // search projects
    mockProposals.forEach(p => {
      if (p.projectName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)) {
        results.push({ type: "Project", id: p.id, name: p.projectName, detail: p.state + " • " + p.district });
      }
    });

    // We do not have full parcels mock array outside, but we can return some ULPINs
    const mockUlpins = [
      { ulpin: "06122344556677", project: "Delhi-Mumbai Expressway (Phase 4)", name: "Gram Panchayat, Khedki", detail: "Haryana • Nuh" },
      { ulpin: "06122344556678", project: "Delhi-Mumbai Expressway (Phase 4)", name: "Commercial Plot", detail: "Haryana • Nuh" },
      { ulpin: "27122344556677", project: "Pune-Nashik Semi High-Speed Rail", name: "Smt. Kavita Patil", detail: "Maharashtra • Pune" }
    ];
    
    mockUlpins.forEach(u => {
       if (u.ulpin.includes(q) || u.name.toLowerCase().includes(q)) {
          results.push({ type: "Parcel", id: u.ulpin, name: u.name, detail: u.detail });
       }
    });
    
    res.json(results);
  });
`;

content = content.replace(searchRegex, searchImpl.trim());
fs.writeFileSync('server.ts', content);
