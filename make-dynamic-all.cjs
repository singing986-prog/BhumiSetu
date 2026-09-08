const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const endpoints = ["compensation", "rnr", "documents", "awards", "reports", "grievances"];

for (const ep of endpoints) {
  const regex = new RegExp(`app\\.get\\("/api/${ep}", \\(req, res\\) => \\{\\n      const state = req\\.query\\.state \\|\\| "All States";\\n      const isDelhi = state === "Delhi";\\n    res\\.json\\(\\[([\\s\\S]*?)\\]\\);`);
  
  content = content.replace(regex, (match, arrInner) => {
    return `app.get("/api/${ep}", (req, res) => {
      const state = req.query.state || "All States";
      const data = [${arrInner}];
      if (state === "All States") {
        res.json(data);
      } else {
        res.json(data.map(item => {
           const newItem = { ...item };
           if (newItem.projectName) newItem.projectName = \`\${state} - \${newItem.projectName}\`;
           if (newItem.title) newItem.title = \`\${state}_\${newItem.title}\`;
           return newItem;
        }));
      }
    `;
  });
}

// Wait, the regex might be a bit risky. Let's just do a simpler replace.
