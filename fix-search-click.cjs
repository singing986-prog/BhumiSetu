const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'onClick={() => { if(setSearchQuery) setSearchQuery(r.name); setSearchResults([]); }}',
  `onClick={() => { 
    if(setSearchQuery) setSearchQuery(r.id || r.name); 
    setSearchResults([]);
    if (r.type === "Project") {
      setSelectedProject(r.id);
      // Try to extract state and district if available in detail (e.g. "Haryana • Nuh")
      const parts = r.detail.split(' • ');
      if (parts.length === 2) {
        setSelectedState(parts[0]);
        setSelectedDistrict(parts[1]);
      }
    } else if (r.type === "Parcel") {
      const parts = r.detail.split(' • ');
      if (parts.length === 2) {
        setSelectedState(parts[0]);
        setSelectedDistrict(parts[1]);
      }
    }
  }}`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
