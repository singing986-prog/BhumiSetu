import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(
  /mapRef\.current\.fitBounds\(\[bbox\[0\], bbox\[1\], bbox\[2\], bbox\[3\]\], \{ padding: 40, duration: 1000 \}\);/,
  'mapRef.current?.getMap()?.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 40, duration: 1000 });'
);

code = code.replace(
  /mapRef\.current\.fitBounds\(turf\.bbox\(feat\), \{ padding: 40, duration: 1000 \}\);/,
  'mapRef.current?.getMap()?.fitBounds([[turf.bbox(feat)[0], turf.bbox(feat)[1]], [turf.bbox(feat)[2], turf.bbox(feat)[3]]], { padding: 40, duration: 1000 });'
);

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched fitBounds");
