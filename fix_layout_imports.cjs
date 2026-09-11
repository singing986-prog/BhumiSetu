const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The script previously added:
// import { Bell, Search, User, Menu, FileText, FileCheck, CheckCircle2, AlertCircle, TrendingUp, ArrowRight, Settings } from "lucide-react";
// But lucide-react was already imported earlier.

// Remove the second lucide-react import
code = code.replace(/import \{ Bell, Search, User, Menu, FileText, FileCheck, CheckCircle2, AlertCircle, TrendingUp, ArrowRight, Settings \} from "lucide-react";\n/, '');

// Remove the second useTranslation if it was duplicated, but looking at my script it just added the whole block.
// Let's just do a clean fix.

code = code.replace(/import \{ Bell, Search, User, Menu, FileText, FileCheck, CheckCircle2, AlertCircle, TrendingUp, ArrowRight, Settings \} from "lucide-react";\s*/, '');
code = code.replace(/import \{ useTranslation \} from "\.\.\/i18n";\s*import \{ useTranslation \} from "\.\.\/i18n";/, 'import { useTranslation } from "../i18n";');

fs.writeFileSync('src/components/Layout.tsx', code);
console.log("Fixed duplicate imports");
