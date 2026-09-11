import fs from 'fs';
let code = fs.readFileSync('src/components/Map.tsx', 'utf8');

code = code.replace(
  'const CANONICAL_LAYERS = [',
  'const CANONICAL_LAYERS_FN = (t: any) => ['
);

code = code.replace(
  '{ id: "project-corridors", label: "Project Corridors" },',
  '{ id: "project-corridors", label: t("Project Corridors", "Project Corridors") },'
);
code = code.replace(
  '{ id: "affected-parcels", label: "Affected Parcels" },',
  '{ id: "affected-parcels", label: t("Affected Parcels", "Affected Parcels") },'
);
code = code.replace(
  '{ id: "revenue-village-boundaries", label: "Revenue Village Boundaries" },',
  '{ id: "revenue-village-boundaries", label: t("Revenue Village Boundaries", "Revenue Village Boundaries") },'
);
code = code.replace(
  '{ id: "eco-sensitive-zones", label: "Eco-Sensitive Zones" },',
  '{ id: "eco-sensitive-zones", label: t("Eco-Sensitive Zones", "Eco-Sensitive Zones") },'
);
code = code.replace(
  '{ id: "section-11-notification", label: "Section 11 Notification" },',
  '{ id: "section-11-notification", label: t("Section 11 Notification", "Section 11 Notification") },'
);
code = code.replace(
  '{ id: "award-possession", label: "Award / Possession" },',
  '{ id: "award-possession", label: t("Award / Possession", "Award / Possession") },'
);
code = code.replace(
  '{ id: "proposed-alignment", label: "Proposed Alignment" }\n];',
  '{ id: "proposed-alignment", label: t("Proposed Alignment", "Proposed Alignment") }\n];'
);

code = code.replace(/CANONICAL_LAYERS\.map/g, 'CANONICAL_LAYERS_FN(t).map');
code = code.replace(/CANONICAL_LAYERS\.filter/g, 'CANONICAL_LAYERS_FN(t).filter');

fs.writeFileSync('src/components/Map.tsx', code);
console.log("Patched Map CANONICAL_LAYERS");
