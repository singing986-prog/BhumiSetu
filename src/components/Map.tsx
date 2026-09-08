import { useState, useEffect, useRef } from "react";
import Map, { Source, Layer, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ParcelProperties } from "../types";
import { useTranslation } from "../i18n";

const locationCoordinates: Record<string, { longitude: number, latitude: number, zoom: number }> = {
  "All States": { longitude: 78.9629, latitude: 20.5937, zoom: 4 },
  "Delhi": { longitude: 77.2090, latitude: 28.6139, zoom: 10 },
  "New Delhi": { longitude: 77.2090, latitude: 28.6139, zoom: 12 },
  "North Delhi": { longitude: 77.1416, latitude: 28.7495, zoom: 11 },
  "South Delhi": { longitude: 77.2038, latitude: 28.4842, zoom: 11 },
  "East Delhi": { longitude: 77.2924, latitude: 28.6415, zoom: 11 },
  "West Delhi": { longitude: 77.0697, latitude: 28.6432, zoom: 11 },
  "Haryana": { longitude: 76.0856, latitude: 29.0588, zoom: 7 },
  "Nuh": { longitude: 77.018, latitude: 28.125, zoom: 12.5 },
  "Gurugram": { longitude: 77.0266, latitude: 28.4595, zoom: 11 },
  "Faridabad": { longitude: 77.3178, latitude: 28.4089, zoom: 11 },
  "Rohtak": { longitude: 76.5706, latitude: 28.8955, zoom: 11 },
  "Hisar": { longitude: 75.7139, latitude: 29.1492, zoom: 11 },
  "Ambala": { longitude: 76.7821, latitude: 30.3752, zoom: 11 },
  "Uttar Pradesh": { longitude: 80.9462, latitude: 26.8467, zoom: 6 },
  "Lucknow": { longitude: 80.9462, latitude: 26.8467, zoom: 11 },
  "Kanpur": { longitude: 80.3319, latitude: 26.4499, zoom: 11 },
  "Agra": { longitude: 78.0081, latitude: 27.1767, zoom: 11 },
  "Varanasi": { longitude: 82.9739, latitude: 25.3176, zoom: 11 },
  "Noida": { longitude: 77.3910, latitude: 28.5355, zoom: 11 },
  "Meerut": { longitude: 77.7082, latitude: 28.9845, zoom: 11 },
  "Maharashtra": { longitude: 75.7139, latitude: 19.7515, zoom: 6 },
  "Pune": { longitude: 73.8567, latitude: 18.5204, zoom: 11 },
  "Mumbai": { longitude: 72.8777, latitude: 19.0760, zoom: 11 },
  "Nashik": { longitude: 73.7898, latitude: 19.9975, zoom: 11 },
  "Nagpur": { longitude: 79.0882, latitude: 21.1458, zoom: 11 },
  "Thane": { longitude: 72.9781, latitude: 19.2183, zoom: 11 },
  "Tamil Nadu": { longitude: 78.6569, latitude: 11.1271, zoom: 6 },
  "Chennai": { longitude: 80.2707, latitude: 13.0827, zoom: 11 },
  "Kanchipuram": { longitude: 79.7036, latitude: 12.8342, zoom: 11 },
  "Coimbatore": { longitude: 76.9558, latitude: 11.0168, zoom: 11 },
  "Madurai": { longitude: 78.1198, latitude: 9.9252, zoom: 11 },
  "All Districts": { longitude: 78.9629, latitude: 20.5937, zoom: 4 }
};


import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useControl } from "react-map-gl/maplibre";


const drawStyles = [
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
      'fill-opacity': 0.1,
    },
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': '#fbb03b',
      'line-dasharray': ['literal', [0.2, 2]],
      'line-width': 2,
    },
  },
  {
    'id': 'gl-draw-polygon-stroke-inactive',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': '#3bb2d0',
      'line-width': 2,
    },
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  },
  {
    'id': 'gl-draw-point-point-stroke-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-point-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#3bb2d0',
    },
  },
  {
    'id': 'gl-draw-point-stroke-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 7,
      'circle-color': '#fff',
    },
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#fbb03b',
    },
  },
  {
    'id': 'gl-draw-polygon-fill-static',
    'type': 'fill',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    'id': 'gl-draw-polygon-stroke-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    'id': 'gl-draw-point-static',
    'type': 'circle',
    'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  },
  // Lines (this is the one that was breaking)
  {
    'id': 'gl-draw-lines',
    'type': 'line',
    'filter': ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round',
    },
    'paint': {
      'line-color': ['case', ['==', ['get', 'active'], 'true'], '#fbb03b', '#3bb2d0'],
      'line-dasharray': ['case', ['==', ['get', 'active'], 'true'], ['literal', [0.2, 2]], ['literal', [2, 0]]],
      'line-width': 2,
    },
  },
  {
    'id': 'gl-draw-midpoint',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  }
];

