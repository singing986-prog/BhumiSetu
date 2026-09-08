const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// I will just use a regex to clean up any duplicate or orphaned braces around /api/parcels
content = content.replace(
  `      slaBreaches: Math.round(totalProjects * 0.8)
    });
  });
  });
    
  // replace the old one
  app.get("/api/parcels"`,
  `      slaBreaches: Math.round(totalProjects * 0.8)
    });
  });
  app.get("/api/parcels"`
);

// We should find where the old /api/parcels ends.
// Let's just fix the whole file layout around this area.
