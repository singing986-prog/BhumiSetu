import { apiFetch } from "../api";
import { useState, useEffect, useRef, useMemo } from "react";
import Map, { Source, Layer, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ParcelProperties } from "../types";
import { useTranslation } from "../i18n";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import { Layers, Search, PenTool, Maximize, MousePointer2, MapPin, Ruler, Square, Trash2, X, Globe, UploadCloud, FileArchive, Edit3 } from "lucide-react";;
import { useControl } from "react-map-gl/maplibre";

const CANONICAL_LAYERS_FN = (t: any) => [
  { id: "project-corridors", label: t("Project Corridors", "Project Corridors") },
  { id: "affected-parcels", label: t("Affected Parcels", "Affected Parcels") },
  { id: "revenue-village-boundaries", label: t("Revenue Village Boundaries", "Revenue Village Boundaries") },
  { id: "eco-sensitive-zones", label: t("Eco-Sensitive Zones", "Eco-Sensitive Zones") },
  { id: "section-11-notification", label: t("Section 11 Notification", "Section 11 Notification") },
  { id: "award-possession", label: t("Award / Possession", "Award / Possession") },
  { id: "proposed-alignment", label: t("Proposed Alignment", "Proposed Alignment") }
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



const cartoRasterStyle = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }
  },
  layers: [
    {
      id: 'esri-basemap',
      type: 'raster',
      source: 'esri'
    }
  ]
};

