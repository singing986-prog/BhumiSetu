const fs = require('fs');
const path = require('path');
const p = path.resolve('node_modules/@mapbox/mapbox-gl-draw/src/lib/theme.js');
if (fs.existsSync(p)) {
  console.log(fs.readFileSync(p, 'utf8'));
} else {
  console.log("File not found");
}
