const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

content = content.replace(
  'import Map, { Source, Layer, NavigationControl, MapRef } from "react-map-gl/maplibre";',
  'import Map, { Source, Layer, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, MapRef } from "react-map-gl/maplibre";'
);

content = content.replace(
  '<NavigationControl position="top-right" />',
  '<NavigationControl position="top-right" />\n        <FullscreenControl position="top-right" />\n        <GeolocateControl position="top-right" />\n        <ScaleControl position="bottom-right" />'
);

// I will remove the dead toolbar and rely on MapLibre's built-in controls + maybe add a functional Layers panel.
// Actually, the user asked for: ⌕ Search Layers Draw Measure Locate Fullscreen
// I'll keep the custom toolbar but add functional states to it.

fs.writeFileSync('src/components/Map.tsx', content);
