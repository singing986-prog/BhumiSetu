const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Remove duplicate map controls from react-map-gl
content = content.replace(
  '<NavigationControl position="top-right" />',
  '<NavigationControl position="bottom-right" />'
);
content = content.replace(
  '<FullscreenControl position="top-right" />',
  ''
);
content = content.replace(
  '<GeolocateControl position="top-right" />',
  ''
);

// We will keep DrawControl top-right, Navigation bottom-right

fs.writeFileSync('src/components/Map.tsx', content);