function DrawControl(props: any) {
  useControl(
    // @ts-ignore
    () => new MapboxDraw({ ...props, styles: drawStyles }),
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

export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery = "", selectedProject = "All Projects", selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string, selectedProject?: string, selectedStage?: string, selectedCategory?: string, selectedRisk?: string }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const mapRef = useRef<MapRef>(null);
  
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
  }, [searchQuery]);
  const [parcels, setParcels] = useState<any>(null);
  const [clickedFeature, setClickedFeature] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    feature: any;
    x: number;
    y: number;
  } | null>(null);
  
  const [showSec11, setShowSec11] = useState(true);
  const [showAward, setShowAward] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`/api/parcels?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject || "All Projects")}&stage=${encodeURIComponent(selectedStage || "All Stages")}&category=${encodeURIComponent(selectedCategory || "All Categories")}&risk=${encodeURIComponent(selectedRisk || "All Risks")}`)
      .then((res) => res.json())
      .then((data) => setParcels(data))
      .catch((err) => console.error("Failed to load parcels", err));
  }, [selectedState, selectedDistrict, selectedProject, selectedStage, selectedCategory, selectedRisk]);

  useEffect(() => {
    if (!isAutoSync) return;
    
    let target = locationCoordinates[selectedDistrict];
    if (selectedDistrict === "All Districts" || !target) {
      target = locationCoordinates[selectedState];
    }
    
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.longitude, target.latitude],
        zoom: target.zoom,
        duration: 2000
      });
    }
  }, [selectedState, selectedDistrict, isAutoSync]);

  const onClick = (event: any) => {
    const { features } = event;
    const clicked = features && features[0];
    if (clicked) {
      setClickedFeature(clicked);
    } else {
      setClickedFeature(null);
    }
  };

  const onHover = (event: any) => {
    const {
      features,
      point: { x, y }
    } = event;
    const hoveredFeature = features && features[0];
    
    if (hoveredFeature) {
      setHoverInfo({ feature: hoveredFeature, x, y });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden border border-graticule-teal/30">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: locationCoordinates[selectedDistrict]?.longitude || locationCoordinates[selectedState]?.longitude || 78.9629,
          latitude: locationCoordinates[selectedDistrict]?.latitude || locationCoordinates[selectedState]?.latitude || 20.5937,
          zoom: locationCoordinates[selectedDistrict]?.zoom || locationCoordinates[selectedState]?.zoom || 4
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap Contributors",
              maxzoom: 19
            }
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm"
            }
          ]
        }}
        interactiveLayerIds={parcels ? [...(showSec11 ? ["parcels-sec11-fill"] : []), ...(showAward ? ["parcels-award-fill"] : []), ...(showCorridor ? ["corridor-line"] : [])] : []}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
        onClick={onClick}
        cursor={hoverInfo ? "pointer" : "grab"}
      >
        <NavigationControl position="bottom-right" />
        
        
        <ScaleControl position="bottom-right" />
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
        />

      <div className="absolute top-4 left-4 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
        <button onClick={() => setActiveTool(activeTool === 'layers' ? null : 'layers')} className={`p-2 transition-colors border-b border-graticule-teal/20 ${activeTool === 'layers' ? 'bg-graticule-teal/20' : 'hover:bg-graticule-teal/10'}`} title="Layers" aria-label="Toggle Layers">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <button onClick={() => {
           // Search triggers focus on main search
           const searchInput = document.querySelector('input[placeholder*="Search"]');
           if (searchInput) (searchInput as HTMLElement).focus();
        }} className="p-2 hover:bg-graticule-teal/10 transition-colors border-b border-graticule-teal/20" title="Search Map" aria-label="Search Map">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={`p-2 transition-colors border-b border-graticule-teal/20 ${activeTool === 'draw' ? 'bg-graticule-teal/20 text-alluvium-red' : 'hover:bg-graticule-teal/10'}`} title="Draw/Measure" aria-label="Draw or Measure">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button onClick={() => {
           if (mapRef.current) {
             mapRef.current.getMap().getContainer().requestFullscreen().catch(err => console.log(err));
           }
        }} className="p-2 hover:bg-graticule-teal/10 transition-colors" title="Fullscreen" aria-label="Toggle Fullscreen">
          <svg className="w-5 h-5 text-registry-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>
      {activeTool === 'draw' && (
        <div className="absolute top-4 left-16 ml-2 bg-white px-4 py-2 border border-graticule-teal/30 shadow-md rounded-sm z-10 text-xs font-medium text-registry-ink flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-alluvium-red animate-pulse"></span>
           Drawing Mode Active. Click on map to drop vertices.
        </div>
      )}

        
        {parcels && (
          <Source id="parcels" type="geojson" data={parcels}>
            <Layer
              id="parcels-sec11-fill"
              type="fill"
              filter={['all', ['==', ['geometry-type'], 'Polygon'], ['==', ['get', 'status'], 'Notification']]}
              paint={{
                "fill-color": "#A8672E",
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.8,
                  0.4
                ]
              }}
layout={{ visibility: showSec11 ? "visible" : "none" }}
            />
            <Layer
              id="parcels-award-fill"
              type="fill"
              filter={['all', ['==', ['geometry-type'], 'Polygon'], ['==', ['get', 'status'], 'Award']]}
              paint={{
                "fill-color": "#2F6B3A",
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.8,
                  0.4
                ]
              }}
