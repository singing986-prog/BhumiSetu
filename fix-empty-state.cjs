const fs = require('fs');
let content = fs.readFileSync('src/components/Map.tsx', 'utf8');

// The user requested empty state if parcels are empty.
// We should check if we actually fetch parcels
content = content.replace(
  '{/* Parcels Data Source */}',
  `{parcels && parcels.features.length === 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-survey-paper/80 backdrop-blur-sm">
          <div className="text-registry-ink mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-xl font-serif font-semibold text-center text-registry-ink">No parcels geo-tagged yet</h3>
            <p className="text-center text-registry-ink/70 mt-2">Draw the first boundary or import GIS layers to begin.</p>
          </div>
          <button className="px-6 py-2 bg-registry-ink text-survey-paper rounded-sm hover:bg-registry-ink/90 transition-colors font-medium text-sm">
            Import GIS Layers
          </button>
        </div>
      )}
      {/* Parcels Data Source */}`
);

fs.writeFileSync('src/components/Map.tsx', content);
