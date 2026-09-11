import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const rasterStyle = `
const osmStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
};
`;

if (!code.includes('const osmStyle = {')) {
  code = code.replace(/export function GISMap/, rasterStyle + '\nexport function GISMap');
}

code = code.replace(
  /mapStyle="https:\/\/basemaps\.cartocdn\.com\/gl\/positron-gl-style\/style\.json"/,
  `mapStyle={osmStyle as any}`
);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Updated map style to OSM raster");
