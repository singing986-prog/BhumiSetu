const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Ensure the notifications bell accurately reflects the server-side notifications array
// Let's modify the Notifications dropdown logic in Layout.tsx to fetch notifications.

const layoutHeaderCode = `
import { Bell, Search, User, Menu, FileText, FileCheck, CheckCircle2, AlertCircle, TrendingUp, ArrowRight, Settings } from "lucide-react";
import { useTranslation } from "../i18n";
import { useState, useEffect } from "react";
import { apiFetch } from "../api";
`;

if (!code.includes('import { useState, useEffect }')) {
    code = code.replace(/import \{ useTranslation \} from "\.\.\/i18n";/, layoutHeaderCode);
}

fs.writeFileSync('src/components/Layout.tsx', code);
console.log("Updated Layout imports");
