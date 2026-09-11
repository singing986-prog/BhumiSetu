const fs = require('fs');

let config = fs.readFileSync('vite.config.ts', 'utf8');
if (!config.includes('optimizeDeps')) {
  config = config.replace(/server:\s*\{/, "optimizeDeps: { include: ['@mapbox/mapbox-gl-draw', '@turf/turf'] },\n  server: {");
  fs.writeFileSync('vite.config.ts', config);
  console.log("Updated vite.config.ts");
}
