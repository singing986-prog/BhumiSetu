const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');
let lines = content.split('\\n');
let newLines = [];
let skip = false;
for (let line of lines) {
  if (line.includes('layout={{ visibility: showSec11 ? "visible" : "none" }}')) {
     if (!skip) { newLines.push(line); skip = true; }
  } else if (line.includes('layout={{ visibility: showAward ? "visible" : "none" }}')) {
     if (!skip) { newLines.push(line); skip = true; }
  } else if (line.includes('layout={{ visibility: showCorridor ? "visible" : "none" }}')) {
     if (!skip) { newLines.push(line); skip = true; }
  } else {
     newLines.push(line);
     skip = false;
  }
}
fs.writeFileSync('src/components/Map.tsx', newLines.join('\\n'));
