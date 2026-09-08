const fs = require('fs');

const customStyles = `
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
`;

let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

if (!content.includes('drawStyles')) {
  // insert before DrawControl
  const drawControlIndex = content.indexOf('function DrawControl(props: any)');
  content = content.slice(0, drawControlIndex) + customStyles + '\n' + content.slice(drawControlIndex);
}

// Modify the MapboxDraw initialization to use this style
content = content.replace(
  /\(\) => new MapboxDraw\(props\),/,
  '() => new MapboxDraw({ ...props, styles: drawStyles }),'
);

fs.writeFileSync('src/components/Map.tsx', content);
