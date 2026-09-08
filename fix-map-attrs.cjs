const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// The script added layout visibility, maybe the tag already had a layout attribute?
content = content.replace(
  /layout=\{\{ visibility: showSec11 \? "visible" : "none" \}\}[\s\S]*?layout=\{\{ visibility: showSec11 \? "visible" : "none" \}\}/g,
  'layout={{ visibility: showSec11 ? "visible" : "none" }}'
);

content = content.replace(
  /layout=\{\{ visibility: showAward \? "visible" : "none" \}\}[\s\S]*?layout=\{\{ visibility: showAward \? "visible" : "none" \}\}/g,
  'layout={{ visibility: showAward ? "visible" : "none" }}'
);

fs.writeFileSync('src/components/Map.tsx', content);
