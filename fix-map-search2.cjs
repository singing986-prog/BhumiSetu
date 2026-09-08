const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Find the searchQuery effect
content = content.replace(
  `useEffect(() => {
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
          zoom: 13,
          duration: 2000
        });
      }
    }
  }, [searchQuery]);`,
  `useEffect(() => {
    if (!searchQuery || !mapRef.current || !parcels) return;
    const isUlpin = /^[A-Z0-9]{14}$/i.test(searchQuery);
    let target = null;
    if (isUlpin) {
       target = parcels.features.find((f: any) => f.properties.ulpin === searchQuery);
    } else {
       target = parcels.features.find((f: any) => f.properties.project.includes(searchQuery) || (f.properties.village && f.properties.village.includes(searchQuery)));
    }
    
    if (target && target.geometry && target.geometry.coordinates) {
       // Simple centering based on first polygon point
       let coord = target.geometry.coordinates[0][0];
       if (Array.isArray(coord[0])) coord = coord[0]; // multi-polygon safety
       mapRef.current.flyTo({
          center: [coord[0], coord[1]],
          zoom: isUlpin ? 17 : 13,
          duration: 2000
       });
       if (isUlpin) setClickedFeature(target);
    }
  }, [searchQuery, parcels]);`
);

fs.writeFileSync('src/components/Map.tsx', content);
