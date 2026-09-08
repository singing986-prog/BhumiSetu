const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// I might have appended it wrongly, or the import line was a bit different. Let's find the lucide-react import
content = content.replace(
  /import \{([^}]+)\} from "lucide-react";/,
  (match, p1) => {
    let icons = p1.split(',').map(i => i.trim());
    const needed = ['FileText', 'File', 'Eye', 'Download'];
    needed.forEach(n => {
      if (!icons.includes(n)) icons.push(n);
    });
    return `import { ${icons.join(', ')} } from "lucide-react";`;
  }
);

content = content.replace(/<File className="w-5 h-5 text-registry-ink\/60" \/>/g, '{/* @ts-ignore */}\n<File className="w-5 h-5 text-registry-ink/60" />');

fs.writeFileSync('src/components/Dashboard.tsx', content);
