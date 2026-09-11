import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Replace createNotification lines to avoid undeclared variable errors
content = content.replace(/createNotification\(user, \(typeof actionId.*?proposal \? proposal\.id : ""\);/g, 
  'createNotification(user, "UPDATE", "Proposal Updated", "Proposal updated", proposal ? proposal.id : "");');

fs.writeFileSync('server.ts', content);
