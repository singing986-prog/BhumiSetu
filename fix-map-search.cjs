const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// add searchQuery to Map props
content = content.replace(
  'export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {',
  'export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", searchQuery }: { selectedState?: string, selectedDistrict?: string, searchQuery?: string }) {'
);

// Map flyTo logic based on search
content = content.replace(
  'const mapRef = useRef<MapRef>(null);',
  `const mapRef = useRef<MapRef>(null);
  
  useEffect(() => {
    if (searchQuery && /^[A-Z0-9]{14}$/i.test(searchQuery)) {
      // It's a ULPIN, fly to it
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [77.018, 28.125], // specific parcel mock location
          zoom: 17,
          duration: 2000
        });
      }
    } else if (searchQuery && searchQuery.includes("Delhi-Mumbai Expressway")) {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [77.015, 28.130],
          zoom: 14,
          duration: 2000
        });
      }
    }
  }, [searchQuery]);`
);

fs.writeFileSync('src/components/Map.tsx', content);
