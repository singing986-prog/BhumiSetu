const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Update FilterBar props to take search
content = content.replace(
  'export function FilterBar({ \n  selectedState, setSelectedState, \n  selectedDistrict, setSelectedDistrict, \n  selectedProject, setSelectedProject \n}: { \n  selectedState: string, setSelectedState: (s: string) => void,\n  selectedDistrict: string, setSelectedDistrict: (d: string) => void,\n  selectedProject: string, setSelectedProject: (p: string) => void\n}) {',
  `export function FilterBar({ 
  selectedState, setSelectedState, 
  selectedDistrict, setSelectedDistrict, 
  selectedProject, setSelectedProject,
  searchQuery, setSearchQuery
}: { 
  selectedState: string, setSelectedState: (s: string) => void,
  selectedDistrict: string, setSelectedDistrict: (d: string) => void,
  selectedProject: string, setSelectedProject: (p: string) => void,
  searchQuery?: string, setSearchQuery?: (q: string) => void
}) {`
);

content = content.replace(
  'const [search, setSearch] = useState("");',
  '// using props for search now'
);

content = content.replace(
  'const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const val = e.target.value;\n    setSearch(val);',
  'const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const val = e.target.value;\n    if(setSearchQuery) setSearchQuery(val);'
);

content = content.replace(
  'setSearch("");',
  'if(setSearchQuery) setSearchQuery("");'
);

content = content.replace(
  'value={search}',
  'value={searchQuery || ""}'
);

content = content.replace(
  'onClick={() => { setSearch(r.name); setSearchResults([]); }}',
  'onClick={() => { if(setSearchQuery) setSearchQuery(r.name); setSearchResults([]); }}'
);

// KPI Ledger - make it transparent and remove borders between items, use thin rule dividers
content = content.replace(
  'className="flex flex-nowrap overflow-x-auto border-b border-graticule-teal/30 bg-white"',
  'className="flex flex-nowrap overflow-x-auto border-y border-graticule-teal/30 bg-survey-paper"'
);

// Remove padding and background from KPI individual items.
content = content.replace(
  /className=\{\`flex-1 min-w-\[160px\] p-4 \$\{\n            i !== metrics.length - 1 \? "border-r border-graticule-teal\/30" : ""\n          \}\`\}/,
  'className={`flex-1 min-w-[160px] p-3 py-4 ${i !== metrics.length - 1 ? "border-r border-graticule-teal" : ""}`}'
);

content = content.replace(
  '{metric.value}',
  '<AnimatedCounter value={metric.value} />'
);

// Add AnimatedCounter component
const counterComp = `function AnimatedCounter({ value }: { value: string | number }) {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  useEffect(() => {
    if (isNaN(numericValue)) return;
    let start = 0;
    const duration = 1000;
    const increment = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue]);

  if (isNaN(numericValue)) return <>{value}</>;
  
  // Format based on magnitude
  let formatted = Math.floor(count).toLocaleString('en-IN');
  return <>{formatted}</>;
}

export function KPILedger`;

content = content.replace('export function KPILedger', counterComp);

fs.writeFileSync('src/components/Dashboard.tsx', content);
