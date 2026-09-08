const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

content = content.replace(
  '() => new MapboxDraw(props),',
  '// @ts-ignore\n    () => new MapboxDraw(props),'
);

fs.writeFileSync('src/components/Map.tsx', content);
