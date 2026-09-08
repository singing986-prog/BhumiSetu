const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

content = content.replace(
  'const [hoverInfo, setHoverInfo] = useState<{',
  'const [clickedFeature, setClickedFeature] = useState<any>(null);\n  const [hoverInfo, setHoverInfo] = useState<{'
);

fs.writeFileSync('src/components/Map.tsx', content);
