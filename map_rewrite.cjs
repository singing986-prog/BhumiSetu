const fs = require('fs');

const code = `import { apiFetch } from "../api";
import { useState, useEffect, useRef, useMemo } from "react";
import Map, { Source, Layer, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ParcelProperties } from "../types";
import { useTranslation } from "../i18n";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import { Layers, Search, PenTool, Maximize, MousePointer2, MapPin, Ruler, Square, Trash2, X } from "lucide-react";
import { useControl } from "react-map-gl/maplibre";

const CANONICAL_LAYERS = [
  { id: "project-corridors", label: "Project Corridors" },
  { id: "affected-parcels", label: "Affected Parcels" },
  { id: "revenue-village-boundaries", label: "Revenue Village Boundaries" },
  { id: "eco-sensitive-zones", label: "Eco-Sensitive Zones" },
  { id: "section-11-notification", label: "Section 11 Notification" },
  { id: "award-possession", label: "Award / Possession" },
  { id: "proposed-alignment", label: "Proposed Alignment" }
];

const drawStyles = [
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'paint': {
      'fill-color': '#D92D20',
      'fill-outline-color': '#D92D20',
      'fill-opacity': 0.1
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#D92D20',
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#D92D20'
    }
  }
];

function DrawControl(props: any) {
  const draw = useControl(
    // @ts-ignore
    () => {
      const { drawRef, ...drawOptions } = props;
      return new MapboxDraw({ ...drawOptions, styles: drawStyles });
    },
    ({ map }: { map: any }) => {
      map.on('draw.create', props.onCreate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onDelete);
      map.on('draw.modechange', props.onModeChange);
      map.on('draw.selectionchange', props.onSelectionChange);
    },
    ({ map }: { map: any }) => {
      map.off('draw.create', props.onCreate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onDelete);
      map.off('draw.modechange', props.onModeChange);
      map.off('draw.selectionchange', props.onSelectionChange);
    },
    {
      position: props.position
    }
  );
  
  if (props.drawRef) {
    props.drawRef.current = draw;
  }
  return null;
}

export function GISMap({ showSidebar = false, profile, selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery = "", selectedProject = "All Projects", setSelectedProject, selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { showSidebar?: boolean, profile?: any, selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string, selectedProject?: string, setSelectedProject?: (proj: string) => void, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeDrawMode, setActiveDrawMode] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<{distance?: string, area?: string} | null>(null);
  const [isLive, setIsLive] = useState(true);
  const drawRef = useRef<any>(null);
  const mapRef = useRef<MapRef>(null);

  const [parcels, setParcels] = useState<any>(null);
  const [gisLayers, setGisLayers] = useState<any>(null);
  const [projectsList, setProjectsList] = useState<any[]>([]);

  // Canonical layers state
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    "project-corridors": true,
    "affected-parcels": true,
    "revenue-village-boundaries": false,
    "eco-sensitive-zones": false,
    "section-11-notification": false,
    "award-possession": false,
    "proposed-alignment": false
  });

  const toggleLayer = (id: string) => {
    setVisibleLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (showSidebar) {
      apiFetch(\`/api/projects?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&stage=\${encodeURIComponent(selectedStage || "All Stages")}&category=\${encodeURIComponent(selectedCategory || "All Categories")}&risk=\${encodeURIComponent(selectedRisk || "All Risks")}\`)
        .then(r => r.json())
        .then(data => setProjectsList(data))
        .catch(err => console.error("Failed to load projects", err));
    }
  }, [showSidebar, selectedState, selectedDistrict, selectedStage, selectedCategory, selectedRisk]);

  const loadParcels = () => {
    apiFetch(\`/api/parcels?state=\${encodeURIComponent(selectedState)}&district=\${encodeURIComponent(selectedDistrict)}&project=\${encodeURIComponent(selectedProject || "All Projects")}&stage=\${encodeURIComponent(selectedStage || "All Stages")}&category=\${encodeURIComponent(selectedCategory || "All Categories")}&risk=\${encodeURIComponent(selectedRisk || "All Risks")}\`)
      .then((res) => { if(!res.ok) return { type: "FeatureCollection", features: [] }; return res.json(); })
      .then((data) => {
        setParcels(data);
        // If searching by ULPIN, find it and fly
        if (searchQuery && data.features) {
           const found = data.features.find((f: any) => 
             f.properties?.ulpin?.toLowerCase() === searchQuery.toLowerCase() || 
             f.properties?.parcelId?.toLowerCase() === searchQuery.toLowerCase()
           );
           if (found && mapRef.current) {
             const [lng, lat] = found.geometry.coordinates[0][0];
             mapRef.current.flyTo({ center: [lng, lat], zoom: 16 });
             setHoverInfo({ longitude: lng, latitude: lat, properties: found.properties });
           }
        }
      })
      .catch((err) => console.error("Failed to load parcels", err));
  };

  useEffect(() => {
    loadParcels();
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk, searchQuery]);

  useEffect(() => {
    if (selectedProject && selectedProject !== "All Projects") {
      apiFetch(\`/api/gis/layers?projectId=\${selectedProject}\`)
        .then(res => res.json())
        .then(data => {
          setGisLayers(data);
          // Fit map to corridor
          if (data.projectCorridors?.features?.[0] && mapRef.current) {
            const bbox = turf.bbox(data.projectCorridors);
            if (bbox && bbox.length === 4) {
              mapRef.current.fitBounds([bbox[0], bbox[1], bbox[2], bbox[3]], { padding: 40, duration: 1000 });
            }
          }
        })
        .catch(err => console.error("Failed to load gis layers", err));
    } else {
      setGisLayers(null);
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [78.9629, 20.5937], zoom: 4 });
      }
    }
  }, [selectedProject]);

  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const onHover = (event: any) => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      setHoverInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        properties: hoveredFeature.properties
      });
    }
  };

  const onDrawUpdate = (e: any) => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const lastFeature = data.features[data.features.length - 1];
      let distance, area;
      if (lastFeature.geometry.type === 'LineString') {
        const length = turf.length(lastFeature, { units: 'kilometers' });
        distance = length > 1 ? \`\${length.toFixed(2)} km\` : \`\${(length * 1000).toFixed(0)} m\`;
      } else if (lastFeature.geometry.type === 'Polygon') {
        const a = turf.area(lastFeature);
        const ha = a / 10000;
        area = \`\${ha.toFixed(2)} Ha\`;
      }
      setMeasurements({ distance, area });
    } else {
      setMeasurements(null);
    }
  };

  const handleDrawMode = (mode: string) => {
    if (drawRef.current) {
      drawRef.current.changeMode(mode);
      setActiveDrawMode(mode);
    }
  };

  const LayerPanelContent = () => (
    <>
      {CANONICAL_LAYERS.map(layer => (
        <label key={layer.id} className="flex items-center justify-between cursor-pointer group">
           <span className="text-sm text-registry-ink group-hover:text-tilled-earth">{layer.label}</span>
           <div className={\`w-10 h-5 rounded-full transition-colors relative \${visibleLayers[layer.id] ? 'bg-tilled-earth' : 'bg-gray-200'}\`}>
             <div className={\`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform \${visibleLayers[layer.id] ? 'left-6' : 'left-1'}\`}></div>
           </div>
           <input type="checkbox" className="hidden" checked={visibleLayers[layer.id]} onChange={() => toggleLayer(layer.id)} />
        </label>
      ))}
    </>
  );

  // Derive specialized layers
  const sec11Parcels = useMemo(() => {
    if (!parcels) return null;
    return { ...parcels, features: parcels.features.filter((f: any) => f.properties?.stage === 'Notification') };
  }, [parcels]);
  
  const awardParcels = useMemo(() => {
    if (!parcels) return null;
    return { ...parcels, features: parcels.features.filter((f: any) => f.properties?.stage === 'Award' || f.properties?.stage === 'Possession') };
  }, [parcels]);

  return (
    <div className="w-full h-full relative flex">
      {showSidebar && (
        <div className="w-64 bg-white border-r border-graticule-teal/30 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 shadow-sm relative">
          <div>
            <h3 className="font-serif font-semibold text-registry-ink mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-graticule-teal" />
              Active Layers
            </h3>
            <div className="space-y-4">
              <LayerPanelContent />
            </div>
          </div>
          
          <div className="pt-6 border-t border-graticule-teal/20 mt-auto">
            <h4 className="text-xs font-semibold text-registry-ink/50 uppercase tracking-wider mb-3">Target Project</h4>
            <select 
              className="w-full bg-survey-paper border border-graticule-teal/30 p-2 text-sm rounded-sm text-registry-ink"
              value={selectedProject}
              onChange={(e) => setSelectedProject && setSelectedProject(e.target.value)}
            >
              <option value="All Projects">All Projects</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          initialViewState={{ longitude: 78.9629, latitude: 20.5937, zoom: 4 }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          interactiveLayerIds={['parcels-line', 'parcels-sec11-fill', 'parcels-award-fill', 'village-boundaries-fill', 'eco-zones-fill']}
          onMouseMove={onHover}
          onMouseLeave={() => setHoverInfo(null)}
          onClick={(e) => {
            const feature = e.features?.[0];
            if (feature?.properties?.parcelId) {
              // Can do something on parcel click if needed
            }
          }}
        >
          <NavigationControl position="bottom-right" />
          <FullscreenControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />
          <ScaleControl />

          <DrawControl
            position="top-right"
            displayControlsDefault={false}
            controls={{}}
            drawRef={drawRef}
            onCreate={onDrawUpdate}
            onUpdate={onDrawUpdate}
            onDelete={onDrawUpdate}
            onSelectionChange={onDrawUpdate}
          />

          {visibleLayers["affected-parcels"] && parcels && (
            <Source id="parcels" type="geojson" data={parcels}>
              <Layer
                id="parcels-fill"
                type="fill"
                paint={{ 'fill-color': '#014A4E', 'fill-opacity': 0.1 }}
              />
              <Layer
                id="parcels-line"
                type="line"
                paint={{ 'line-color': '#014A4E', 'line-width': 1 }}
              />
            </Source>
          )}

          {visibleLayers["section-11-notification"] && sec11Parcels && (
            <Source id="parcels-sec11" type="geojson" data={sec11Parcels}>
              <Layer
                id="parcels-sec11-fill"
                type="fill"
                paint={{ 'fill-color': '#B44E23', 'fill-opacity': 0.4 }}
              />
            </Source>
          )}

          {visibleLayers["award-possession"] && awardParcels && (
            <Source id="parcels-award" type="geojson" data={awardParcels}>
              <Layer
                id="parcels-award-fill"
                type="fill"
                paint={{ 'fill-color': '#014A4E', 'fill-opacity': 0.4 }}
              />
            </Source>
          )}

          {visibleLayers["project-corridors"] && gisLayers?.projectCorridors && (
            <Source id="project-corridors" type="geojson" data={gisLayers.projectCorridors}>
              <Layer
                id="corridor-line"
                type="line"
                paint={{ 'line-color': '#D92D20', 'line-width': 3, 'line-dasharray': [2, 2] }}
              />
            </Source>
          )}

          {visibleLayers["eco-sensitive-zones"] && gisLayers?.ecoSensitiveZones && (
            <Source id="eco-sensitive-zones" type="geojson" data={gisLayers.ecoSensitiveZones}>
              <Layer
                id="eco-zones-fill"
                type="fill"
                paint={{ 'fill-color': '#22C55E', 'fill-opacity': 0.2 }}
              />
              <Layer
                id="eco-zones-line"
                type="line"
                paint={{ 'line-color': '#16A34A', 'line-width': 2 }}
              />
            </Source>
          )}

          {visibleLayers["revenue-village-boundaries"] && gisLayers?.villageBoundaries && (
            <Source id="village-boundaries" type="geojson" data={gisLayers.villageBoundaries}>
              <Layer
                id="village-boundaries-fill"
                type="fill"
                paint={{ 'fill-color': '#F59E0B', 'fill-opacity': 0.1 }}
              />
              <Layer
                id="village-boundaries-line"
                type="line"
                paint={{ 'line-color': '#D97706', 'line-width': 2, 'line-dasharray': [4, 2] }}
              />
            </Source>
          )}
          
          {visibleLayers["proposed-alignment"] && gisLayers?.projectCorridors && (
            <Source id="proposed-alignment" type="geojson" data={gisLayers.projectCorridors}>
              <Layer
                id="alignment-line"
                type="line"
                paint={{ 'line-color': '#3B82F6', 'line-width': 4 }}
              />
            </Source>
          )}

          {hoverInfo && (
            <div className="absolute bg-white p-3 rounded-sm shadow-lg border border-graticule-teal/20 text-xs pointer-events-none z-50 max-w-xs" style={{ left: hoverInfo.longitude, top: hoverInfo.latitude, transform: 'translate(10px, 10px)' }}>
              <div className="font-semibold mb-1 text-registry-ink border-b border-graticule-teal/10 pb-1">
                {hoverInfo.properties.ulpin ? \`Parcel: \${hoverInfo.properties.ulpin}\` : (hoverInfo.properties.village || hoverInfo.properties.name || "Feature Details")}
              </div>
              {Object.entries(hoverInfo.properties).slice(0, 5).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 py-0.5">
                  <span className="text-registry-ink/60 capitalize">{key}</span>
                  <span className="font-medium text-registry-ink truncate max-w-[150px]" title={String(value)}>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </Map>

        {/* Floating Tools */}
        <div className="absolute top-4 left-4 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
          {!showSidebar && (
            <button onClick={() => setActiveTool(activeTool === 'layers' ? null : 'layers')} className={\`p-2 transition-colors border-b border-graticule-teal/20 \${activeTool === 'layers' ? 'bg-graticule-teal/20 text-tilled-earth' : 'hover:bg-graticule-teal/10 text-registry-ink'}\`} title="Layers">
              <Layers className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={\`p-2 transition-colors \${activeTool === 'draw' ? 'bg-graticule-teal/20 text-alluvium-red' : 'hover:bg-graticule-teal/10 text-registry-ink'}\`} title="GIS Tools">
            <PenTool className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Layers Panel */}
        {!showSidebar && activeTool === 'layers' && (
          <div className="absolute top-4 left-16 ml-2 bg-white w-64 border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
            <div className="p-3 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-registry-ink">Layers</h3>
              <button onClick={() => setActiveTool(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 space-y-3">
              <LayerPanelContent />
            </div>
          </div>
        )}

        {/* Drawing Tools */}
        {activeTool === 'draw' && (
          <div className="absolute top-4 left-16 ml-2 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
            <div className="p-3 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-registry-ink text-sm">GIS Tools</h3>
              <button onClick={() => setActiveTool(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-2 flex gap-1 bg-white">
               <button onClick={() => handleDrawMode('simple_select')} className={\`p-2 rounded-sm \${activeDrawMode === 'simple_select' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Select"><MousePointer2 className="w-4 h-4" /></button>
               <button onClick={() => handleDrawMode('draw_polygon')} className={\`p-2 rounded-sm \${activeDrawMode === 'draw_polygon' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Draw Polygon"><Square className="w-4 h-4" /></button>
               <button onClick={() => handleDrawMode('draw_line_string')} className={\`p-2 rounded-sm \${activeDrawMode === 'draw_line_string' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}\`} title="Measure Distance"><Ruler className="w-4 h-4" /></button>
               <button onClick={() => drawRef.current?.trash()} className="p-2 rounded-sm hover:bg-alluvium-red/10 text-alluvium-red" title="Delete Selected"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="p-2 border-t border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center gap-4">
               {measurements?.area && selectedProject !== "All Projects" && (
                 <button onClick={async () => {
                    const data = drawRef.current.getAll();
                    const feature = data.features[data.features.length - 1];
                    if (feature) {
                      try {
                        const res = await apiFetch("/api/parcels", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ geometry: feature.geometry, area: measurements.area, projectId: selectedProject })
                        });
                        if (res.ok) {
                          loadParcels();
                          drawRef.current.deleteAll();
                          setMeasurements(null);
                        } else {
                           alert("Unauthorized or error saving parcel");
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }
                 }} 
                 className="text-xs font-medium text-white bg-tilled-earth px-2 py-1 rounded-sm cursor-pointer hover:bg-opacity-90">
                   Save as Parcel
                 </button>
               )}
               <button onClick={() => handleDrawMode('simple_select')} className="text-xs font-medium text-registry-ink/60 hover:text-registry-ink bg-graticule-teal/10 px-2 py-1 rounded-sm cursor-pointer ml-auto">Finish</button>
            </div>
          </div>
        )}

        {measurements && (measurements.distance || measurements.area) && (
          <div className="absolute bottom-6 right-6 bg-white p-4 border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col gap-1">
            <h4 className="text-xs font-semibold text-registry-ink/50 uppercase tracking-wider mb-1">Measurements</h4>
            {measurements.area && <div className="text-lg font-mono font-medium text-registry-ink">Area: {measurements.area}</div>}
            {measurements.distance && <div className="text-lg font-mono font-medium text-registry-ink">Distance: {measurements.distance}</div>}
          </div>
        )}

      </div>
    </div>
  );
}
`
fs.writeFileSync('src/components/Map.tsx', code);
console.log("Rewrite complete.");