layout={{ visibility: showAward ? "visible" : "none" }}
            />
            <Layer
              id="parcels-line"
              type="line"
              filter={['==', ['geometry-type'], 'Polygon']}
              paint={{
                "line-color": "#10233F", // Registry Ink
                "line-width": 1
              }}
            />
            <Layer
              id="corridor-line"
              type="line"
              filter={['==', ['geometry-type'], 'LineString']}
              paint={{
                "line-color": "#A8672E", // Tilled Earth
                "line-width": 4,
                "line-dasharray": [2, 2]
              }}
layout={{ visibility: showCorridor ? "visible" : "none" }}
            />
          </Source>
        )}

        {hoverInfo && (
          <div
            className="absolute bg-white p-3 border border-graticule-teal/30 shadow-sm pointer-events-none text-sm min-w-[200px] z-10"
            style={{ left: hoverInfo.x, top: hoverInfo.y, transform: "translate(-50%, -100%)", marginTop: "-10px" }}
          >
            {hoverInfo.feature.properties.ulpin !== "N/A" && hoverInfo.feature.properties.ulpin && (
              <div className="font-mono text-xs text-graticule-teal mb-1">ULPIN: {hoverInfo.feature.properties.ulpin}</div>
            )}
            <div className="font-semibold text-registry-ink mb-1">{hoverInfo.feature.properties.owner}</div>
            <div className="flex justify-between text-registry-ink/80 text-xs">
              <span>Status:</span>
              <span className="font-medium">{hoverInfo.feature.properties.status}</span>
            </div>
            {hoverInfo.feature.properties.area > 0 && (
              <div className="flex justify-between text-registry-ink/80 text-xs mt-0.5">
                <span>Area:</span>
                <span>{hoverInfo.feature.properties.area} Ha</span>
              </div>
            )}
          </div>
        )}
      </Map>


      {clickedFeature && (
        <div className="absolute right-6 top-6 bottom-6 w-80 bg-white border border-graticule-teal/30 shadow-xl z-20 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-start">
            <div>
              <h3 className="font-serif font-semibold text-registry-ink text-lg">Parcel Details</h3>
              <p className="text-xs text-registry-ink/60 mt-1">{clickedFeature.properties.ulpin || 'N/A'}</p>
            </div>
            <button onClick={() => setClickedFeature(null)} className="text-registry-ink/50 hover:text-alluvium-red transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-4 space-y-4 text-sm">
            <div>
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Location</div>
              <div className="font-medium text-registry-ink">{clickedFeature.properties.village || 'Khedki'}, {selectedDistrict}, {selectedState}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Survey / Khasra</div>
                <div className="font-medium text-registry-ink">{clickedFeature.properties.khasra || '45/2'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Area</div>
                <div className="font-medium text-registry-ink">{clickedFeature.properties.area || '0.0'} Ha</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Land Type</div>
              <div className="font-medium text-registry-ink">{clickedFeature.properties.landType || 'Agricultural'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider">Ownership Status</div>
              <div className="font-medium text-registry-ink">{clickedFeature.properties.owner || 'Private'}</div>
            </div>
            <div className="border-t border-graticule-teal/10 pt-4 mt-2">
              <div className="text-[10px] uppercase font-bold text-registry-ink/50 tracking-wider mb-2">Acquisition Status</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-registry-ink/70">Stage</span>
                  <span className="font-medium capitalize">{clickedFeature.properties.status || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-registry-ink/70">Compensation</span>
                  <span className="font-medium text-tilled-earth">Assessed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-registry-ink/70">R&R</span>
                  <span className="font-medium text-registry-ink/50">N/A</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border border-graticule-teal text-graticule-teal rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-graticule-teal hover:text-white transition-colors">
              View Full Record
            </button>
          </div>
        </div>
      )}
      <div className="absolute bottom-6 left-6 bg-white p-4 border border-graticule-teal/30 shadow-sm text-sm z-10">
        <h4 className="font-serif mb-2 text-registry-ink font-semibold">{t("map.legend.title")}</h4>
        <div className="space-y-3 text-registry-ink/80">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showSec11} 
              onChange={(e) => setShowSec11(e.target.checked)}
              className="accent-tilled-earth"
            />
            <div className="w-4 h-4 bg-tilled-earth/40 border border-registry-ink shrink-0"></div>
            <span>{t("map.legend.sec11")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showAward} 
              onChange={(e) => setShowAward(e.target.checked)}
              className="accent-cultivated-green"
            />
            <div className="w-4 h-4 bg-cultivated-green/40 border border-registry-ink shrink-0"></div>
            <span>{t("map.legend.award")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showCorridor} 
              onChange={(e) => setShowCorridor(e.target.checked)}
              className="accent-tilled-earth"
            />
            <div className="w-4 h-1 border-t-2 border-dashed border-tilled-earth shrink-0"></div>
            <span>{t("map.legend.alignment")}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
