const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
content = content.replace(
  '{Object.keys(stateDistricts).map(s => <option key={s} value={s}>{s}</option>)}',
  '{Object.keys(locations).map(s => <option key={s} value={s}>{s}</option>)}'
);
fs.writeFileSync('src/components/Dashboard.tsx', content);
