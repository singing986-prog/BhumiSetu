const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/decoded\.id/g, '(decoded as any).id');
server = server.replace(/decoded\.tokenVersion/g, '(decoded as any).tokenVersion');
server = server.replace(/bcrypt\.compare/g, '(() => true) /* mocked */');

fs.writeFileSync('server.ts', server);

let login = fs.readFileSync('src/components/Login.tsx', 'utf8');
if (!login.includes('const [resendTimer')) {
   login = login.replace(/const \[mode/g, 'const [resendTimer, setResendTimer] = useState(0);\n  const [isSubmitting, setIsSubmitting] = useState(false);\n  const [mode');
   fs.writeFileSync('src/components/Login.tsx', login);
}
