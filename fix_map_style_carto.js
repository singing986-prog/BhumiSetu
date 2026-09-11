import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const rasterStyle = `
const cartoRasterStyle = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-basemap',
      type: 'raster',
      source: 'carto'
    }
  ]
};
`;

// Replace the previous osmStyle
code = code.replace(/const osmStyle = {[\s\S]*?};\n/, rasterStyle);
code = code.replace(/mapStyle=\{osmStyle as any\}/, `mapStyle={cartoRasterStyle as any}`);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Updated map style to Carto Positron raster");
