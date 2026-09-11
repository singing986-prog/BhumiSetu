import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const esriStyle = `
const cartoRasterStyle = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }
  },
  layers: [
    {
      id: 'esri-basemap',
      type: 'raster',
      source: 'esri'
    }
  ]
};
`;

code = code.replace(/const cartoRasterStyle = \{[\s\S]*?id: 'carto-basemap'[\s\S]*?\}[\s\S]*?\n\};\n/, esriStyle.trim() + '\n');
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map to use ESRI Light Gray Base");
