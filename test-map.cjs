const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// The duplicate layout problem. Let's just strip all `layout=` from the layers in question, and add exactly one.
let inSec11 = false;
let inAward = false;
let inCorridor = false;
let newLines = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('id="parcels-sec11-fill"') || line.includes('id="parcels-sec11-line"')) inSec11 = true;
  if (line.includes('id="parcels-award-fill"') || line.includes('id="parcels-award-line"')) inAward = true;
  if (line.includes('id="corridor-line"')) inCorridor = true;

  if (line.includes('/>')) {
    if (inSec11) {
      newLines.push('layout={{ visibility: showSec11 ? "visible" : "none" }}');
      inSec11 = false;
    }
    if (inAward) {
      newLines.push('layout={{ visibility: showAward ? "visible" : "none" }}');
      inAward = false;
    }
    if (inCorridor) {
      newLines.push('layout={{ visibility: showCorridor ? "visible" : "none" }}');
      inCorridor = false;
    }
  }

  if (line.includes('layout={{ visibility')) {
    continue; // strip all layouts first
  }

  newLines.push(line);
}

fs.writeFileSync('src/components/Map.tsx', newLines.join('\n'));
