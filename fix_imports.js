import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
if (importMatch) {
  let imports = importMatch[1].split(',').map(s => s.trim());
  const needed = ['Globe', 'UploadCloud', 'FileArchive', 'Edit3', 'MapPin', 'MousePointer2', 'Square', 'Ruler', 'Trash2', 'X', 'Layers', 'PenTool', 'Search', 'Maximize'];
  
  needed.forEach(icon => {
    if (!imports.includes(icon)) {
      imports.push(icon);
    }
  });
  
  const newImport = 'import { ' + imports.join(', ') + ' } from "lucide-react";';
  code = code.replace(importMatch[0], newImport);
  
  fs.writeFileSync('src/components/Map.tsx', code);
  console.log("Fixed imports: ", newImport);
} else {
  console.log("Could not find lucide-react import");
}
