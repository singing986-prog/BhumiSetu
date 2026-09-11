const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(user.role === "District LAO" && \(user.state !== proj.state \|\| user.district !== proj.district\)\) return res.status\(403\).json\(\{ error: "Unauthorized jurisdiction" \}\);/,
  `if (user.role === "District LAO" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });
    if (user.role === "Field Surveyor" && (user.state !== proj.state || user.district !== proj.district)) return res.status(403).json({ error: "Unauthorized jurisdiction" });`
);

fs.writeFileSync('server.ts', code);
console.log('Patched surveyor POST');
