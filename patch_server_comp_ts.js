import fs from 'fs';
let serverContent = fs.readFileSync('server.ts', 'utf-8');

// Replace `const user = req.user;` with `const user = (req as any).user;`
serverContent = serverContent.replace(/const user = req\.user;/g, 'const user = (req as any).user;');
// For req.user in if statements without const
serverContent = serverContent.replace(/if \(req\.user/g, 'if ((req as any).user');

fs.writeFileSync('server.ts', serverContent);
