import fs from 'fs';

// 1. Fix src/components/RnR.tsx
let rnr = fs.readFileSync('src/components/RnR.tsx', 'utf-8');
rnr = rnr.replace(/import \{ useTranslation \} from "react-i18next";/, '');
rnr = rnr.replace(/const \{ t \} = useTranslation\(\);/, 'const t = (k: string, def: string) => def;');
rnr = rnr.replace(/import \{ RnRRecord, AuditEvent, DocumentRecord \} from "\.\.\/types";/, 'import { RnRRecord, DocumentRecord } from "../types";\ntype AuditEvent = any;');

// Also add selectedStage, selectedCategory, selectedRisk to props so App.tsx is happy.
rnr = rnr.replace(/profile\?: any,/, 'profile?: any,\n  selectedStage?: string,\n  selectedCategory?: string,\n  selectedRisk?: string,');

fs.writeFileSync('src/components/RnR.tsx', rnr);

