const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace the verification check in the UI
code = code.replace(
  /{previewDoc\?\.checksum \? `Verified \(SHA-256: \$\{previewDoc\.checksum\.substring\(0, 16\)\}\.\.\.\)` : "Demo document — integrity verification unavailable"}/g,
  '{previewDoc?.verificationStatus || (previewDoc?.checksum ? `Verified (SHA-256: ${previewDoc.checksum.substring(0, 16)}...)` : "Demo document — integrity verification unavailable")}'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Updated Dashboard UI for document verification");
