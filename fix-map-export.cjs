const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// I need to add DrawControl, and correct the props for GISMap.
content = content.replace(
  'export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string }) {',
  `
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useControl } from "react-map-gl/maplibre";

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

export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery = "", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {`
);

fs.writeFileSync('src/components/Map.tsx', content);
