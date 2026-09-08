const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'res.json(mockProposals);',
  `if (state === "All States") {
      res.json(mockProposals);
    } else {
      res.json(mockProposals.map(p => ({
        ...p,
        state: state,
        district: req.query.district !== "All Districts" ? req.query.district : p.district,
        projectName: \`\${state} - \${p.projectName}\`
      })));
    }`
);

fs.writeFileSync('server.ts', content);
