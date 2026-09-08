const fs = require('fs');
const files = ['src/components/Alerts.tsx', 'src/components/Dashboard.tsx', 'src/components/Proposals.tsx'];
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('import React')) {
    content = "import React from 'react';\n" + content;
    fs.writeFileSync(f, content);
  }
}
