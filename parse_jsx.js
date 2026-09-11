import fs from 'fs';
const content = fs.readFileSync('src/components/Map.tsx', 'utf-8');

let divStack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let pos = 0;
    while (pos < line.length) {
        let openIdx = line.indexOf('<div', pos);
        let closeIdx = line.indexOf('</div', pos);
        
        // This is a naive parser and can fail on multiline strings or attributes containing `<div`, 
        // but should work if the file is well formatted.
        // Let's just use regex for better accuracy per line
        break;
    }
}
