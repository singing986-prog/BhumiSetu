const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\{activeTab === "map" && <div className="h-full">/,
  `{activeTab === "map" && <div className="h-full w-full absolute inset-0">`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed MapView container height');
