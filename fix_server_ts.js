import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Fix createNotification in proposal updates
content = content.replace(/createNotification\(user, actionId \|\| action \|\| "UPDATE", "Proposal Updated", remarks \|\| `Proposal \$\{proposal \? proposal\.id : newId\} updated to \$\{status \|\| proposal\.status\}`, proposal \? proposal\.id : newId\);/g, 
  'createNotification(user, (typeof actionId !== "undefined" ? actionId : (typeof action !== "undefined" ? action : "UPDATE")), "Proposal Updated", (typeof remarks !== "undefined" ? remarks : `Proposal updated`), proposal ? proposal.id : "");');

// Fix req.user on line 1539
content = content.replace(/req\.user\.role/g, '(req as any).user.role');
content = content.replace(/req\.user\.username/g, '(req as any).user.username');

fs.writeFileSync('server.ts', content);
