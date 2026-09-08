const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoints = ["/api/proposals", "/api/compensation", "/api/rnr", "/api/documents", "/api/awards", "/api/reports", "/api/grievances"];

for (const ep of endpoints) {
  content = content.replace(
    'app.get("' + ep + '", (req, res) => {',
    'app.get("' + ep + '", (req, res) => {\n      const state = req.query.state || "All States";\n      const isDelhi = state === "Delhi";'
  );
}

content = content.replace(
  'projectName: "Delhi-Mumbai Expressway"',
  'projectName: (isDelhi ? "Delhi Metro Link" : "Delhi-Mumbai Expressway")'
);

content = content.replace(
  'projectName: "Pune-Nashik Semi High-Speed Rail"',
  'projectName: (isDelhi ? "Delhi-Meerut RRTS" : "Pune-Nashik Semi High-Speed Rail")'
);

content = content.replace(
  'projectName: "Chennai-Bengaluru Industrial Corridor"',
  'projectName: (isDelhi ? "Dwarka Expressway" : "Chennai-Bengaluru Industrial Corridor")'
);

content = content.replace(
  'title: "Gazette_Sec11_3(A)_Nuh_Signed.pdf"',
  'title: (isDelhi ? "Gazette_Sec11_Delhi_Signed.pdf" : "Gazette_Sec11_3(A)_Nuh_Signed.pdf")'
);

fs.writeFileSync('server.ts', content);
