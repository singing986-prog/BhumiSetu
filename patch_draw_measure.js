import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

const drawSelectionChange = `
  const updateMeasurements = () => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const lastFeature = data.features[data.features.length - 1];
      let distance, area;
      if (lastFeature.geometry.type === 'LineString') {
        const length = turf.length(lastFeature, { units: 'kilometers' });
        distance = \`\${length.toFixed(2)} km\`;
      } else if (lastFeature.geometry.type === 'Polygon') {
        const a = turf.area(lastFeature);
        area = \`\${(a / 10000).toFixed(2)} ha\`;
      }
      setMeasurements({ distance, area });
    } else {
      setMeasurements(null);
    }
  };

  const onDrawUpdate = (e: any) => {
    updateMeasurements();
  };
`;

code = code.replace(/const onDrawUpdate = \(e: any\) => \{[\s\S]*?\n\s{2}\};\n/, drawSelectionChange);
code = code.replace('onUpdate={onDrawUpdate}', 'onUpdate={onDrawUpdate} onSelectionChange={updateMeasurements} onActionable={updateMeasurements}');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map draw measure logic");