export function GISMap({ setActiveTab, showSidebar = false, profile, selectedState = "All States", selectedDistrict = "All Districts", isAutoSync = true, searchQuery = "", selectedProject = "All Projects", setSelectedProject, selectedStage = "All Stages", selectedCategory = "All Categories", selectedRisk = "All Risks" }: { showSidebar?: boolean, profile?: any, selectedState?: string, selectedDistrict?: string, isAutoSync?: boolean, searchQuery?: string, selectedProject?: string, setSelectedProject?: (proj: string) => void, selectedStage?: string, selectedCategory?: string, selectedRisk?: string, setActiveTab?: (tab: string) => void }) {
  const { t } = useTranslation();
  
  const [basemap, setBasemap] = useState<'carto' | 'satellite'>('carto');

  const satelliteStyle = {
    version: 8,
    sources: {
      esri: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri'
      }
    },
    layers: [{ id: 'satellite-basemap', type: 'raster', source: 'esri' }]
  };

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
      apiFetch(`/api/projects?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&stage=${encodeURIComponent(selectedStage || "All Stages")}&category=${encodeURIComponent(selectedCategory || "All Categories")}&risk=${encodeURIComponent(selectedRisk || "All Risks")}`)
        .then(r => r.json())
        .then(data => setProjectsList(data))
        .catch(err => console.error("Failed to load projects", err));
    }
  }, [showSidebar, selectedState, selectedDistrict, selectedStage, selectedCategory, selectedRisk]);

  const loadParcels = () => {
    apiFetch(`/api/parcels?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&project=${encodeURIComponent(selectedProject || "All Projects")}&stage=${encodeURIComponent(selectedStage || "All Stages")}&category=${encodeURIComponent(selectedCategory || "All Categories")}&risk=${encodeURIComponent(selectedRisk || "All Risks")}`)
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
             mapRef.current?.getMap()?.flyTo({ center: [lng, lat], zoom: 16 });
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
      apiFetch(`/api/gis/layers?projectId=${selectedProject}`)
        .then(res => res.json())
        .then(data => {
          setGisLayers(data);
          // Fit map to corridor
          if (data.projectCorridors?.features?.[0] && mapRef.current) {
            const bbox = turf.bbox(data.projectCorridors);
            if (bbox && bbox.length === 4) {
              mapRef.current?.getMap()?.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 40, duration: 1000 });
            }
          }
        })
        .catch(err => console.error("Failed to load gis layers", err));
    } else {
      setGisLayers(null);
      if (mapRef.current) {
        mapRef.current?.getMap()?.flyTo({ center: [78.9629, 20.5937], zoom: 4 });
      }
    }
  }, [selectedProject]);

  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

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

  
  const updateMeasurements = () => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const lastFeature = data.features[data.features.length - 1];
      let distance, area;
      if (lastFeature.geometry.type === 'LineString') {
        const length = turf.length(lastFeature, { units: 'kilometers' });
        distance = `${length.toFixed(2)} km`;
      } else if (lastFeature.geometry.type === 'Polygon') {
        const a = turf.area(lastFeature);
        area = `${(a / 10000).toFixed(2)} ha`;
      }
      setMeasurements({ distance, area });
    } else {
      setMeasurements(null);
    }
  };

  const onDrawUpdate = (e: any) => {
    updateMeasurements();
  };

  const handleDrawMode = (mode: string) => {
    if (drawRef.current) {
      drawRef.current.changeMode(mode);
      setActiveDrawMode(mode);
    }
  };

  const LayerPanelContent = () => (
    <>
      {CANONICAL_LAYERS_FN(t).map(layer => (
        <label key={layer.id} className="flex items-center justify-between cursor-pointer group">
           <span className="text-sm text-registry-ink group-hover:text-tilled-earth">{layer.label}</span>
           <div className={`w-10 h-5 rounded-full transition-colors relative ${visibleLayers[layer.id] ? 'bg-tilled-earth' : 'bg-gray-200'}`}>
             <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${visibleLayers[layer.id] ? 'left-6' : 'left-1'}`}></div>
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
            {selectedProject !== "All Projects" && gisLayers?.projectCorridors?.features?.[0] && (
              <div className="mt-4 p-3 bg-survey-paper/50 border border-graticule-teal/20 rounded-sm flex flex-col gap-2">
                <h5 className="text-xs font-semibold text-registry-ink">Footprint Analysis</h5>
                <div className="flex justify-between text-xs">
                  <span className="text-registry-ink/60">Estimated Area:</span>
                  <span className="font-medium text-registry-ink">
                    {projectsList.find(p => p.id === selectedProject)?.landRequirement || 0} ha
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-registry-ink/60">GIS Area:</span>
                  <span className="font-medium text-registry-ink">
                    {(turf.area(gisLayers.projectCorridors.features[0]) / 10000).toFixed(2)} ha
                  </span>
                </div>
                {(() => {
                  const est = parseFloat(projectsList.find(p => p.id === selectedProject)?.landRequirement) || 0;
                  const gis = turf.area(gisLayers.projectCorridors.features[0]) / 10000;
                  const diff = Math.abs(est - gis);
                  const pct = est > 0 ? (diff / est) * 100 : 0;
                  return pct > 10 ? (
                    <div className="text-[10px] text-alluvium-red font-medium mt-1 p-1 bg-alluvium-red/10 rounded-sm">
                      Warning: GIS footprint differs from estimate by {pct.toFixed(1)}%
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 relative h-full">
        <Map
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          initialViewState={{ longitude: 78.9629, latitude: 20.5937, zoom: 4 }}
          mapStyle={basemap === 'carto' ? (cartoRasterStyle as any) : (satelliteStyle as any)}
          interactiveLayerIds={['parcels-line', 'parcels-sec11-fill', 'parcels-award-fill', 'village-boundaries-fill', 'eco-zones-fill']}
          onMouseMove={onHover}
          onMouseLeave={() => setHoverInfo(null)}
          onClick={(e) => {
            const feature = e.features?.[0];
            if (feature?.properties) {
              setSelectedFeature(feature.properties);
            } else {
              setSelectedFeature(null);
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
            onDelete={onDrawUpdate} onSelectionChange={() => { onDrawUpdate(null); updateMeasurements(); }} onActionable={updateMeasurements}
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
            <div className="absolute bg-white p-3 rounded-sm shadow-lg border border-graticule-teal/20 text-xs pointer-events-none z-50 max-w-xs" style={{ left: hoverInfo.longitude, top: hoverInfo.latitude, transform: 'translate(10px, 10px)' }}>
              <div className="font-semibold mb-1 text-registry-ink border-b border-graticule-teal/10 pb-1">
                {hoverInfo.properties.ulpin ? `Parcel: ${hoverInfo.properties.ulpin}` : (hoverInfo.properties.village || hoverInfo.properties.name || t("Feature Details", "Feature Details"))}
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

        {/* Dynamic Legend */}
      <div className="absolute bottom-6 left-4 bg-white p-4 border border-graticule-teal/30 shadow-lg rounded-sm z-10">
        <h4 className="text-xs font-serif font-semibold text-registry-ink uppercase tracking-wider mb-3">{t('Map Legend', 'Map Legend')}</h4>
        <div className="flex flex-col gap-2">
          {CANONICAL_LAYERS_FN(t).filter(l => visibleLayers[l.id]).map(layer => {
            let color = '#ccc';
            let shape = 'square';
            if (layer.id === 'project-corridors') { color = '#D92D20'; shape = 'line'; }
            else if (layer.id === 'affected-parcels') { color = '#014A4E'; }
            else if (layer.id === 'revenue-village-boundaries') { color = '#F59E0B'; }
            else if (layer.id === 'eco-sensitive-zones') { color = '#22C55E'; }
            else if (layer.id === 'section-11-notification') { color = '#B44E23'; }
            else if (layer.id === 'award-possession') { color = '#014A4E'; }
            else if (layer.id === 'proposed-alignment') { color = '#3B82F6'; shape = 'line'; }
            
            return (
              <div key={layer.id} className="flex items-center gap-2">
                {shape === 'line' ? (
                  <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
                ) : (
                  <div className="w-3 h-3 rounded-sm opacity-60" style={{ backgroundColor: color }}></div>
                )}
                <span className="text-xs text-registry-ink">{layer.label}</span>
              </div>
            );
          })}
          {!Object.values(visibleLayers).some(v => v) && (
            <span className="text-xs text-registry-ink/50 italic">{t('No active layers', 'No active layers')}</span>
          )}
        </div>
      </div>

      {/* Floating Tools */}
        <div className="absolute top-4 left-4 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
          {!showSidebar && (
            <button onClick={() => setActiveTool(activeTool === 'layers' ? null : 'layers')} className={`p-2 transition-colors border-b border-graticule-teal/20 ${activeTool === 'layers' ? 'bg-graticule-teal/20 text-tilled-earth' : 'hover:bg-graticule-teal/10 text-registry-ink'}`} title="Layers">
              <Layers className="w-5 h-5" />
            </button>
          )}
          {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
            <button onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')} className={`p-2 transition-colors ${activeTool === 'draw' ? 'bg-graticule-teal/20 text-alluvium-red' : 'hover:bg-graticule-teal/10 text-registry-ink'}`} title="GIS Tools">
              <PenTool className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setBasemap(b => b === 'carto' ? 'satellite' : 'carto')} className="p-2 transition-colors hover:bg-graticule-teal/10 text-registry-ink" title="Toggle Basemap">
            <Globe className="w-5 h-5" />
          </button>
        </div>

        
        {activeTool === 'draw' && (
          <div className="absolute top-4 left-16 ml-2 bg-white border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col w-64">
            <div className="p-3 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-registry-ink">{t('GIS Tools', 'GIS Tools')}</h3>
              <button onClick={() => setActiveTool(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <button onClick={() => handleDrawMode('draw_polygon')} className={"text-left px-3 py-2 text-sm rounded " + (activeDrawMode === 'draw_polygon' ? 'bg-graticule-teal/20 text-tilled-earth font-medium' : 'hover:bg-graticule-teal/10 text-registry-ink')}>{t('Draw Polygon', 'Draw Polygon')}</button>
              <button onClick={() => handleDrawMode('draw_line_string')} className={"text-left px-3 py-2 text-sm rounded " + (activeDrawMode === 'draw_line_string' ? 'bg-graticule-teal/20 text-tilled-earth font-medium' : 'hover:bg-graticule-teal/10 text-registry-ink')}>{t('Measure Distance', 'Measure Distance')}</button>
              <button onClick={() => { if(drawRef.current) { drawRef.current.deleteAll(); setMeasurements(null); setActiveDrawMode(null); } }} className="text-left px-3 py-2 text-sm rounded hover:bg-alluvium-red/10 text-alluvium-red">{t('Clear', 'Clear')}</button>
              
              
              <hr className="border-graticule-teal/20 my-2" />
              
              <label className="text-left px-3 py-2 text-sm rounded hover:bg-graticule-teal/10 text-registry-ink cursor-pointer flex items-center gap-2">
                 <UploadCloud className="w-4 h-4" />
                 {t('Upload GeoJSON', 'Upload GeoJSON')}
                 <input type="file" className="hidden" accept=".geojson,.json" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                       try {
                          const json = JSON.parse(ev.target.result as string);
                          if(drawRef.current) {
                             drawRef.current.add(json);
                          }
                       } catch(err) {
                          alert(t('Invalid GeoJSON', 'Invalid GeoJSON'));
                       }
                    };
                    reader.readAsText(file);
                 }} />
              </label>
              
              <button onClick={async () => {

                if(!drawRef.current) return;
                const data = drawRef.current.getAll();
                if(data.features.length === 0) return;
                const feat = data.features[data.features.length - 1];
                if(feat.geometry.type !== 'Polygon') {
                  alert(t('Only polygons can be saved as parcels.', 'Only polygons can be saved as parcels.'));
                  return;
                }
                const area = (turf.area(feat) / 10000).toFixed(2) + ' ha';
                
                try {
                  const url = feat.properties?.parcelId ? "/api/parcels/" + feat.properties.parcelId : "/api/parcels";
                  const method = feat.properties?.parcelId ? "PUT" : "POST";
                  
                  const res = await window.fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem('bhoomi_token') },
                    body: JSON.stringify({
                      projectId: selectedProject !== "All Projects" ? selectedProject : undefined,
                      geometry: feat.geometry,
                      area
                    })
                  });
                  if(res.ok) {
                    drawRef.current.deleteAll();
                    setMeasurements(null);
                    loadParcels();
                    setActiveTool(null);
                  } else {
                    alert(t('Error saving parcel', 'Error saving parcel'));
                  }
                } catch(e) { console.error(e); }
              }} className="px-3 py-2 bg-graticule-teal text-white rounded text-sm font-medium hover:bg-tilled-earth">{t('Save Parcel', 'Save Parcel')}</button>
            </div>
          </div>
        )}

        {/* Floating Layers Panel */}
        {!showSidebar && activeTool === 'layers' && (
          <div className="absolute top-4 left-16 ml-2 bg-white w-64 border border-graticule-teal/30 shadow-md rounded-sm z-10 flex flex-col">
            <div className="p-3 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center">
              <h3 className="font-serif font-semibold text-registry-ink">{t('Layers', 'Layers')}</h3>
              <button onClick={() => setActiveTool(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 space-y-3">
              <LayerPanelContent />
            </div>
          </div>
        )}

        
      {/* Right Details Panel */}
      {/* Right Details Panel */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 bg-white w-80 border border-graticule-teal/30 shadow-lg rounded-sm z-10 flex flex-col max-h-[calc(100%-2rem)] overflow-hidden">
          <div className="p-4 border-b border-graticule-teal/20 bg-survey-paper/50 flex justify-between items-center shrink-0">
            <h3 className="font-serif font-semibold text-registry-ink truncate mr-2">
              {selectedFeature.ulpin ? `ULPIN: ${selectedFeature.ulpin}` : (selectedFeature.village || selectedFeature.name || t("Feature Details", "Feature Details"))}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => {
                 const feat = parcels?.features?.find((f:any) => 
                   (f.properties.ulpin && f.properties.ulpin === selectedFeature.ulpin) || 
                   (f.properties.parcelId && f.properties.parcelId === selectedFeature.parcelId)
                 );
                 if (feat && mapRef.current) {
                   mapRef.current?.getMap()?.fitBounds([[turf.bbox(feat)[0], turf.bbox(feat)[1]], [turf.bbox(feat)[2], turf.bbox(feat)[3]]], { padding: 40, duration: 1000 });
                 }
              }} className="text-graticule-teal hover:text-tilled-earth" title="Fit to Parcel"><MapPin className="w-4 h-4" /></button>
              <button onClick={() => setSelectedFeature(null)} className="text-registry-ink/50 hover:text-alluvium-red"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-0 overflow-y-auto">
             {selectedFeature.ulpin || selectedFeature.parcelId ? (
                <div className="flex flex-col">
                   <div className="grid grid-cols-2 gap-x-2 gap-y-3 p-4 border-b border-graticule-teal/10">
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Parcel ID</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.parcelId || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Project ID</span><span className="text-sm font-medium text-registry-ink truncate" title={selectedFeature.projectId}>{selectedFeature.projectId || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">State</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.state || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">District</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.district || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Village</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.village || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Survey No.</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.surveyNumber || '-'}</span></div>
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Area</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.area || '-'}</span></div>
                   </div>
                   <div className="flex flex-col p-4 bg-survey-paper/20 gap-3">
                     <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Acquisition Stage</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.stage || '-'}</span></div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Section 11</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.sec11 || '-'}</span></div>
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Award</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.award || '-'}</span></div>
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Possession</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.possession || '-'}</span></div>
                       <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-registry-ink/50">Compensation</span><span className="text-sm font-medium text-registry-ink">{selectedFeature.compensationStatus || '-'}</span></div>
                     </div>
                   
                   <div className="p-3 bg-white border-t border-graticule-teal/20 grid grid-cols-2 gap-2">
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('dashboard'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Dashboard', 'View Dashboard')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('proposals'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Workflow', 'View Workflow')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('compensation'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Compensation', 'View Compensation')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('rr'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View R&R', 'View R&R')}</button>
                     <button onClick={() => { if(setActiveTab) { setSelectedProject && setSelectedProject(selectedFeature.projectId || 'All Projects'); setActiveTab('documents'); } }} className="text-xs py-1.5 bg-graticule-teal/10 text-graticule-teal rounded hover:bg-graticule-teal/20">{t('View Documents', 'View Documents')}</button>
                     {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
                       <button onClick={() => {
                          const feat = parcels?.features?.find((f:any) => 
                            (f.properties.ulpin && f.properties.ulpin === selectedFeature.ulpin) || 
                            (f.properties.parcelId && f.properties.parcelId === selectedFeature.parcelId)
                          );
                          if (feat && drawRef.current) {
                             drawRef.current.add(feat);
                             setActiveTool('draw');
                             setSelectedFeature(null);
                          }
                       }} className="text-xs py-1.5 bg-tilled-earth/10 text-tilled-earth rounded hover:bg-tilled-earth/20">{t('Edit Geometry', 'Edit Geometry')}</button>
                     )}
                     {profile?.role !== 'Auditor' && profile?.role !== 'Affected Citizen' && (
                       <button onClick={async () => {
                         if (confirm("Are you sure you want to delete this parcel?")) {
                           try {
                             const res = await window.fetch("/api/parcels/" + selectedFeature.parcelId, {
                               method: "DELETE",
                               headers: { "Authorization": "Bearer " + localStorage.getItem('bhoomi_token') }
                             });
                             if (res.ok) {
                               loadParcels();
                               setSelectedFeature(null);
                             } else alert("Unauthorized or error deleting parcel");
                           } catch (err) { console.error(err); }
                         }
                       }} className="text-xs py-1.5 bg-alluvium-red/10 text-alluvium-red rounded hover:bg-alluvium-red/20">{t('Delete Parcel', 'Delete')}</button>
                     )}
                   </div>
                </div>
                </div>
             ) : (
                <div className="p-4 space-y-4">
                  {Object.entries(selectedFeature).map(([key, value]) => {
                    if (key === 'id') return null;
                    return (
                      <div key={key} className="flex flex-col gap-1 border-b border-graticule-teal/10 pb-2 last:border-0">
                        <span className="text-xs text-registry-ink/60 uppercase tracking-wide">{key}</span>
                        <span className="font-medium text-registry-ink break-words">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
             )}
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
