const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');
content = content.replace(/layout=\{\{ visibility: showSec11 \? "visible" : "none" \}\}\n\s*layout=\{\{ visibility: showSec11 \? "visible" : "none" \}\}/g, 'layout={{ visibility: showSec11 ? "visible" : "none" }}');
content = content.replace(/layout=\{\{ visibility: showAward \? "visible" : "none" \}\}\n\s*layout=\{\{ visibility: showAward \? "visible" : "none" \}\}/g, 'layout={{ visibility: showAward ? "visible" : "none" }}');
content = content.replace(/layout=\{\{ visibility: showCorridor \? "visible" : "none" \}\}\n\s*layout=\{\{ visibility: showCorridor \? "visible" : "none" \}\}/g, 'layout={{ visibility: showCorridor ? "visible" : "none" }}');
fs.writeFileSync('src/components/Map.tsx', content);
