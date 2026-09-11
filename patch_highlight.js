import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const highlightLayer = `
          {selectedFeature && (selectedFeature.ulpin || selectedFeature.parcelId) && (
            <Source id="selected-feature-highlight" type="geojson" data={
              parcels?.features?.find((f:any) => 
                (f.properties.ulpin && f.properties.ulpin === selectedFeature.ulpin) || 
                (f.properties.parcelId && f.properties.parcelId === selectedFeature.parcelId)
              ) || { type: 'FeatureCollection', features: [] }
            }>
              <Layer
                id="selected-feature-fill"
                type="fill"
                paint={{ 'fill-color': '#F59E0B', 'fill-opacity': 0.4 }}
              />
              <Layer
                id="selected-feature-line"
                type="line"
                paint={{ 'line-color': '#D97706', 'line-width': 3 }}
              />
            </Source>
          )}
          {hoverInfo && (
`;

if (!code.includes('selected-feature-highlight')) {
  code = code.replace('{hoverInfo && (', highlightLayer.trim());
  fs.writeFileSync('src/components/Map.tsx', code);
  console.log("Patched Map highlight layer");
} else {
  console.log("Highlight layer already exists");
}
