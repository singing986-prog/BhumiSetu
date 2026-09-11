const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

if (!code.includes('const [resendTimer, setResendTimer]')) {
    code = code.replace(
      'const [mode, setMode] = useState<"login" | "forgot_password" | "reset_password">("login");',
      `const [mode, setMode] = useState<"login" | "forgot_password" | "reset_password">("login");
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);`
    );
    fs.writeFileSync('src/components/Login.tsx', code);
}
