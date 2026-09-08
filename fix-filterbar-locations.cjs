const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Add states fetching
content = content.replace(
  'const [projects, setProjects] = useState<any[]>([]);',
  `const [projects, setProjects] = useState<any[]>([]);
  const [locations, setLocations] = useState<Record<string, string[]>>({"All States": ["All Districts"]});`
);

content = content.replace(
  'fetch(`/api/projects?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`)',
  `fetch(\`/api/projects?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&stage=\${encodeURIComponent(selectedStage || "All Stages")}&category=\${encodeURIComponent(selectedCategory || "All Categories")}&risk=\${encodeURIComponent(selectedRisk || "All Risks")}\`)`
);

content = content.replace(
  '  const stateDistricts: Record<string, string[]> = {',
  `
  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(data => setLocations(data));
  }, []);
  
  const currentDistricts = locations[selectedState] || ["All Districts"];
  
  // Remove old stateDistricts
  /*`
);

content = content.replace(
  '  const currentDistricts = stateDistricts[selectedState] || ["All Districts"];',
  `  */`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
