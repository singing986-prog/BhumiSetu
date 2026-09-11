import fs from 'fs';

// 1. Fix src/types.ts
let types = fs.readFileSync('src/types.ts', 'utf-8');
const oldRnRRecord = `export interface RnRRecord {
  id: string;
  ulpin: string;
  familyHead: string;
  category: 'Owner' | 'Tenant' | 'Agricultural Labourer';
  displacementStatus: 'Displaced' | 'Affected Not Displaced';
  entitlements: {
    housing: boolean;
    employment: boolean;
    annuity: boolean;
  };
  overallStatus: 'Pending' | 'In Progress' | 'Settled';
}`;
const newRnRRecord = `export interface RnRRecord {
  id: string;
  projectId: string;
  parcelId: string;
  familyHead: string;
  members: number;
  category: string;
  housingStatus: string;
  livelihoodStatus: string;
  allowancePaid: number;
  status: string;
}`;
types = types.replace(oldRnRRecord, newRnRRecord);
fs.writeFileSync('src/types.ts', types);

// 2. Fix src/components/RnR.tsx
let rnr = fs.readFileSync('src/components/RnR.tsx', 'utf-8');
rnr = rnr.replace(/<th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">ULPIN<\/th>/, '<th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Parcel ID</th>');
rnr = rnr.replace(/<th className="px-6 py-4">Displacement<\/th>/, '<th className="px-6 py-4">Members</th>');
rnr = rnr.replace(/<th className="px-6 py-4">Entitlements<\/th>/, '<th className="px-6 py-4">Livelihood & Housing</th>');

rnr = rnr.replace(/<td className="px-6 py-4 font-mono text-xs text-registry-ink\/80">\{record\.ulpin\}<\/td>/, '<td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.parcelId}</td>');
rnr = rnr.replace(/record\.displacementStatus/g, 'record.category');
rnr = rnr.replace(/<td className="px-6 py-4">\s*<span className=\{`px-2 py-1 text-xs font-medium rounded-sm border \$\{\s*record\.category === 'Displaced'\s*\? 'bg-alluvium-red\/10 text-alluvium-red border-alluvium-red\/30'\s*: 'bg-survey-paper text-registry-ink border-graticule-teal\/30'\s*\}`\}>\s*\{record\.category\}\s*<\/span>\s*<\/td>/, '<td className="px-6 py-4">{record.members}</td>');

rnr = rnr.replace(/<div className="flex gap-2">\s*\{record\.entitlements\.housing && <span.*?>Housing<\/span>\}\s*\{record\.entitlements\.employment && <span.*?>Employment<\/span>\}\s*\{record\.entitlements\.annuity && <span.*?>Annuity<\/span>\}\s*<\/div>/, '<div className="flex flex-col gap-1"><span className="text-xs text-registry-ink/80">Livelihood: {record.livelihoodStatus}</span><span className="text-xs text-registry-ink/80">Housing: {record.housingStatus}</span><span className="text-xs font-mono">Allowance: ₹{record.allowancePaid.toLocaleString(\'en-IN\')}</span></div>');

rnr = rnr.replace(/record\.overallStatus/g, 'record.status');

fs.writeFileSync('src/components/RnR.tsx', rnr);
