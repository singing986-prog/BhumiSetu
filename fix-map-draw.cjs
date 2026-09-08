const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// Add imports
content = content.replace(
  'import { NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, Layer, Source } from "react-map-gl/maplibre";',
  'import { NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, Layer, Source, useControl } from "react-map-gl/maplibre";\nimport MapboxDraw from "@mapbox/mapbox-gl-draw";\nimport "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";'
);

// We should create a React wrapper for Draw control, or just use useControl
const drawComponent = `
function DrawControl(props: any) {
  useControl(
    () => new MapboxDraw(props),
    ({ map }: { map: any }) => {
      map.on('draw.create', props.onCreate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onDelete);
    },
    ({ map }: { map: any }) => {
      map.off('draw.create', props.onCreate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  );
  return null;
}
`;

content = content.replace('export default function GISMap', drawComponent + '\nexport default function GISMap');

// Add DrawControl to Map
content = content.replace(
  '<ScaleControl position="bottom-right" />',
  `<ScaleControl position="bottom-right" />
        <DrawControl
          position="top-right"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            line_string: true,
            point: true,
            trash: true
          }}
          onCreate={(e: any) => console.log('Draw create', e)}
          onUpdate={(e: any) => console.log('Draw update', e)}
          onDelete={(e: any) => console.log('Draw delete', e)}
        />`
);

fs.writeFileSync('src/components/Map.tsx', content);
